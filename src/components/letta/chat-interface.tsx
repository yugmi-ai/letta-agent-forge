import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Brain, User, Settings, Code, Search, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  messageType: 'assistant_message' | 'reasoning_message' | 'tool_call_message' | 'tool_return_message' | 'user_message';
  content?: string;
  reasoning?: string;
  toolCall?: {
    name: string;
    arguments: any;
  };
  toolReturn?: any;
  timestamp: Date;
}

interface ChatInterfaceProps {
  agentId: string;
  agentName: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

const getMessageIcon = (type: string) => {
  switch (type) {
    case 'assistant_message':
      return <Brain className="h-4 w-4 text-primary" />;
    case 'reasoning_message':
      return <Settings className="h-4 w-4 text-accent" />;
    case 'tool_call_message':
      return <Code className="h-4 w-4 text-tool-accent" />;
    case 'tool_return_message':
      return <Play className="h-4 w-4 text-agent-active" />;
    default:
      return <User className="h-4 w-4 text-foreground" />;
  }
};

const getMessageVariant = (type: string) => {
  switch (type) {
    case 'assistant_message':
      return 'memory';
    case 'reasoning_message':
      return 'agent';
    case 'tool_call_message':
      return 'tool';
    case 'tool_return_message':
      return 'agent';
    default:
      return 'secondary';
  }
};

export function ChatInterface({ agentId, agentName, messages, onSendMessage, isLoading }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatToolArguments = (args: any) => {
    if (typeof args === 'string') return args;
    return JSON.stringify(args, null, 2);
  };

  const formatToolReturn = (returnValue: any) => {
    if (typeof returnValue === 'string') return returnValue;
    return JSON.stringify(returnValue, null, 2);
  };

  return (
    <Card className="h-full flex flex-col glow-neural">
      <CardHeader className="border-b border-border/50">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Chat with {agentName}
          <Badge variant="agent" className="ml-auto">
            Agent ID: {agentId.slice(-8)}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className={`flex ${message.messageType === 'user_message' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.messageType === 'user_message' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-2 ${message.messageType === 'user_message' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="flex-shrink-0 mt-1">
                        {getMessageIcon(message.messageType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getMessageVariant(message.messageType) as any} className="text-xs">
                            {message.messageType.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <div className={`rounded-lg p-3 ${
                          message.messageType === 'user_message' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-card border border-border/50'
                        }`}>
                          {message.content && (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          )}
                          {message.reasoning && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-accent">Agent Reasoning:</p>
                              <p className="text-sm italic text-muted-foreground whitespace-pre-wrap">
                                {message.reasoning}
                              </p>
                            </div>
                          )}
                          {message.toolCall && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-tool-accent">
                                Tool Call: {message.toolCall.name}
                              </p>
                              <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto">
                                {formatToolArguments(message.toolCall.arguments)}
                              </pre>
                            </div>
                          )}
                          {message.toolReturn && (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-agent-active">Tool Return:</p>
                              <pre className="text-xs bg-muted/50 rounded p-2 overflow-x-auto max-h-32 overflow-y-auto">
                                {formatToolReturn(message.toolReturn)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary animate-pulse" />
                  <div className="bg-card border border-border/50 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="border-t border-border/50 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Send a message to your agent..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              variant="default"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}