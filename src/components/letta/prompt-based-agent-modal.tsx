import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Wand2, Sparkles, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface PromptBasedAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (agentData: {
    name: string;
    description: string;
    prompt: string;
    capabilities: string[];
  }) => void;
  isLoading: boolean;
}

const SUGGESTED_CAPABILITIES = [
  'Research and analysis',
  'Code generation',
  'Creative writing',
  'Data processing',
  'Customer support',
  'Content creation',
  'Technical documentation',
  'Project management'
];

export function PromptBasedAgentModal({ isOpen, onClose, onCreateAgent, isLoading }: PromptBasedAgentModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [prompt, setPrompt] = useState('');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [customCapability, setCustomCapability] = useState('');

  const handleCapabilityToggle = (capability: string) => {
    setSelectedCapabilities(prev => 
      prev.includes(capability) 
        ? prev.filter(c => c !== capability)
        : [...prev, capability]
    );
  };

  const addCustomCapability = () => {
    if (customCapability.trim() && !selectedCapabilities.includes(customCapability.trim())) {
      setSelectedCapabilities(prev => [...prev, customCapability.trim()]);
      setCustomCapability('');
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !prompt.trim()) return;
    
    onCreateAgent({
      name: name.trim(),
      description: description.trim(),
      prompt: prompt.trim(),
      capabilities: selectedCapabilities
    });
  };

  const generateSamplePrompt = () => {
    const samplePrompt = `You are ${name || 'an AI assistant'} designed to help users with ${selectedCapabilities.slice(0, 2).join(' and ') || 'various tasks'}.

Your key characteristics:
- Professional and helpful
- Clear and concise communication
- Proactive in offering solutions
- Maintains context across conversations

Your primary responsibilities:
${selectedCapabilities.map(cap => `- ${cap}`).join('\n')}

Always approach tasks methodically and ask clarifying questions when needed.`;

    setPrompt(samplePrompt);
  };

  const reset = () => {
    setName('');
    setDescription('');
    setPrompt('');
    setSelectedCapabilities([]);
    setCustomCapability('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wand2 className="h-6 w-6 text-primary" />
            Create Prompt-Based Agent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Agent Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="agent-name">Agent Name</Label>
                  <Input
                    id="agent-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Content Creator Assistant"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="agent-description">Description (Optional)</Label>
                  <Input
                    id="agent-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the agent's purpose"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Agent Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {SUGGESTED_CAPABILITIES.map((capability) => (
                  <motion.div
                    key={capability}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Badge
                      variant={selectedCapabilities.includes(capability) ? 'default' : 'outline'}
                      className="cursor-pointer w-full justify-center p-2 text-xs"
                      onClick={() => handleCapabilityToggle(capability)}
                    >
                      {capability}
                    </Badge>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={customCapability}
                  onChange={(e) => setCustomCapability(e.target.value)}
                  placeholder="Add custom capability..."
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomCapability()}
                />
                <Button variant="outline" onClick={addCustomCapability}>
                  Add
                </Button>
              </div>

              {selectedCapabilities.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Capabilities:</Label>
                  <div className="flex flex-wrap gap-1">
                    {selectedCapabilities.map((capability) => (
                      <Badge
                        key={capability}
                        variant="default"
                        className="cursor-pointer"
                        onClick={() => handleCapabilityToggle(capability)}
                      >
                        {capability} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Prompt Engineering */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                System Prompt
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={generateSamplePrompt}
                disabled={!name.trim() || selectedCapabilities.length === 0}
              >
                <Wand2 className="h-4 w-4 mr-1" />
                Generate Sample
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="system-prompt">System Prompt</Label>
                <Textarea
                  id="system-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Define how your agent should behave, its personality, and its core instructions..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  This prompt will define your agent's personality, behavior, and capabilities. 
                  Be specific about how the agent should respond and what tasks it should handle.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {name && prompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Agent Preview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{name}</span>
                    {description && (
                      <span className="text-sm text-muted-foreground">- {description}</span>
                    )}
                  </div>
                  {selectedCapabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedCapabilities.slice(0, 3).map((capability) => (
                        <Badge key={capability} variant="secondary" className="text-xs">
                          {capability}
                        </Badge>
                      ))}
                      {selectedCapabilities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{selectedCapabilities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground bg-muted/30 rounded p-2 max-h-24 overflow-y-auto">
                    {prompt.slice(0, 200)}...
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { onClose(); reset(); }}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleSubmit}
              disabled={!name.trim() || !prompt.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}