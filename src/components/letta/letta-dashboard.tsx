import React, { useState, useEffect } from 'react';
import { LettaClient } from '@letta-ai/letta-client';
import { DashboardHeader } from './dashboard-header';
import { AgentCard } from './agent-card';
import { AgentCreationModal } from './agent-creation-modal';
import { PromptBasedAgentModal } from './prompt-based-agent-modal';
import { ToolCreationModal } from './tool-creation-modal';
import { RuleCreationModal } from './rule-creation-modal';
import { ChatInterface } from './chat-interface';
import { MemoryBlockComponent } from './memory-block';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, MessageCircle, Database, Plus, Settings, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for demonstration
const mockAgents = [
  {
    id: 'agent-001',
    name: 'Assistant Alpha',
    model: 'openai/gpt-4.1',
    status: 'active' as const,
    memoryBlocks: 3,
    tools: ['web_search', 'run_code', 'send_message'],
    lastActive: '2 minutes ago'
  },
  {
    id: 'agent-002',
    name: 'Research Beta',
    model: 'anthropic/claude-3-sonnet',
    status: 'idle' as const,
    memoryBlocks: 4,
    tools: ['web_search', 'edit_memory'],
    lastActive: '1 hour ago'
  },
  {
    id: 'agent-003',
    name: 'Coder Gamma',
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
    value: 'I am a helpful AI assistant that specializes in software development and technical guidance. I am patient, thorough, and always aim to provide clear explanations.',
    template: true
  },
  {
    id: 'mem-002',
    label: 'human',
    value: 'Sarah is a software engineer working on a Next.js application. She prefers TypeScript and modern React patterns. She is currently learning about AI agent architectures.',
    template: true
  },
  {
    id: 'mem-003',
    label: 'project',
    value: 'Current project involves building a Letta dashboard application with stateful agent management, real-time chat capabilities, and memory visualization.',
    description: 'Stores current project context and requirements',
    template: false
  }
];

const mockMessages = [
  {
    id: 'msg-001',
    messageType: 'user_message' as const,
    content: 'Hello! Can you help me understand how Letta agents work?',
    timestamp: new Date(Date.now() - 600000)
  },
  {
    id: 'msg-002',
    messageType: 'reasoning_message' as const,
    reasoning: 'The user is asking about Letta agents. I should provide a comprehensive explanation of how stateful agents work, including memory management and tool usage.',
    timestamp: new Date(Date.now() - 580000)
  },
  {
    id: 'msg-003',
    messageType: 'assistant_message' as const,
    content: 'Absolutely! Letta agents are stateful AI agents that maintain persistent memory and context across conversations. Unlike traditional chatbots, they can remember previous interactions and continuously learn about you and your preferences.',
    timestamp: new Date(Date.now() - 570000)
  },
  {
    id: 'msg-004',
    messageType: 'user_message' as const,
    content: 'Can you search for the latest Letta documentation?',
    timestamp: new Date(Date.now() - 300000)
  },
  {
    id: 'msg-005',
    messageType: 'tool_call_message' as const,
    toolCall: {
      name: 'web_search',
      arguments: { query: 'Letta AI documentation latest features' }
    },
    timestamp: new Date(Date.now() - 280000)
  },
  {
    id: 'msg-006',
    messageType: 'tool_return_message' as const,
    toolReturn: 'Found documentation at docs.letta.com covering agent creation, memory management, and tool integration.',
    timestamp: new Date(Date.now() - 270000)
  },
  {
    id: 'msg-007',
    messageType: 'assistant_message' as const,
    content: 'I found the latest Letta documentation for you! The official docs at docs.letta.com cover comprehensive guides on agent creation, memory management, and tool integration. Would you like me to help you with any specific aspect?',
    timestamp: new Date(Date.now() - 260000)
  }
];

export function LettaDashboard() {
  const [agents, setAgents] = useState(mockAgents);
  const [memoryBlocks, setMemoryBlocks] = useState(mockMemoryBlocks);
  const [messages, setMessages] = useState(mockMessages);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showToolModal, setShowToolModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [client, setClient] = useState<LettaClient | null>(null);
  const { toast } = useToast();

  // Initialize Letta client
  useEffect(() => {
    try {
      // For demo purposes, we'll show a connection warning
      toast({
        title: "Demo Mode",
        description: "This is a demo dashboard. To connect to Letta Cloud or self-hosted server, add your API credentials.",
        variant: "default"
      });
    } catch (error) {
      console.error('Failed to initialize Letta client:', error);
    }
  }, [toast]);

  const handleCreateAgent = async (agentData: any) => {
    setIsCreatingAgent(true);
    try {
      // Simulate agent creation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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

      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const aiMessage = {
        id: `msg-${Date.now() + 1}`,
        messageType: 'assistant_message' as const,
        content: `Thanks for your message: "${message}". This is a demo response showing how Letta agents maintain stateful conversations with persistent memory.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      
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
        onCreateAgent={() => setShowCreateModal(true)}
        onSettings={() => toast({ title: "Settings", description: "Settings panel coming soon!" })}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
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

      <PromptBasedAgentModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
        onCreateAgent={handleCreateAgent}
        isLoading={isCreatingAgent}
      />

      <ToolCreationModal
        isOpen={showToolModal}
        onClose={() => setShowToolModal(false)}
        onCreateTool={() => {}}
        isLoading={false}
      />

      <RuleCreationModal
        isOpen={showRuleModal}
        onClose={() => setShowRuleModal(false)}
        onCreateRule={() => {}}
        availableTools={['web_search', 'run_code']}
        isLoading={false}
      />
    </div>
  );
}