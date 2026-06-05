from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, status, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
import io
import json
import os
from pypdf import PdfReader
from dotenv import load_dotenv
from google import genai
from google.genai import types

import models
from database import engine, get_db
import auth

load_dotenv()
client = genai.Client()

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Health check endpoint
@app.get("/")
def read_root():
    return {"status": "ForgeTrack API is running"}

# Set up CORS middleware
origins_env = os.getenv("ALLOWED_ORIGINS", "")
origins = [origin.strip() for origin in origins_env.split(",") if origin.strip()] or [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze-resume")
async def analyze_resume(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user), x_gemini_api_key: Optional[str] = Header(None)):
    try:
        api_key = x_gemini_api_key or os.getenv("GEMINI_API_KEY")
        contents = await file.read()
        
        pdf_file = io.BytesIO(contents)
        reader = PdfReader(pdf_file)
        
        extracted_text = ""
        for page in reader.pages:
            extracted_text += page.extract_text() or ""
            
        prompt = f"""You are an expert tech recruiter. Analyze the following resume text. Return a JSON object with exactly three keys: 'skills_detected' (list of strings), 'critical_gaps' (list of strings), and 'recommended_actions' (list of strings).
        
Resume Text:
{extracted_text}
"""
        
        if api_key and api_key.startswith("gsk_"):
            from groq import Groq
            groq_client = Groq(api_key=api_key)
            
            models_to_try = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192"]
            chat_completion = None
            last_err = None
            for model_name in models_to_try:
                try:
                    chat_completion = groq_client.chat.completions.create(
                        messages=[
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        model=model_name,
                        response_format={"type": "json_object"},
                        temperature=0.2,
                        max_tokens=1000,
                    )
                    break
                except Exception as e:
                    last_err = e
                    continue
            
            if not chat_completion:
                raise Exception(f"Failed to analyze PDF with Groq: {str(last_err)}")
                
            analysis_result = json.loads(chat_completion.choices[0].message.content)
        else:
            request_client = genai.Client(api_key=api_key)
            response = request_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                ),
            )
            analysis_result = json.loads(response.text)
        
        # Save to database
        db_resume = models.Resume(
            user_id=current_user.id,
            filename=file.filename,
            raw_text=extracted_text,
            analysis_json=analysis_result
        )
        db.add(db_resume)
        db.commit()
        db.refresh(db_resume)
            
        return {
            "status": "success",
            "filename": file.filename,
            "analysis": analysis_result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze PDF: {str(e)}")

class ChatRequest(BaseModel):
    session_id: str
    message: str
    user_id: Optional[int] = None

@app.post("/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user), x_gemini_api_key: Optional[str] = Header(None)):
    try:
        api_key = x_gemini_api_key or os.getenv("GEMINI_API_KEY")
        request.user_id = current_user.id
        
        # Save user message
        user_msg = models.ChatMessage(
            session_id=request.session_id,
            user_id=request.user_id,
            sender="user",
            text=request.message
        )
        db.add(user_msg)
        db.commit()

        # Retrieve chat history
        history_msgs = db.query(models.ChatMessage).filter(models.ChatMessage.session_id == request.session_id).order_by(models.ChatMessage.timestamp.asc()).all()
        
        current_message = request.message
        
        # INTERVENTION ORCHESTRATION LOGIC
        if request.user_id is not None:
            stagnation_report = get_user_stagnation_report(request.user_id, db)
            stagnant_nodes = stagnation_report.get("stagnant_nodes", [])
            
            recent_stuck_logs = db.query(models.ActivityLog).filter(
                models.ActivityLog.user_id == request.user_id,
                models.ActivityLog.event_type == "task_stuck_clicked"
            ).order_by(models.ActivityLog.timestamp.desc()).limit(1).all()
            
            is_stuck = False
            task_name = "this task"
            skill_name = "the required area"
            
            if recent_stuck_logs and recent_stuck_logs[0].timestamp >= datetime.now(timezone.utc) - timedelta(minutes=15):
                is_stuck = True
                meta = recent_stuck_logs[0].metadata_json or {}
                node_data = meta.get("node_data", {})
                label = node_data.get("label", "")
                if label:
                    task_name = label.split("\n")[0] # first line is title
                    import re
                    match = re.search(r"Practice (.*?) here", label)
                    if match:
                        skill_name = match.group(1)
            elif stagnant_nodes:
                is_stuck = True
                task_name = str(stagnant_nodes[-1]["node_id"])
                
            if is_stuck:
                intervention = f"The Shadow Auditor detects that the user is currently struggling with {task_name} due to a missing skill in {skill_name}. Do not wait for them to ask. Begin your chat response by acknowledging this directly with a brief, warm supportive message, and offer a concrete, 3-line starter code snippet or quick resource to break their block.\n\n"
                current_message = intervention + current_message

        # Fetch user's latest resume analysis if available to inject as system instructions or context
        system_instruction = "You are an expert tech recruiter and career coach. Help the user build their engineering project, address skill gaps, and improve their technical profile."
        if request.user_id is not None:
            latest_resume = db.query(models.Resume).filter(models.Resume.user_id == request.user_id).order_by(models.Resume.uploaded_at.desc()).first()
            if latest_resume and latest_resume.analysis_json:
                analysis = latest_resume.analysis_json
                skills = ", ".join(analysis.get("skills_detected", []))
                gaps = ", ".join(analysis.get("critical_gaps", []))
                actions = ", ".join(analysis.get("recommended_actions", []))
                
                system_instruction += f"""\n\nHere is the user's analyzed resume profile:
- File Name: {latest_resume.filename}
- Detected Skills: {skills}
- Critical Gaps: {gaps}
- Recommended Actions: {actions}

Use this context to tailor your advice, answer technical questions, explain how to address the gaps, and provide project suggestions or code snippets. Keep your tone supportive, technical, and actionable. Do not mention that you received this information as a system prompt; behave as if you naturally have access to their profile and parsed resume."""

        # Groq vs Gemini routing logic
        if api_key and api_key.startswith("gsk_"):
            from groq import Groq
            groq_client = Groq(api_key=api_key)
            
            groq_messages = []
            if system_instruction:
                groq_messages.append({"role": "system", "content": system_instruction})
                
            for msg in history_msgs[:-1]:
                role = "user" if msg.sender == "user" else "assistant"
                groq_messages.append({"role": role, "content": msg.text})
            groq_messages.append({"role": "user", "content": current_message})
            
            models_to_try = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192"]
            chat_completion = None
            last_err = None
            for model_name in models_to_try:
                try:
                    chat_completion = groq_client.chat.completions.create(
                        messages=groq_messages,
                        model=model_name,
                        temperature=0.7,
                        max_tokens=1000,
                    )
                    break
                except Exception as e:
                    last_err = e
                    continue
            
            if not chat_completion:
                raise Exception(f"Failed to generate chat completion with Groq: {str(last_err)}")
                
            response_text = chat_completion.choices[0].message.content
        else:
            request_client = genai.Client(api_key=api_key)
            history = []
            for msg in history_msgs[:-1]: # exclude the current one we just added
                role = "user" if msg.sender == "user" else "model"
                history.append({"role": role, "parts": [{"text": msg.text}]})
                
            chat_session = request_client.chats.create(
                model="gemini-2.5-flash", 
                history=history,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction
                )
            )
            response = chat_session.send_message(current_message)
            response_text = response.text
        
        # Save AI message
        ai_msg = models.ChatMessage(
            session_id=request.session_id,
            user_id=request.user_id,
            sender="ai",
            text=response_text
        )
        db.add(ai_msg)
        db.commit()
        
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class NodeData(BaseModel):
    title: str = Field(description="Short phase name (max 4 words)")
    description: str = Field(description="Brief summary of the phase (max 6 words, no paragraph/sentences)")
    nodeType: str = Field(description="Type of the node: general, database, api, or frontend")
    steps: List[str] = Field(description="Exactly 3 very short, action-oriented steps (max 5 words each)")
    isSkillUp: bool = Field(description="Set to true if this phase matches any listed skill gaps, false otherwise")

class LLMNode(BaseModel):
    id: str = Field(description="node-1, node-2, etc. in sequence")
    data: NodeData

class LLMEdge(BaseModel):
    id: str
    source: str
    target: str

class LLMBlueprintResponse(BaseModel):
    nodes: List[LLMNode]
    edges: List[LLMEdge]

class BlueprintRequest(BaseModel):
    idea_description: str
    critical_gaps: Optional[List[str]] = None

@app.post("/generate-blueprint")
async def generate_blueprint(request: BlueprintRequest, current_user: models.User = Depends(auth.get_current_user), x_gemini_api_key: Optional[str] = Header(None)):
    try:
        api_key = x_gemini_api_key or os.getenv("GEMINI_API_KEY")
        
        if api_key and api_key.startswith("gsk_"):
            from groq import Groq
            groq_client = Groq(api_key=api_key)
            
            gaps_instruction = ""
            if request.critical_gaps:
                gaps_list_str = ", ".join(request.critical_gaps[:5])  # cap at 5 gaps
                gaps_instruction = f"\nSkill gaps to flag: [{gaps_list_str}]. Set isSkillUp=true on matching nodes."

            prompt = f"""Break this project idea into at most 6 sequential engineering phases.
Project Idea: {request.idea_description}{gaps_instruction}

Keep all texts extremely brief. Under 6 words for description, under 4 words for title, and under 5 words per step. Avoid full sentences or paragraphs. Fast and concise.

You MUST return a JSON object with exactly two top-level keys: "nodes" and "edges".
JSON Schema requirements:
- "nodes": list of objects. Each object has:
  - "id": string (e.g. "node-1", "node-2", etc. in sequence)
  - "data": object with:
    - "title": Short phase name (max 4 words)
    - "description": Brief summary of the phase (max 6 words, no paragraph/sentences)
    - "nodeType": Type of the node, must be one of: "general", "database", "api", "frontend"
    - "steps": List of exactly 3 very short, action-oriented step strings (max 5 words each)
    - "isSkillUp": boolean (true if this phase matches any listed skill gaps, false otherwise)
- "edges": list of objects. Each object has:
  - "id": string
  - "source": string (id of source node)
  - "target": string (id of target node)
"""
            # Try multiple models if one is not available
            models_to_try = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192"]
            chat_completion = None
            last_err = None
            for model_name in models_to_try:
                try:
                    chat_completion = groq_client.chat.completions.create(
                        messages=[
                            {
                                "role": "user",
                                "content": prompt,
                            }
                        ],
                        model=model_name,
                        response_format={"type": "json_object"},
                        temperature=0.2,
                        max_tokens=600,
                    )
                    break
                except Exception as e:
                    last_err = e
                    continue
            
            if not chat_completion:
                raise Exception(f"Failed to generate content with Groq: {str(last_err)}")
                
            blueprint_data = json.loads(chat_completion.choices[0].message.content)
            
            # Normalize keys to camelCase for frontend compatibility
            for node in blueprint_data.get("nodes", []):
                data_dict = node.get("data", {})
                if "node_type" in data_dict and "nodeType" not in data_dict:
                    data_dict["nodeType"] = data_dict.pop("node_type")
                if "is_skill_up" in data_dict and "isSkillUp" not in data_dict:
                    data_dict["isSkillUp"] = data_dict.pop("is_skill_up")
        else:
            request_client = genai.Client(api_key=api_key)

            gaps_instruction = ""
            if request.critical_gaps:
                gaps_list_str = ", ".join(request.critical_gaps[:5])  # cap at 5 gaps
                gaps_instruction = f"\nSkill gaps to flag: [{gaps_list_str}]. Set isSkillUp=true on matching nodes."

            prompt = f"""Break this project idea into at most 6 sequential engineering phases.
Project Idea: {request.idea_description}{gaps_instruction}

Keep all texts extremely brief. Under 6 words for description, under 4 words for title, and under 5 words per step. Avoid full sentences or paragraphs. Fast and concise."""

            response = request_client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=LLMBlueprintResponse,
                    max_output_tokens=600,
                    temperature=0.2,
                ),
            )
            
            blueprint_data = json.loads(response.text)
        
        # Enrich nodes programmatically with visual details (type and position)
        for index, node in enumerate(blueprint_data.get("nodes", [])):
            node["type"] = "blueprintNode"
            node["position"] = {"x": 250, "y": index * 180}
            
        # Enrich edges programmatically with animated detail if needed
        for edge in blueprint_data.get("edges", []):
            if "animated" not in edge:
                edge["animated"] = True
                
        return blueprint_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class AuditLogRequest(BaseModel):
    user_id: Optional[int] = None
    event_type: str
    metadata_json: Optional[Dict[str, Any]] = None

@app.post("/audit/log")
async def log_activity(request: AuditLogRequest, db: Session = Depends(get_db)):
    try:
        activity = models.ActivityLog(
            user_id=request.user_id,
            event_type=request.event_type,
            metadata_json=request.metadata_json
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return {"status": "success", "log_id": activity.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/audit/logs")
async def get_logs(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    try:
        logs = db.query(models.ActivityLog).filter(
            models.ActivityLog.user_id == current_user.id
        ).order_by(models.ActivityLog.timestamp.desc()).limit(20).all()
        return [
            {
                "id": log.id,
                "event_type": log.event_type,
                "metadata_json": log.metadata_json,
                "timestamp": log.timestamp.isoformat()
            } for log in logs
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_user_stagnation_report(user_id: int, db: Session):
    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    
    logs = db.query(models.ActivityLog).filter(
        models.ActivityLog.user_id == user_id,
        models.ActivityLog.timestamp >= seven_days_ago
    ).order_by(models.ActivityLog.timestamp.asc()).all()
    
    node_views = {}
    node_updates = set()
    
    for log in logs:
        meta = log.metadata_json or {}
        node_id = meta.get("node_id")
        if not node_id:
            continue
            
        if log.event_type == "view_node":
            node_views[node_id] = log.timestamp
        elif log.event_type in ["chat_update", "code_update", "task_completed"]:
            node_updates.add(node_id)
            
    stagnant_nodes = []
    for node_id, view_time in node_views.items():
        if node_id not in node_updates:
            stagnant_nodes.append({
                "node_id": node_id,
                "last_viewed": view_time
            })
            
    return {"user_id": user_id, "stagnant_nodes": stagnant_nodes}

class UserCreate(BaseModel):
    email: str
    password: str

@app.post("/auth/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, password_hash=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@app.post("/auth/token")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}
