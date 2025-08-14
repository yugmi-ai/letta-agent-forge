import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, Building, Brain, Code, Search, FileText, MessageCircle, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const individualUserStories = [
  {
    title: "Personal AI Assistant",
    description: "As an individual user, I want to sign up and create my personal AI agents",
    icon: Brain,
    features: ["Custom agent creation", "Personal memory management", "Private conversations"],
    priority: "High"
  },
  {
    title: "Developer Tool Integration",
    description: "As a developer, I want to integrate custom tools with my agents",
    icon: Code,
    features: ["Custom tool creation", "Code execution", "API integrations"],
    priority: "High"
  },
  {
    title: "Research Companion",
    description: "As a researcher, I want to export conversation data for analysis",
    icon: Search,
    features: ["Data export", "Conversation analytics", "Research insights"],
    priority: "Medium"
  }
];

const organizationStories = [
  {
    title: "Team Management",
    description: "As an organization admin, I want to manage team members and their access levels",
    icon: Users,
    features: ["User role management", "Access control", "Team collaboration"],
    priority: "High"
  },
  {
    title: "Shared Agent Library",
    description: "As a team lead, I want to create shared agents for my team",
    icon: MessageCircle,
    features: ["Shared agents", "Team templates", "Collaborative workflows"],
    priority: "High"
  },
  {
    title: "Compliance & Audit",
    description: "As a compliance officer, I want to audit all agent interactions",
    icon: Shield,
    features: ["Audit logs", "Compliance reporting", "Data governance"],
    priority: "Medium"
  }
];

export function UserStoryModal({ isOpen, onClose }: UserStoryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="h-6 w-6 text-primary" />
            User Stories & Use Cases
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* Individual Users Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-bold">Individual Users</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {individualUserStories.map((story, index) => (
                <motion.div
                  key={story.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <story.icon className="h-5 w-5 text-primary" />
                        {story.title}
                      </CardTitle>
                      <Badge variant={story.priority === 'High' ? 'default' : 'secondary'} className="w-fit">
                        {story.priority} Priority
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {story.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Key Features:</h4>
                        <ul className="space-y-1">
                          {story.features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Organizations Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Building className="h-6 w-6 text-accent" />
              <h2 className="text-xl font-bold">Organizations</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizationStories.map((story, index) => (
                <motion.div
                  key={story.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (index + 3) * 0.1, duration: 0.3 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <story.icon className="h-5 w-5 text-accent" />
                        {story.title}
                      </CardTitle>
                      <Badge variant={story.priority === 'High' ? 'default' : 'secondary'} className="w-fit">
                        {story.priority} Priority
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {story.description}
                      </p>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Key Features:</h4>
                        <ul className="space-y-1">
                          {story.features.map((feature, idx) => (
                            <li key={idx} className="text-xs text-muted-foreground flex items-center gap-2">
                              <div className="w-1 h-1 bg-accent rounded-full" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Architecture Overview */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-4">Architecture Overview</h3>
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-4 text-sm font-mono">
                    <span className="bg-primary/10 px-3 py-1 rounded">Frontend (React/TypeScript)</span>
                    <span>↔</span>
                    <span className="bg-accent/10 px-3 py-1 rounded">Backend API</span>
                    <span>↔</span>
                    <span className="bg-tool-accent/10 px-3 py-1 rounded">Letta Server (Docker)</span>
                  </div>
                  <div className="text-center">
                    <span>↕</span>
                  </div>
                  <div className="bg-memory-block/10 px-3 py-1 rounded inline-block text-sm font-mono">
                    Database (PostgreSQL)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}