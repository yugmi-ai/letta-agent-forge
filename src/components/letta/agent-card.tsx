import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageCircle, Settings, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface Agent {
  id: string;
  name: string;
  model: string;
  status: 'active' | 'idle' | 'busy';
  memoryBlocks: number;
  tools: string[];
  lastActive: string;
}

interface AgentCardProps {
  agent: Agent;
  onChat: (agentId: string) => void;
  onSettings: (agentId: string) => void;
}

const statusColors = {
  active: 'agent',
  idle: 'secondary',
  busy: 'tool'
} as const;

export function AgentCard({ agent, onChat, onSettings }: AgentCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glow-neural hover:glow-primary transition-all duration-500 neural-grid">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {agent.name}
          </CardTitle>
          <Badge variant={statusColors[agent.status]}>
            {agent.status}
          </Badge>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Model:</span>
              <span className="font-mono text-xs">{agent.model}</span>
            </div>
            <div className="flex justify-between">
              <span>Memory Blocks:</span>
              <span className="text-memory-block font-semibold">{agent.memoryBlocks}</span>
            </div>
            <div className="flex justify-between">
              <span>Tools:</span>
              <span className="text-tool-accent font-semibold">{agent.tools.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Last Active:</span>
              <span>{agent.lastActive}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="default" 
              onClick={() => onChat(agent.id)}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4" />
              Chat
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onSettings(agent.id)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {agent.tools.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {agent.tools.slice(0, 3).map((tool) => (
                <Badge key={tool} variant="tool" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  {tool}
                </Badge>
              ))}
              {agent.tools.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{agent.tools.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}