import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, User, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface MemoryBlockInput {
  label: string;
  value: string;
  description?: string;
}

interface AgentCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateAgent: (agentData: {
    name: string;
    model: string;
    embedding: string;
    memoryBlocks: MemoryBlockInput[];
    tools: string[];
  }) => void;
  isLoading: boolean;
}

const AVAILABLE_MODELS = [
  'openai/gpt-4.1',
  'openai/gpt-4o-mini',
  'anthropic/claude-3-sonnet-20240229',
  'google/gemini-2.5-flash'
];

const AVAILABLE_EMBEDDINGS = [
  'openai/text-embedding-3-small',
  'openai/text-embedding-3-large',
  'openai/text-embedding-ada-002'
];

const AVAILABLE_TOOLS = [
  'web_search',
  'run_code',
  'send_message',
  'edit_memory',
  'search_memory'
];

export function AgentCreationModal({ isOpen, onClose, onCreateAgent, isLoading }: AgentCreationModalProps) {
  const [name, setName] = useState('');
  const [model, setModel] = useState('openai/gpt-4.1');
  const [embedding, setEmbedding] = useState('openai/text-embedding-3-small');
  const [selectedTools, setSelectedTools] = useState<string[]>(['web_search', 'run_code']);
  const [memoryBlocks, setMemoryBlocks] = useState<MemoryBlockInput[]>([
    {
      label: 'persona',
      value: 'I am a helpful AI assistant created by Letta. I am knowledgeable, professional, and always aim to provide accurate and useful information.',
      description: 'Stores details about your current persona, guiding how you behave and respond.'
    },
    {
      label: 'human',
      value: 'The user is someone who wants to interact with an intelligent AI agent.',
      description: 'Stores key details about the person you are conversing with.'
    }
  ]);

  const handleToolToggle = (tool: string) => {
    setSelectedTools(prev => 
      prev.includes(tool) 
        ? prev.filter(t => t !== tool)
        : [...prev, tool]
    );
  };

  const addMemoryBlock = () => {
    setMemoryBlocks(prev => [...prev, { label: '', value: '', description: '' }]);
  };

  const updateMemoryBlock = (index: number, field: keyof MemoryBlockInput, value: string) => {
    setMemoryBlocks(prev => prev.map((block, i) => 
      i === index ? { ...block, [field]: value } : block
    ));
  };

  const removeMemoryBlock = (index: number) => {
    setMemoryBlocks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    
    onCreateAgent({
      name: name.trim(),
      model,
      embedding,
      memoryBlocks: memoryBlocks.filter(block => block.label && block.value),
      tools: selectedTools
    });
  };

  const reset = () => {
    setName('');
    setModel('openai/gpt-4.1');
    setEmbedding('openai/text-embedding-3-small');
    setSelectedTools(['web_search', 'run_code']);
    setMemoryBlocks([
      {
        label: 'persona',
        value: 'I am a helpful AI assistant created by Letta. I am knowledgeable, professional, and always aim to provide accurate and useful information.',
        description: 'Stores details about your current persona, guiding how you behave and respond.'
      },
      {
        label: 'human',
        value: 'The user is someone who wants to interact with an intelligent AI agent.',
        description: 'Stores key details about the person you are conversing with.'
      }
    ]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-primary" />
            Create New Agent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Agent Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter agent name..."
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_MODELS.map((modelOption) => (
                        <SelectItem key={modelOption} value={modelOption}>
                          {modelOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="embedding">Embedding Model</Label>
                  <Select value={embedding} onValueChange={setEmbedding}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_EMBEDDINGS.map((embeddingOption) => (
                        <SelectItem key={embeddingOption} value={embeddingOption}>
                          {embeddingOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Memory Blocks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Memory Blocks</CardTitle>
              <Button size="sm" variant="neural" onClick={addMemoryBlock}>
                <Plus className="h-4 w-4" />
                Add Block
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {memoryBlocks.map((block, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-border/50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {block.label === 'persona' && <Brain className="h-4 w-4 text-primary" />}
                      {block.label === 'human' && <User className="h-4 w-4 text-accent" />}
                      <Badge variant={block.label === 'persona' ? 'memory' : block.label === 'human' ? 'agent' : 'tool'}>
                        {block.label || 'Custom'}
                      </Badge>
                    </div>
                    {index > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeMemoryBlock(index)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Label</Label>
                      <Input
                        value={block.label}
                        onChange={(e) => updateMemoryBlock(index, 'label', e.target.value)}
                        placeholder="Block label..."
                        disabled={index < 2} // Persona and human blocks are required
                      />
                    </div>
                    <div>
                      <Label>Description (Optional)</Label>
                      <Input
                        value={block.description}
                        onChange={(e) => updateMemoryBlock(index, 'description', e.target.value)}
                        placeholder="Block description..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Content</Label>
                    <Textarea
                      value={block.value}
                      onChange={(e) => updateMemoryBlock(index, 'value', e.target.value)}
                      placeholder="Block content..."
                      rows={3}
                    />
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {AVAILABLE_TOOLS.map((tool) => (
                  <div key={tool} className="flex items-center space-x-2">
                    <Checkbox
                      id={tool}
                      checked={selectedTools.includes(tool)}
                      onCheckedChange={() => handleToolToggle(tool)}
                    />
                    <Label htmlFor={tool} className="text-sm cursor-pointer">
                      {tool.replace('_', ' ').toUpperCase()}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { onClose(); reset(); }}>
              Cancel
            </Button>
            <Button 
              variant="neural" 
              onClick={handleSubmit}
              disabled={!name.trim() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Agent'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}