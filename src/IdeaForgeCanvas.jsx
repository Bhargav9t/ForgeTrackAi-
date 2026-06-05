import React, { useState, useCallback, useEffect } from 'react';
import { API_BASE_URL, GEMINI_API_KEY } from './config';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Share2, 
  AlertCircle, 
  Sparkles, 
  HelpCircle, 
  Activity, 
  Plus, 
  Trash2, 
  Download, 
  LayoutGrid, 
  RefreshCw,
  CheckCircle2,
  Play,
  Circle,
  AlertTriangle,
  X,
  Link2,
  ArrowRight,
  Database,
  Cpu,
  Monitor,
  Layers
} from 'lucide-react';

// Custom Node Component for React Flow
const CustomBlueprintNode = ({ id, data, selected }) => {
  const { title, description, status = 'todo', isSkillUp, steps = [], nodeType = 'general' } = data;
  const { setNodes } = useReactFlow();

  let statusBorderClass = 'border-slate-200 dark:border-white/5 bg-white dark:bg-[#0e0e16]/90 text-slate-800 dark:text-gray-150';
  let statusDotColor = 'bg-gray-500';
  let statusIcon = <Circle className="w-3 h-3 text-gray-500" />;
  let glowStyle = '';
  
  if (status === 'completed') {
    statusBorderClass = 'border-emerald-200 dark:border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.1)] text-emerald-805 dark:text-emerald-300';
    statusDotColor = 'bg-emerald-400';
    statusIcon = <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
  } else if (status === 'in_progress') {
    statusBorderClass = 'border-indigo-200 dark:border-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.2)] text-indigo-805 dark:text-indigo-300';
    statusDotColor = 'bg-indigo-400';
    statusIcon = <Play className="w-3 h-3 text-indigo-600 dark:text-indigo-400 fill-indigo-600/10 dark:fill-indigo-400/20 animate-pulse" />;
    glowStyle = 'after:absolute after:inset-0 after:rounded-2xl after:border after:border-indigo-500/20 after:animate-ping after:pointer-events-none';
  } else if (status === 'blocked') {
    statusBorderClass = 'border-rose-200 dark:border-rose-500/40 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm dark:shadow-[0_0_15px_rgba(244,63,94,0.1)] text-rose-805 dark:text-rose-350';
    statusDotColor = 'bg-rose-400';
    statusIcon = <AlertTriangle className="w-3 h-3 text-rose-605 dark:text-rose-400" />;
  }
  
  const skillUpRing = isSkillUp ? 'ring-1 ring-pink-500/40 shadow-[0_0_20px_rgba(219,39,119,0.15)]' : '';

  let typeIcon = <Layers className="w-2.5 h-2.5 text-slate-500 dark:text-gray-400" />;
  let typeBadgeStyle = 'bg-slate-100 dark:bg-white/[0.04] text-slate-650 dark:text-gray-400 border border-slate-200 dark:border-white/5';
  
  if (nodeType === 'database') {
    typeIcon = <Database className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />;
    typeBadgeStyle = 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20';
  } else if (nodeType === 'api') {
    typeIcon = <Cpu className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />;
    typeBadgeStyle = 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-500/20';
  } else if (nodeType === 'frontend') {
    typeIcon = <Monitor className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />;
    typeBadgeStyle = 'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-500/20';
  }

  const handleToggleStep = (stepIndex, e) => {
    e.stopPropagation();
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === id) {
          const updatedSteps = (node.data.steps || []).map((step, idx) => {
            if (idx === stepIndex) {
              return { ...step, completed: !step.completed };
            }
            return step;
          });
          
          // Auto status update
          const totalSteps = updatedSteps.length;
          const completedSteps = updatedSteps.filter(s => s.completed).length;
          let updatedStatus = node.data.status || 'todo';
          
          if (totalSteps > 0) {
            if (completedSteps === totalSteps) {
              updatedStatus = 'completed';
            } else if (completedSteps > 0) {
              updatedStatus = 'in_progress';
            } else if (updatedStatus === 'completed' || updatedStatus === 'in_progress') {
              updatedStatus = 'todo';
            }
          }

          return {
            ...node,
            data: {
              ...node.data,
              steps: updatedSteps,
              status: updatedStatus
            }
          };
        }
        return node;
      })
    );
  };

  return (
    <div className={`relative px-4 py-3.5 rounded-2xl border text-left min-w-[210px] max-w-[240px] transition-all duration-300 ${statusBorderClass} ${skillUpRing} ${selected ? 'border-indigo-500 ring-2 ring-indigo-500/20 scale-[1.02]' : 'hover:border-slate-350 dark:hover:border-white/20'} ${glowStyle}`}>
      {/* Target port (Input) on Top */}
      <Handle 
        type="target" 
        position={Position.Top} 
        style={{ background: 'rgba(99, 102, 241, 0.6)', width: 8, height: 8, border: '1px solid #1e1b4b' }} 
      />
      
      <div className="flex flex-col space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold tracking-wider text-slate-500 dark:text-gray-500 uppercase flex items-center gap-1.5">
            {statusIcon}
            {status.replace('_', ' ')}
          </span>
          <div className="flex items-center gap-1">
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase ${typeBadgeStyle}`}>
              {typeIcon}
              {nodeType}
            </span>
            {isSkillUp && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase bg-pink-500/20 text-pink-400 border border-pink-500/30 animate-pulse">
                <Sparkles className="w-2.5 h-2.5" />
                Skill Up
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          <h4 className="text-[11px] font-extrabold text-slate-900 dark:text-white leading-normal line-clamp-2">{title}</h4>
          {description && (
            <p className="text-[10px] text-slate-600 dark:text-gray-400 leading-relaxed line-clamp-3 font-medium">{description}</p>
          )}
        </div>

        {/* Steps Checklist inside Node Card */}
        {steps && steps.length > 0 && (
          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-white/5 space-y-1.5">
            <div className="flex justify-between items-center text-[8px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
              <span>Steps Progress</span>
              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-mono">
                {steps.filter(s => s.completed).length}/{steps.length}
              </span>
            </div>
            <ul className="space-y-1 max-h-[140px] overflow-y-auto pr-1">
              {steps.map((step, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-2 text-[9px] text-slate-700 dark:text-gray-300 leading-normal hover:text-slate-955 dark:hover:text-white transition-colors"
                  onClick={(e) => handleToggleStep(idx, e)}
                >
                  <input 
                    type="checkbox"
                    checked={!!step.completed}
                    onChange={(e) => handleToggleStep(idx, e)}
                    className="mt-0.5 w-3 h-3 rounded bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-indigo-600 focus:ring-indigo-500/50 cursor-pointer"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className={`flex-1 select-none cursor-pointer ${step.completed ? 'line-through text-slate-400 dark:text-gray-500' : ''}`}>
                    {step.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Source port (Output) on Bottom */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        style={{ background: 'rgba(99, 102, 241, 0.6)', width: 8, height: 8, border: '1px solid #1e1b4b' }} 
      />
    </div>
  );
};

const nodeTypes = {
  blueprintNode: CustomBlueprintNode,
};

const IdeaForgeCanvas = ({ criticalGaps = [], theme }) => {
  const [ideaDescription, setIdeaDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);

  const activeSelectedNode = selectedNode ? nodes.find(n => n.id === selectedNode.id) : null;

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('forgetrack_blueprint');
    if (saved) {
      try {
        const { savedNodes, savedEdges, savedIdea } = JSON.parse(saved);
        if (savedNodes && savedNodes.length > 0) {
          setNodes(savedNodes);
        }
        if (savedEdges) {
          setEdges(savedEdges);
        }
        if (savedIdea) {
          setIdeaDescription(savedIdea);
        }
      } catch (e) {
        console.error('Failed to load saved blueprint:', e);
      }
    }
  }, [setNodes, setEdges]);

  // Sync to localStorage on update
  useEffect(() => {
    if (nodes.length > 0) {
      localStorage.setItem('forgetrack_blueprint', JSON.stringify({
        savedNodes: nodes,
        savedEdges: edges,
        savedIdea: ideaDescription
      }));
    }
  }, [nodes, edges, ideaDescription]);

  const logUserActivity = async (eventType, metadata) => {
    try {
      await fetch(`${API_BASE_URL}/audit/log`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          event_type: eventType,
          metadata_json: metadata,
        }),
      });
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  };

  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    logUserActivity('view_node', {
      node_id: node.id,
      title: node.data.title || node.data.label,
      is_skill_up: !!node.data.isSkillUp
    });
  }, []);

  const onEdgeClick = useCallback((event, edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const onConnect = useCallback((connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      id: `edge-${connection.source}-${connection.target}`,
      animated: true,
      style: { stroke: 'rgba(99, 102, 241, 0.4)', strokeWidth: 1.5 }
    }, eds));
  }, [setEdges]);

  const handleForgeBlueprint = async (e) => {
    e.preventDefault();
    if (!ideaDescription.trim()) return;

    setLoading(true);
    setError(null);
    setSelectedNode(null);
    setSelectedEdge(null);

    try {
      const response = await fetch(`${API_BASE_URL}/generate-blueprint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          ...(GEMINI_API_KEY ? { 'X-Gemini-API-Key': GEMINI_API_KEY } : {})
        },
        body: JSON.stringify({ 
          idea_description: ideaDescription,
          critical_gaps: criticalGaps.length > 0 ? criticalGaps : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate blueprint');
      }

      const data = await response.json();
      
      if (data.nodes && data.edges) {
        const themedNodes = data.nodes.map((node, index) => {
          const isSkillUp = node.data.isSkillUp || false;
          const title = node.data.title || 'Engineering Step';
          const description = node.data.description || '';
          const nodeType = node.data.nodeType || 'general';
          const rawSteps = node.data.steps || [];
          
          const steps = rawSteps.map(s => typeof s === 'string' ? { text: s, completed: false } : s);

          return {
            ...node,
            type: 'blueprintNode',
            data: {
              ...node.data,
              title: title,
              description: description,
              status: 'todo',
              isSkillUp: isSkillUp,
              nodeType: nodeType,
              steps: steps,
              label: title + (description ? `\n${description}` : '')
            }
          };
        });

        // Add standard styled edges
        const themedEdges = data.edges.map(edge => ({
          ...edge,
          style: { stroke: 'rgba(99, 102, 241, 0.4)', strokeWidth: 1.5 },
          animated: true
        }));

        setNodes(themedNodes);
        setEdges(themedEdges);
        logUserActivity('forge_blueprint', { description: ideaDescription });
      } else {
        throw new Error('Invalid blueprint data format received');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while generating the blueprint');
    } finally {
      setLoading(false);
    }
  };

  // CRUD Node Operations
  const handleAddTask = (type = 'general') => {
    let newY = 80;
    if (nodes.length > 0) {
      const maxY = Math.max(...nodes.map(n => n.position.y));
      newY = maxY + 140;
    }
    
    const newX = 250 + (nodes.length % 3) * 20;
    const newNodeId = `node-${Date.now()}`;
    const defaultTitle = type === 'general' ? 'New Task Step' 
                        : type === 'database' ? 'New Database Task'
                        : type === 'api' ? 'New API Task'
                        : 'New Frontend Task';

    const newNode = {
      id: newNodeId,
      type: 'blueprintNode',
      position: { x: newX, y: newY },
      data: {
        title: defaultTitle,
        description: 'Provide technical guidelines or details for this task...',
        status: 'todo',
        isSkillUp: false,
        nodeType: type,
        steps: [
          { text: 'Define requirements for this phase', completed: false }
        ],
        label: `${defaultTitle}\nProvide technical guidelines or details for this task...`
      }
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    setSelectedEdge(null);
    logUserActivity('add_node', { node_id: newNodeId, node_type: type });
  };

  const updateSelectedNodeData = (field, value) => {
    if (!selectedNode) return;
    
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.id === selectedNode.id) {
          const updatedData = {
            ...node.data,
            [field]: value
          };
          // Re-generate raw label string for compatibility fallback
          updatedData.label = updatedData.title + (updatedData.description ? `\n${updatedData.description}` : '');
          
          const updatedNode = {
            ...node,
            data: updatedData
          };

          // Keep selection details aligned
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleUpdateStepText = (stepIndex, text) => {
    if (!selectedNode) return;
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.id === selectedNode.id) {
          const updatedSteps = (node.data.steps || []).map((step, idx) => 
            idx === stepIndex ? { ...step, text } : step
          );
          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              steps: updatedSteps
            }
          };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleToggleStepSelection = (stepIndex) => {
    if (!selectedNode) return;
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.id === selectedNode.id) {
          const updatedSteps = (node.data.steps || []).map((step, idx) => 
            idx === stepIndex ? { ...step, completed: !step.completed } : step
          );
          
          // Auto-update status based on step completion
          const totalSteps = updatedSteps.length;
          const completedSteps = updatedSteps.filter(s => s.completed).length;
          let updatedStatus = node.data.status || 'todo';
          
          if (totalSteps > 0) {
            if (completedSteps === totalSteps) {
              updatedStatus = 'completed';
            } else if (completedSteps > 0) {
              updatedStatus = 'in_progress';
            } else if (updatedStatus === 'completed' || updatedStatus === 'in_progress') {
              updatedStatus = 'todo';
            }
          }

          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              steps: updatedSteps,
              status: updatedStatus
            }
          };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleDeleteStep = (stepIndex) => {
    if (!selectedNode) return;
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.id === selectedNode.id) {
          const updatedSteps = (node.data.steps || []).filter((_, idx) => idx !== stepIndex);
          
          const totalSteps = updatedSteps.length;
          const completedSteps = updatedSteps.filter(s => s.completed).length;
          let updatedStatus = node.data.status || 'todo';
          
          if (totalSteps > 0) {
            if (completedSteps === totalSteps) {
              updatedStatus = 'completed';
            } else if (completedSteps > 0) {
              updatedStatus = 'in_progress';
            }
          }

          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              steps: updatedSteps,
              status: updatedStatus
            }
          };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleAddStep = () => {
    if (!selectedNode) return;
    setNodes(prevNodes =>
      prevNodes.map(node => {
        if (node.id === selectedNode.id) {
          const updatedSteps = [
            ...(node.data.steps || []),
            { text: 'New sub-step detail...', completed: false }
          ];
          
          let updatedStatus = node.data.status || 'todo';
          if (updatedStatus === 'completed') {
            updatedStatus = 'in_progress';
          }

          const updatedNode = {
            ...node,
            data: {
              ...node.data,
              steps: updatedSteps,
              status: updatedStatus
            }
          };
          setSelectedNode(updatedNode);
          return updatedNode;
        }
        return node;
      })
    );
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;
    const nodeId = selectedNode.id;
    
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    logUserActivity('delete_node', { node_id: nodeId });
  };

  const handleDeleteEdge = () => {
    if (!selectedEdge) return;
    const edgeId = selectedEdge.id;
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    setSelectedEdge(null);
  };

  const handleAutoLayout = () => {
    if (nodes.length === 0) return;
    
    // Sort nodes sequentially by current Y coordinate
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
    const spacingY = 140;
    const defaultX = 250;
    const startY = 60;
    
    const rearranged = sortedNodes.map((node, index) => ({
      ...node,
      position: {
        x: defaultX,
        y: startY + (index * spacingY)
      }
    }));
    
    setNodes(rearranged);
    logUserActivity('auto_layout', { node_count: nodes.length });
  };

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the blueprint canvas? Your custom changes will be lost.')) {
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
      setSelectedEdge(null);
      localStorage.removeItem('forgetrack_blueprint');
      logUserActivity('clear_canvas', {});
    }
  };

  const handleExportMarkdown = () => {
    if (nodes.length === 0) return;
    
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
    let md = `# ForgeTrack Engineering Roadmap\n\n`;
    md += `*Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}*\n`;
    if (ideaDescription) {
      md += `*Idea Scope:* "${ideaDescription}"\n\n`;
    }
    md += `## Blueprint Flow Tasks\n\n`;
    
    sortedNodes.forEach((node, idx) => {
      const isDone = node.data.status === 'completed';
      const checkbox = isDone ? '[x]' : '[ ]';
      const statusLabel = node.data.status ? ` (${node.data.status.replace('_', ' ').toUpperCase()})` : '';
      const skillTag = node.data.isSkillUp ? ' [SKILL UP OPTION]' : '';
      
      md += `${idx + 1}. ${checkbox} **${node.data.title}**${statusLabel}${skillTag}\n`;
      if (node.data.description) {
        md += `   *${node.data.description.replace(/\n/g, ' ')}*\n`;
      }
      md += '\n';
    });

    navigator.clipboard.writeText(md)
      .then(() => {
        alert('Roadmap successfully exported as Markdown and copied to clipboard!');
        logUserActivity('export_roadmap', { format: 'markdown' });
      })
      .catch(err => {
        console.error('Clipboard copy error:', err);
      });
  };

  // Statistics indicators
  const totalTasksCount = nodes.length;
  const completedCount = nodes.filter(n => n.data.status === 'completed').length;
  const inProgressCount = nodes.filter(n => n.data.status === 'in_progress').length;
  const blockedCount = nodes.filter(n => n.data.status === 'blocked').length;
  const progressPercentage = totalTasksCount > 0 ? Math.round((completedCount / totalTasksCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      
      {/* Top Banner & Generation Input */}
      <div className="bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm dark:shadow-xl shrink-0 transition-all">
        <div className="p-6 bg-gradient-to-br from-indigo-50/10 via-white to-white dark:from-indigo-950/10 dark:via-[#0e0e16]/50 dark:to-[#0e0e16] transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center space-x-2">
                <Share2 className="w-5.5 h-5.5 text-indigo-550 dark:text-indigo-400 animate-pulse" />
                <span>IdeaForge Roadmap Canvas</span>
              </h2>
              <p className="text-slate-650 dark:text-gray-400 text-xs mt-1 max-w-xl">
                Generate a sequential engineering task flowchart below. Customize the flowchart steps, connect new pathways, track completion status, and log stuck points.
              </p>
            </div>
            
            {/* Stats Panel */}
            {totalTasksCount > 0 && (
              <div className="flex flex-col gap-2 p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl min-w-[200px] transition-all">
                <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                  <span>Progress</span>
                  <span className="text-indigo-655 dark:text-indigo-400">{completedCount}/{totalTasksCount} Done ({progressPercentage}%)</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-1.5 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" 
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 dark:text-gray-500 font-bold uppercase pt-1">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />{completedCount}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />{inProgressCount}</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-rose-455 dark:bg-rose-400" />{blockedCount}</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleForgeBlueprint} className="flex gap-3">
            <input
              type="text"
              value={ideaDescription}
              onChange={(e) => setIdeaDescription(e.target.value)}
              placeholder="Describe your project (e.g. 'Build a real-time multiplayer drawing whiteboard app')..."
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-450 dark:placeholder:text-gray-600 rounded-xl focus:border-indigo-500/50 outline-none transition-all focus:ring-1 focus:ring-indigo-500/50 text-xs focus:bg-white dark:focus:bg-white/[0.02]"
              disabled={loading}
            />
            
            <button
              type="submit"
              disabled={loading || !ideaDescription.trim()}
              className={`shrink-0 flex items-center justify-center px-6 py-3 border border-transparent rounded-xl shadow-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all duration-200 cursor-pointer ${loading || !ideaDescription.trim() ? 'opacity-40 cursor-not-allowed active:scale-100' : ''}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Forging...
                </span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Forge Roadmap
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/20 p-3.5 rounded-xl shadow-sm flex items-start space-x-3 transition-all">
              <AlertCircle className="w-4 h-4 text-rose-505 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-600 dark:text-rose-300 font-medium">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Flow Layout & Interaction Side Panel */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-[500px]">
        
        {/* Left Side: React Flow Canvas Container */}
        <div className="flex-1 bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 rounded-3xl p-4 shadow-sm dark:shadow-xl flex flex-col relative min-h-[450px] transition-all">
          
          {/* Flow Controls toolbar */}
          <div className="flex justify-between items-center mb-4 px-2 shrink-0">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center">
              <span className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 p-1.5 rounded-lg mr-2 transition-all">
                <Activity className="w-3.5 h-3.5" />
              </span>
              Engineering Architecture Flow
            </h3>
            
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              {/* Task Quick Add Group — always visible */}
              <div className="flex items-center bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-lg p-0.5 space-x-1 transition-all">
                <button
                  onClick={() => handleAddTask('general')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white text-[9px] font-bold uppercase rounded-md hover:bg-white/20 dark:hover:bg-white/5 transition-all cursor-pointer"
                  title="Add General Task"
                >
                  <Plus className="w-3 h-3 text-slate-500 dark:text-gray-400" />
                  General
                </button>
                <button
                  onClick={() => handleAddTask('database')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-blue-600 hover:text-blue-750 dark:text-blue-400 dark:hover:text-blue-300 text-[9px] font-bold uppercase rounded-md hover:bg-blue-100 dark:hover:bg-blue-500/10 transition-all cursor-pointer"
                  title="Add Database Task"
                >
                  <Plus className="w-3 h-3 text-blue-650 dark:text-blue-400" />
                  DB
                </button>
                <button
                  onClick={() => handleAddTask('api')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-purple-600 hover:text-purple-750 dark:text-purple-400 dark:hover:text-purple-300 text-[9px] font-bold uppercase rounded-md hover:bg-purple-100 dark:hover:bg-purple-500/10 transition-all cursor-pointer"
                  title="Add API Task"
                >
                  <Plus className="w-3 h-3 text-purple-655 dark:text-purple-400" />
                  API
                </button>
                <button
                  onClick={() => handleAddTask('frontend')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-cyan-600 hover:text-cyan-750 dark:text-cyan-400 dark:hover:text-cyan-300 text-[9px] font-bold uppercase rounded-md hover:bg-cyan-100 dark:hover:bg-cyan-500/10 transition-all cursor-pointer"
                  title="Add Frontend Task"
                >
                  <Plus className="w-3 h-3 text-cyan-655 dark:text-cyan-400" />
                  UI
                </button>
              </div>
              
              {nodes.length > 0 && (
                <>
                  <button
                    onClick={handleAutoLayout}
                    title="Neatly align and tidy up the node layout vertically"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-205 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/5 text-slate-650 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    Auto Align
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    title="Export all tasks to Markdown checklist copy"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-205 dark:bg-white/[0.02] dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/5 text-slate-655 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export
                  </button>
                  <button
                    onClick={handleClearCanvas}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-600 dark:text-rose-450 hover:text-rose-700 dark:hover:text-rose-300 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Actual React Flow Frame */}
          <div className="flex-1 border border-slate-200 dark:border-white/5 rounded-2xl bg-slate-50/50 dark:bg-[#08080e] overflow-hidden relative transition-all">
            {nodes.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-5">
                <div className="p-4 bg-indigo-550/5 dark:bg-indigo-500/5 rounded-full border border-indigo-100 dark:border-indigo-500/10 text-indigo-600 dark:text-indigo-400/60 animate-bounce">
                  <Share2 className="w-8 h-8" />
                </div>
                <div className="max-w-md">
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">Blueprint Canvas is Empty</h4>
                  <p className="text-xs text-slate-550 dark:text-gray-500 mt-1.5 leading-relaxed">
                    Describe your idea above and click <span className="text-indigo-650 dark:text-indigo-400 font-semibold">Forge Roadmap</span> to generate a flowchart, or manually add task nodes below.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleAddTask('general')} className="flex items-center gap-1.5 px-3 py-2 text-slate-700 dark:text-gray-300 text-[10px] font-bold uppercase rounded-xl border border-slate-205 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] hover:bg-slate-200 dark:hover:bg-white/[0.07] transition-all cursor-pointer">
                    <Plus className="w-3 h-3" /> General
                  </button>
                  <button onClick={() => handleAddTask('database')} className="flex items-center gap-1.5 px-3 py-2 text-blue-650 dark:text-blue-400 text-[10px] font-bold uppercase rounded-xl border border-blue-200 dark:border-blue-500/20 bg-blue-55/5 dark:bg-blue-500/5 hover:bg-blue-100 dark:hover:bg-blue-500/10 transition-all cursor-pointer">
                    <Plus className="w-3 h-3" /> DB
                  </button>
                  <button onClick={() => handleAddTask('api')} className="flex items-center gap-1.5 px-3 py-2 text-purple-655 dark:text-purple-400 text-[10px] font-bold uppercase rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-55/5 dark:bg-purple-500/10 transition-all cursor-pointer">
                    <Plus className="w-3 h-3" /> API
                  </button>
                  <button onClick={() => handleAddTask('frontend')} className="flex items-center gap-1.5 px-3 py-2 text-cyan-650 dark:text-cyan-400 text-[10px] font-bold uppercase rounded-xl border border-cyan-200 dark:border-cyan-500/20 bg-cyan-55/5 dark:bg-cyan-500/10 transition-all cursor-pointer">
                    <Plus className="w-3 h-3" /> UI
                  </button>
                </div>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                onEdgeClick={onEdgeClick}
                onPaneClick={onPaneClick}
                onConnect={onConnect}
                fitView
                colorMode={theme}
                attributionPosition="bottom-right"
              >
                <Background color={theme === 'dark' ? '#333' : '#cbd5e1'} gap={18} size={1} />
                <Controls className="bg-white dark:bg-[#0d0d15] border border-slate-205 dark:border-white/5 text-slate-800 dark:text-white transition-colors" />
                <MiniMap 
                  nodeColor={(node) => {
                    if (node.data.isSkillUp) return '#ec4899';
                    if (node.data.status === 'completed') return '#10b981';
                    if (node.data.status === 'in_progress') return '#6366f1';
                    return theme === 'dark' ? '#374151' : '#cbd5e1';
                  }}
                  className="bg-white dark:bg-[#0d0d15] border border-slate-255 dark:border-white/5 transition-colors"
                  maskColor={theme === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'}
                />
              </ReactFlow>
            )}
          </div>
          <div className="text-[9px] text-slate-500 dark:text-gray-500 mt-2 px-1 font-semibold tracking-wider uppercase flex justify-between">
            <span>To connect: Drag ports on node edges</span>
            <span>To delete node/connection: Select and press Delete or Backspace key</span>
          </div>
        </div>

        {/* Right Side: Interactive Sidebar Panel */}
        <div className="w-full lg:w-80 bg-white dark:bg-[#0e0e16]/80 border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-sm dark:shadow-xl flex flex-col shrink-0 min-h-[350px] transition-all">
          {activeSelectedNode ? (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="space-y-4 overflow-y-auto max-h-[70vh] pr-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 font-mono">
                    Task Editor
                  </span>
                  <button 
                    onClick={() => setSelectedNode(null)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-205 dark:hover:border-white/5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Title Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-gray-400 uppercase tracking-wider">Task Title</label>
                    <input 
                      type="text" 
                      value={activeSelectedNode.data.title || ''}
                      onChange={(e) => updateSelectedNodeData('title', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs focus:border-indigo-500/50 outline-none transition-all font-bold focus:bg-white dark:focus:bg-white/[0.05]"
                    />
                  </div>

                  {/* Description Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-gray-400 uppercase tracking-wider">Technical Details</label>
                    <textarea 
                      value={activeSelectedNode.data.description || ''}
                      onChange={(e) => updateSelectedNodeData('description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs focus:border-indigo-500/50 outline-none transition-all resize-none leading-relaxed font-medium focus:bg-white dark:focus:bg-white/[0.05]"
                    />
                  </div>

                  {/* Node Type Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-gray-400 uppercase tracking-wider">Task Type</label>
                    <select
                      value={activeSelectedNode.data.nodeType || 'general'}
                      onChange={(e) => updateSelectedNodeData('nodeType', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-[#0e0e16] border border-slate-205 dark:border-white/10 text-slate-900 dark:text-white rounded-xl text-xs focus:border-indigo-500/50 outline-none transition-all font-semibold cursor-pointer"
                    >
                      <option value="general">General Task</option>
                      <option value="database">Database Task</option>
                      <option value="api">API Task</option>
                      <option value="frontend">Frontend / UI Task</option>
                    </select>
                  </div>

                  {/* Step-by-Step Guidelines Editor */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-slate-455 dark:text-gray-400 uppercase tracking-wider">
                        Execution Steps ({activeSelectedNode.data.steps?.length || 0})
                      </label>
                      <button
                        onClick={handleAddStep}
                        className="text-[9px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 hover:text-indigo-550 dark:hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" /> Add Step
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {(!activeSelectedNode.data.steps || activeSelectedNode.data.steps.length === 0) ? (
                        <p className="text-[10px] text-slate-400 dark:text-gray-500 italic py-1">No steps added. Click "Add Step" to begin.</p>
                      ) : (
                        activeSelectedNode.data.steps.map((step, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-xl p-2 transition-all">
                            <input
                              type="checkbox"
                              checked={!!step.completed}
                              onChange={() => handleToggleStepSelection(idx)}
                              className="w-3.5 h-3.5 rounded bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-indigo-605 focus:ring-indigo-500/50 cursor-pointer shrink-0"
                            />
                            <input
                              type="text"
                              value={step.text || ''}
                              onChange={(e) => handleUpdateStepText(idx, e.target.value)}
                              placeholder="Describe this execution step..."
                              className="flex-1 min-w-0 bg-transparent text-slate-800 dark:text-white text-[11px] outline-none border-b border-transparent hover:border-slate-200 dark:hover:border-white/10 focus:border-indigo-500/30 py-0.5 px-1 font-medium"
                            />
                            <button
                              onClick={() => handleDeleteStep(idx)}
                              className="p-1 text-slate-400 hover:text-rose-605 dark:text-gray-550 dark:hover:text-rose-450 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-all shrink-0 cursor-pointer"
                              title="Delete Step"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Status Selection Buttons */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-white/5">
                    <label className="text-[10px] font-bold text-slate-455 dark:text-gray-400 uppercase tracking-wider">Completion Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => updateSelectedNodeData('status', 'todo')}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          activeSelectedNode.data.status === 'todo'
                            ? 'bg-slate-500/10 text-slate-650 dark:text-slate-350 border-slate-500/40 shadow-[0_0_8px_rgba(100,116,139,0.15)] font-bold'
                            : 'bg-transparent text-slate-500 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                        }`}
                      >
                        <Circle className="w-3.5 h-3.5 text-slate-500 dark:text-gray-500" />
                        Todo
                      </button>
                      <button
                        onClick={() => updateSelectedNodeData('status', 'in_progress')}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          activeSelectedNode.data.status === 'in_progress'
                            ? 'bg-indigo-500/10 text-indigo-655 dark:text-indigo-300 border-indigo-500/40 shadow-[0_0_8px_rgba(99,102,241,0.15)] font-bold'
                            : 'bg-transparent text-slate-500 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 fill-indigo-605/10 dark:fill-indigo-400/10 animate-pulse" />
                        Active
                      </button>
                      <button
                        onClick={() => updateSelectedNodeData('status', 'completed')}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          activeSelectedNode.data.status === 'completed'
                            ? 'bg-emerald-500/10 text-emerald-655 dark:text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)] font-bold'
                            : 'bg-transparent text-slate-500 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        Done
                      </button>
                      <button
                        onClick={() => updateSelectedNodeData('status', 'blocked')}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                          activeSelectedNode.data.status === 'blocked'
                            ? 'bg-rose-500/10 text-rose-655 dark:text-rose-350 border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.15)] font-bold'
                            : 'bg-transparent text-slate-500 dark:text-gray-400 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                        Blocked
                      </button>
                    </div>
                  </div>

                  {/* Skill Up Toggle switch */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-2xl mt-1 transition-all">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-pink-500 dark:text-pink-400" />
                        Skill Up Flag
                      </span>
                      <span className="text-[8px] text-slate-550 dark:text-gray-500 font-semibold uppercase mt-0.5">Resume profile missing gap target</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={!!activeSelectedNode.data.isSkillUp}
                        onChange={(e) => updateSelectedNodeData('isSkillUp', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-7 h-4 bg-slate-200 dark:bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-250 dark:after:border-gray-350 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-pink-500" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Node Stuck & Deletion Actions */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100 dark:border-white/5">
                <button
                  onClick={() => {
                    logUserActivity('task_stuck_clicked', {
                      node_id: activeSelectedNode.id,
                      node_data: activeSelectedNode.data
                    });
                    window.dispatchEvent(new CustomEvent('open-chat-panel', { detail: activeSelectedNode }));
                  }}
                  className="w-full py-2.5 bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 hover:text-indigo-755 dark:hover:text-indigo-300 font-bold text-[10px] uppercase rounded-xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm dark:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  Ask AI (I'm Stuck)
                </button>
                
                <button
                  onClick={handleDeleteNode}
                  className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-650 dark:text-rose-455 hover:text-rose-700 dark:hover:text-rose-300 font-bold text-[10px] uppercase rounded-xl border border-rose-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Task Step
                </button>
              </div>
            </div>
          ) : selectedEdge ? (
            <div className="h-full flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-650 dark:text-indigo-400 font-mono">
                    Connection Info
                  </span>
                  <button 
                    onClick={() => setSelectedEdge(null)}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-205 dark:hover:border-white/5 rounded-lg text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 rounded-2xl space-y-3 transition-all">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-gray-300">
                    <Link2 className="w-4 h-4 text-indigo-550 dark:text-indigo-400" />
                    <span>Connection Path</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-gray-400 font-medium space-y-1 font-mono">
                    <div>Source: {selectedEdge.source}</div>
                    <div className="flex items-center justify-center py-1">
                      <ArrowRight className="w-3 h-3 text-indigo-550/60 dark:text-indigo-500/60 rotate-90" />
                    </div>
                    <div>Target: {selectedEdge.target}</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDeleteEdge}
                className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/15 text-rose-650 dark:text-rose-455 hover:text-rose-755 dark:hover:text-rose-350 font-bold text-[10px] uppercase rounded-xl border border-rose-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Connection
              </button>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-200 dark:border-white/5 border-dashed rounded-2xl transition-all">
              <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-full text-slate-400 dark:text-gray-600">
                <HelpCircle className="w-6 h-6 text-slate-500 dark:text-gray-505/60" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Select an Element</h4>
                <p className="text-[10px] text-slate-500 dark:text-gray-500 mt-1 max-w-[180px] mx-auto leading-relaxed">
                  Click on any task card or connection pathway on the left canvas to view status, edit details, or get AI recruiter advice.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default IdeaForgeCanvas;
