import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit3, Brain, User, Code } from 'lucide-react';
import { motion } from 'framer-motion';

interface MemoryBlock {
  id: string;
  label: string;
  value: string;
  description?: string;
  template: boolean;
}

interface MemoryBlockProps {
  block: MemoryBlock;
  onEdit: (blockId: string) => void;
  index: number;
}

const getBlockIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case 'persona':
      return <Brain className="h-4 w-4 text-primary" />;
    case 'human':
      return <User className="h-4 w-4 text-accent" />;
    default:
      return <Code className="h-4 w-4 text-tool-accent" />;
  }
};

const getBlockVariant = (label: string) => {
  switch (label.toLowerCase()) {
    case 'persona':
      return 'memory';
    case 'human':
      return 'agent';
    default:
      return 'tool';
  }
};

export function MemoryBlockComponent({ block, onEdit, index }: MemoryBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className="memory-pulse hover:glow-neural transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            {getBlockIcon(block.label)}
            {block.label}
          </CardTitle>
          <div className="flex items-center gap-2">
            {block.template && (
              <Badge variant="secondary" className="text-xs">
                Template
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(block.id)}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {block.description && (
            <p className="text-xs text-muted-foreground italic">
              {block.description}
            </p>
          )}
          
          <div className="text-sm bg-muted/30 rounded-md p-3 max-h-24 overflow-y-auto">
            <p className="whitespace-pre-wrap">{block.value}</p>
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Block ID: {block.id.slice(-8)}</span>
            <Badge variant={getBlockVariant(block.label) as any} className="text-xs">
              {block.label.toUpperCase()}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}