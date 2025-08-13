import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Wrench, Play, Settings, FileCode, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface Tool {
  id: string;
  name: string;
  description: string;
  type: 'function' | 'api' | 'webhook';
  parameters: any[];
  code?: string;
  url?: string;
  method?: string;
}

interface ToolCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTool: (tool: Omit<Tool, 'id'>) => void;
  isLoading: boolean;
}

const TOOL_TEMPLATES = [
  {
    name: 'Web Search',
    description: 'Search the web for information',
    type: 'api' as const,
    parameters: [{ name: 'query', type: 'string', required: true, description: 'Search query' }],
    code: `async function webSearch(query) {
  const response = await fetch(\`https://api.tavily.com/search\`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': process.env.TAVILY_API_KEY
    },
    body: JSON.stringify({
      query: query,
      search_depth: 'basic',
      include_answer: true
    })
  });
  
  const data = await response.json();
  return data.answer || 'No results found';
}`
  },
  {
    name: 'Email Sender',
    description: 'Send emails to users',
    type: 'function' as const,
    parameters: [
      { name: 'to', type: 'string', required: true, description: 'Recipient email' },
      { name: 'subject', type: 'string', required: true, description: 'Email subject' },
      { name: 'body', type: 'string', required: true, description: 'Email body' }
    ],
    code: `async function sendEmail(to, subject, body) {
  // Implementation would connect to your email service
  console.log(\`Sending email to \${to}: \${subject}\`);
  return { status: 'sent', messageId: 'msg_' + Date.now() };
}`
  },
  {
    name: 'Data Processor',
    description: 'Process and analyze data',
    type: 'function' as const,
    parameters: [
      { name: 'data', type: 'array', required: true, description: 'Data to process' },
      { name: 'operation', type: 'string', required: true, description: 'Processing operation' }
    ],
    code: `async function processData(data, operation) {
  switch (operation) {
    case 'sum':
      return data.reduce((a, b) => a + b, 0);
    case 'average':
      return data.reduce((a, b) => a + b, 0) / data.length;
    case 'max':
      return Math.max(...data);
    case 'min':
      return Math.min(...data);
    default:
      return data;
  }
}`
  }
];

export function ToolCreationModal({ isOpen, onClose, onCreateTool, isLoading }: ToolCreationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'function' | 'api' | 'webhook'>('function');
  const [code, setCode] = useState('');
  const [url, setUrl] = useState('');
  const [method, setMethod] = useState('POST');
  const [parameters, setParameters] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const addParameter = () => {
    setParameters(prev => [...prev, {
      name: '',
      type: 'string',
      required: false,
      description: ''
    }]);
  };

  const updateParameter = (index: number, field: string, value: any) => {
    setParameters(prev => prev.map((param, i) => 
      i === index ? { ...param, [field]: value } : param
    ));
  };

  const removeParameter = (index: number) => {
    setParameters(prev => prev.filter((_, i) => i !== index));
  };

  const loadTemplate = (template: any) => {
    setName(template.name);
    setDescription(template.description);
    setType(template.type);
    setCode(template.code || '');
    setParameters(template.parameters || []);
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) return;
    
    onCreateTool({
      name: name.trim(),
      description: description.trim(),
      type,
      parameters,
      code: type === 'function' ? code : undefined,
      url: type === 'api' || type === 'webhook' ? url : undefined,
      method: type === 'api' || type === 'webhook' ? method : undefined,
    });
  };

  const reset = () => {
    setName('');
    setDescription('');
    setType('function');
    setCode('');
    setUrl('');
    setMethod('POST');
    setParameters([]);
    setActiveTab('basic');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Wrench className="h-6 w-6 text-primary" />
            Create Custom Tool
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tool Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tool-name">Tool Name</Label>
                    <Input
                      id="tool-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., web_search"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tool-type">Tool Type</Label>
                    <Select value={type} onValueChange={(value) => setType(value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="function">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Function
                          </div>
                        </SelectItem>
                        <SelectItem value="api">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            API Call
                          </div>
                        </SelectItem>
                        <SelectItem value="webhook">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Webhook
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tool-description">Description</Label>
                  <Textarea
                    id="tool-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this tool does and how it should be used..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                {(type === 'api' || type === 'webhook') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="tool-url">URL</Label>
                      <Input
                        id="tool-url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://api.example.com/endpoint"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="tool-method">Method</Label>
                      <Select value={method} onValueChange={setMethod}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Start Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {TOOL_TEMPLATES.map((template, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="cursor-pointer hover:border-primary/50 transition-all" onClick={() => loadTemplate(template)}>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{template.type}</Badge>
                            </div>
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Function Parameters</CardTitle>
                <Button variant="outline" size="sm" onClick={addParameter}>
                  Add Parameter
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {parameters.map((param, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border/50 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Parameter {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeParameter(index)}
                          className="h-6 w-6 p-0"
                        >
                          ×
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>Name</Label>
                          <Input
                            value={param.name}
                            onChange={(e) => updateParameter(index, 'name', e.target.value)}
                            placeholder="parameter_name"
                          />
                        </div>
                        <div>
                          <Label>Type</Label>
                          <Select value={param.type} onValueChange={(value) => updateParameter(index, 'type', value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                              <SelectItem value="array">Array</SelectItem>
                              <SelectItem value="object">Object</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={param.required}
                            onChange={(e) => updateParameter(index, 'required', e.target.checked)}
                            className="rounded"
                          />
                          <Label>Required</Label>
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Input
                          value={param.description}
                          onChange={(e) => updateParameter(index, 'description', e.target.value)}
                          placeholder="Parameter description..."
                        />
                      </div>
                    </motion.div>
                  ))}

                  {parameters.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No parameters defined. Click "Add Parameter" to get started.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="implementation" className="space-y-6">
            {type === 'function' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileCode className="h-5 w-5" />
                    Function Implementation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="function-code">JavaScript Code</Label>
                    <Textarea
                      id="function-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="async function myTool(param1, param2) {
  // Your implementation here
  return result;
}"
                      rows={15}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Write your function implementation. The function will receive the parameters as arguments.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {(type === 'api' || type === 'webhook') && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Request Preview</h4>
                    <div className="space-y-2 text-sm font-mono">
                      <div><span className="text-muted-foreground">Method:</span> {method}</div>
                      <div><span className="text-muted-foreground">URL:</span> {url || 'https://api.example.com/endpoint'}</div>
                      <div><span className="text-muted-foreground">Parameters:</span> {parameters.length} defined</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Headers (Optional)</Label>
                    <Textarea
                      placeholder='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_TOKEN"}'
                      rows={3}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Tool Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{name || 'unnamed_tool'}</span>
                    <Badge variant="outline">{type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {description || 'No description provided'}
                  </p>
                  {parameters.length > 0 && (
                    <div className="text-sm">
                      <span className="font-semibold">Parameters:</span> {parameters.map(p => p.name).join(', ')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>
            Cancel
          </Button>
          <Button 
            variant="default" 
            onClick={handleSubmit}
            disabled={!name.trim() || !description.trim() || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Tool'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}