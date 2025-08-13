import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Plus, Settings, Zap, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardHeaderProps {
  totalAgents: number;
  activeAgents: number;
  onCreateAgent: () => void;
  onSettings: () => void;
}

export function DashboardHeader({ totalAgents, activeAgents, onCreateAgent, onSettings }: DashboardHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-accent/5 to-tool-accent/10 border border-primary/20">
        <div className="absolute inset-0 neural-grid opacity-30" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <motion.h1 
                className="text-4xl font-bold gradient-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                Letta Dashboard
              </motion.h1>
              <motion.p 
                className="text-lg text-muted-foreground max-w-2xl"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                The AI Operating System for building stateful agents. Create, manage, and interact with 
                intelligent agents that maintain memory and context across conversations.
              </motion.p>
              <motion.div 
                className="flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <Button 
                  variant="default" 
                  size="lg" 
                  onClick={onCreateAgent}
                  className="glow-primary"
                >
                  <Plus className="h-5 w-5" />
                  Create Agent
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={onSettings}
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Button>
              </motion.div>
            </div>
            
            <motion.div 
              className="hidden lg:block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-primary to-accent rounded-full glow-primary opacity-20" />
                <Brain className="absolute inset-0 m-auto h-16 w-16 text-primary" />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <Card className="p-4 glow-neural">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Agents</p>
              <p className="text-2xl font-bold text-foreground">{totalAgents}</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>
        
        <Card className="p-4 glow-neural">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Agents</p>
              <p className="text-2xl font-bold text-agent-active">{activeAgents}</p>
            </div>
            <Brain className="h-8 w-8 text-agent-active" />
          </div>
        </Card>
        
        <Card className="p-4 glow-neural">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Memory Blocks</p>
              <p className="text-2xl font-bold text-memory-block">{totalAgents * 3}</p>
            </div>
            <Badge variant="memory" className="p-2">
              <Brain className="h-4 w-4" />
            </Badge>
          </div>
        </Card>
        
        <Card className="p-4 glow-neural">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Available Tools</p>
              <p className="text-2xl font-bold text-tool-accent">8</p>
            </div>
            <Zap className="h-8 w-8 text-tool-accent" />
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}