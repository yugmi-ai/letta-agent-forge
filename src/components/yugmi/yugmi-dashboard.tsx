import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '../letta/dashboard-header';
import { AgentCard } from '../letta/agent-card';
import { AgentCreationModal } from '../letta/agent-creation-modal';
import { ChatInterface } from '../letta/chat-interface';
import { MemoryBlockComponent } from '../letta/memory-block';
import { UserStoryModal } from '../letta/user-story-modal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, MessageCircle, Database, Plus, Settings, AlertCircle, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import lettaClient from '@/services/letta-client';
import { LettaAgent, MemoryBlock, LettaMessage } from '@/types/letta';

// Mock data for demonstration - will be replaced with real Letta server data
const mockAgents = [
  {
    id: 'agent-001',
    name: 'Research Assistant',
    model: 'openai/gpt-4.1',
    status: 'active' as const,
    memoryBlocks: 3,
    tools: ['web_search', 'run_code', 'send_message'],
    lastActive: '2 minutes ago'
  },
  {
    id: 'agent-002',
    name: 'Content Creator',
    model: 'anthropic/claude-3-sonnet',
    status: 'idle' as const,
    memoryBlocks: 4,
    tools: ['web_search', 'edit_memory'],
    lastActive: '1 hour ago'
  },
  {
    id: 'agent-003',
    name: 'Code Assistant',
    model: 'openai/gpt-4o-mini',
    status: 'busy' as const,
    memoryBlocks: 2,
    tools: ['run_code', 'search_memory'],
    lastActive: '30 seconds ago'
  }
];

const mockMemoryBlocks = [
  {
    id: 'mem-001',
    label: 'persona',
    value: 'I am a helpful AI assistant specialized in research and analysis. I provide thorough, well-sourced information and can help with complex problem-solving.',
    template: true
  },
  {
    id: 'mem-002',
    label: 'human',
    value: 'The user is a product manager working on AI integration projects. They prefer detailed explanations and actionable insights.',
    template: true
  },
  {
    id: 'mem-003',
    label: 'project_context',
    value: 'Current project involves building a Yugmi dashboard for AI agent management with focus on enterprise features and scalability.',
    description: 'Stores current project context and requirements',
    template: false
  }
];

const mockMessages = [
  {
    id: 'msg-001',
    messageType: 'user_message' as const,
    content: 'Hello! Can you help me understand how Yugmi agents work?',
    timestamp: new Date(Date.now() - 600000)
  },
  {
    id: 'msg-002',
    messageType: 'reasoning_message' as const,
    reasoning: 'The user is asking about Yugmi agents. I should provide a comprehensive explanation of how stateful agents work, including memory management and tool usage.',
    timestamp: new Date(Date.now() - 580000)
  },
  {
    id: 'msg-003',
    messageType: 'assistant_message' as const,
    content: 'Absolutely! Yugmi agents are stateful AI agents that maintain persistent memory and context across conversations. Unlike traditional chatbots, they can remember previous interactions and continuously learn about you and your preferences.',
    timestamp: new Date(Date.now() - 570000)
  }
];

export function YugmiDashboard() {
  const { authState } = useAuth();
  const [agents, setAgents] = useState(mockAgents);
  const [memoryBlocks, setMemoryBlocks] = useState(mockMemoryBlocks);
  const [messages, setMessages] = useState(mockMessages);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserStoryModal, setShowUserStoryModal] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [serverStatus, setServerStatus] = useState<'connected' | 'disconnected' | 'error'>('disconnected');
  const { toast } = useToast();

  // Initialize Letta client connection
  useEffect(() => {
    const initializeLettaConnection = async () => {
      try {
        const health = await lettaClient.healthCheck();
        if (health.status === 'healthy') {
          setServerStatus('connected');
          toast({
            title: "Connected to Letta Server",
            description: "Successfully connected to your Letta server instance.",
            variant: "default"
          });
          
          // Load real agents from Letta server
          try {
            const realAgents = await lettaClient.listAgents(authState.user?.id, authState.organization?.id);
            if (realAgents.length > 0) {
              // Convert Letta agents to dashboard format
              const dashboardAgents = realAgents.map(agent => ({
                id: agent.id,
                name: agent.name,
                model: agent.model,
                status: agent.status as 'active' | 'idle' | 'busy',
                memoryBlocks: agent.memory_blocks.length,
                tools: agent.tools,
                lastActive: new Date(agent.updated_at).toLocaleString()
              }));
              setAgents(dashboardAgents);
            }
          } catch (error) {
            console.warn('Failed to load agents from Letta server:', error);
          }
        }
      } catch (error) {
        setServerStatus('error');
        console.error('Failed to connect to Letta server:', error);
        toast({
          title: "Letta Server Connection Failed",
          description: "Could not connect to your Letta server. Using demo mode.",
          variant: "default"
        });
      }
    };

    initializeLettaConnection();
  }, [authState.user?.id, authState.organization?.id, toast]);

  const handleCreateAgent = async (agentData: any) => {
    setIsCreatingAgent(true);
    try {
      if (serverStatus === 'connected') {
        // Create agent via Letta server
        const newAgent = await lettaClient.createAgent({
          name: agentData.name,
          model: agentData.model,
          embedding_model: agentData.embedding,
          memory_blocks: agentData.memoryBlocks,
          tools: agentData.tools,
          system_prompt: agentData.systemPrompt,
          metadata: { created_via: 'yugmi_dashboard' }
        });
        
        const dashboardAgent = {
          id: newAgent.id,
          name: newAgent.name,
          model: newAgent.model,
          status: 'active' as const,
          memoryBlocks: newAgent.memory_blocks.length,
          tools: newAgent.tools,
          lastActive: 'Just created'
        };
        
        setAgents(prev => [...prev, dashboardAgent]);
      } else {
        // Fallback to mock creation
        const newAgent = {
          id: `agent-${Date.now()}`,
          name: agentData.name,
          model: agentData.model,
          status: 'active' as const,
          memoryBlocks: agentData.memoryBlocks.length,
          tools: agentData.tools,
          lastActive: 'Just created'
        };
        
        setAgents(prev => [...prev, newAgent]);
      }
      
      setShowCreateModal(false);
      
      toast({
        title: "Agent Created",
        description: `Successfully created agent "${agentData.name}"`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAgent(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!selectedAgent) return;
    
    setIsSendingMessage(true);
    try {
      // Add user message
      const userMessage = {
        id: `msg-${Date.now()}`,
        messageType: 'user_message' as const,
        content: message,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      if (serverStatus === 'connected') {
        // Send message via Letta server
        const response = await lettaClient.sendMessage(selectedAgent, {
          content: message,
          role: 'user' as any,
          metadata: { sent_via: 'yugmi_dashboard' }
        });
        
        const aiMessage = {
          id: response.id,
          messageType: 'assistant_message' as const,
          content: response.content || 'Response received',
          timestamp: new Date(response.created_at)
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const aiMessage = {
          id: `msg-${Date.now() + 1}`,
          messageType: 'assistant_message' as const,
          content: `Thanks for your message: "${message}". This is a demo response showing how Yugmi agents maintain stateful conversations with persistent memory.`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleChatWithAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    setActiveTab('chat');
  };

  const handleEditMemoryBlock = (blockId: string) => {
    toast({
      title: "Edit Memory Block",
      description: "Memory block editing will be available in the full implementation.",
      variant: "default"
    });
  };

  const selectedAgentData = agents.find(a => a.id === selectedAgent);
  const activeAgentCount = agents.filter(a => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <DashboardHeader
        totalAgents={agents.length}
        activeAgents={activeAgentCount}
        serverStatus={serverStatus}
        userName={`${authState.user?.firstName} ${authState.user?.lastName}`}
        organizationName={authState.organization?.name}
        onCreateAgent={() => setShowCreateModal(true)}
        onShowUserStories={() => setShowUserStoryModal(true)}
        onSettings={() => toast({ title: "Settings", description: "Settings panel coming soon!" })}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="stories" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            User Stories
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2" disabled={!selectedAgent}>
            <MessageCircle className="h-4 w-4" />
            Chat {selectedAgent && `(${selectedAgentData?.name})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="glow-neural">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    Your Agents
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AnimatePresence>
                      {agents.map((agent) => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          onChat={handleChatWithAgent}
                          onSettings={() => toast({ title: "Agent Settings", description: "Agent configuration coming soon!" })}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="glow-neural">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-memory-block" />
                    Recent Memory Blocks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {memoryBlocks.map((block, index) => (
                        <MemoryBlockComponent
                          key={block.id}
                          block={block}
                          onEdit={handleEditMemoryBlock}
                          index={index}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Agent Management</h2>
            <Button variant="default" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4" />
              Create Agent
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onChat={handleChatWithAgent}
                  onSettings={() => toast({ title: "Agent Settings", description: "Agent configuration coming soon!" })}
                />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="memory" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Memory Management</h2>
            <Button variant="memory" onClick={() => toast({ title: "Add Memory Block", description: "Memory block creation coming soon!" })}>
              <Plus className="h-4 w-4" />
              Add Memory Block
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memoryBlocks.map((block, index) => (
              <MemoryBlockComponent
                key={block.id}
                block={block}
                onEdit={handleEditMemoryBlock}
                index={index}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="stories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Stories & Use Cases</h2>
            <Button variant="outline" onClick={() => setShowUserStoryModal(true)}>
              <BookOpen className="h-4 w-4" />
              View All Stories
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* User story cards will be rendered here */}
            <Card className="glow-neural">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Individual Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Stories for individual developers and researchers
                </p>
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-start">
                    Personal AI Assistant
                  </Badge>
                  <Badge variant="outline" className="w-full justify-start">
                    Research Companion
                  </Badge>
                  <Badge variant="outline" className="w-full justify-start">
                    Code Helper
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="glow-neural">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-agent-active" />
                  Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Enterprise use cases and team collaboration
                </p>
                <div className="space-y-2">
                  <Badge variant="agent" className="w-full justify-start">
                    Team Management
                  </Badge>
                  <Badge variant="agent" className="w-full justify-start">
                    Shared Knowledge Base
                  </Badge>
                  <Badge variant="agent" className="w-full justify-start">
                    Compliance & Audit
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          {selectedAgent && selectedAgentData ? (
            <div className="h-[600px]">
              <ChatInterface
                agentId={selectedAgent}
                agentName={selectedAgentData.name}
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isSendingMessage}
              />
            </div>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <CardContent className="text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Agent Selected</h3>
                <p className="text-muted-foreground">
                  Select an agent from the dashboard to start chatting.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <AgentCreationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAgent={handleCreateAgent}
        isLoading={isCreatingAgent}
      />

      <UserStoryModal
        isOpen={showUserStoryModal}
        onClose={() => setShowUserStoryModal(false)}
      />
    </div>
  );
}