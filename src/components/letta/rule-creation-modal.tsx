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
import { GitBranch, Zap, ArrowRight, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Rule {
  id: string;
  name: string;
  description: string;
  type: 'sequence' | 'condition' | 'loop' | 'parallel';
  steps: RuleStep[];
  conditions?: Condition[];
}

interface RuleStep {
  id: string;
  toolName: string;
  parameters: Record<string, any>;
  order: number;
}

interface Condition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
}

interface RuleCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRule: (rule: Omit<Rule, 'id'>) => void;
  availableTools: string[];
  isLoading: boolean;
}

const RULE_TYPES = [
  {
    type: 'sequence',
    name: 'Sequential',
    description: 'Execute tools one after another',
    icon: ArrowRight
  },
  {
    type: 'condition',
    name: 'Conditional',
    description: 'Execute tools based on conditions',
    icon: GitBranch
  },
  {
    type: 'parallel',
    name: 'Parallel',
    description: 'Execute multiple tools simultaneously',
    icon: Zap
  },
  {
    type: 'loop',
    name: 'Loop',
    description: 'Repeat tools until condition is met',
    icon: ArrowRight
  }
];

export function RuleCreationModal({ isOpen, onClose, onCreateRule, availableTools, isLoading }: RuleCreationModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'sequence' | 'condition' | 'loop' | 'parallel'>('sequence');
  const [steps, setSteps] = useState<RuleStep[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  const addStep = () => {
    const newStep: RuleStep = {
      id: `step-${Date.now()}`,
      toolName: availableTools[0] || '',
      parameters: {},
      order: steps.length
    };
    setSteps(prev => [...prev, newStep]);
  };

  const updateStep = (stepId: string, field: string, value: any) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, [field]: value } : step
    ));
  };

  const removeStep = (stepId: string) => {
    setSteps(prev => prev.filter(step => step.id !== stepId));
  };

  const addCondition = () => {
    const newCondition: Condition = {
      field: '',
      operator: 'equals',
      value: ''
    };
    setConditions(prev => [...prev, newCondition]);
  };

  const updateCondition = (index: number, field: string, value: any) => {
    setConditions(prev => prev.map((condition, i) => 
      i === index ? { ...condition, [field]: value } : condition
    ));
  };

  const removeCondition = (index: number) => {
    setConditions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim() || steps.length === 0) return;
    
    onCreateRule({
      name: name.trim(),
      description: description.trim(),
      type,
      steps,
      conditions: type === 'condition' || type === 'loop' ? conditions : undefined
    });
  };

  const reset = () => {
    setName('');
    setDescription('');
    setType('sequence');
    setSteps([]);
    setConditions([]);
    setActiveTab('basic');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <GitBranch className="h-6 w-6 text-primary" />
            Create Tool Rule
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Rule Info</TabsTrigger>
            <TabsTrigger value="steps">Tool Steps</TabsTrigger>
            <TabsTrigger value="conditions" disabled={type !== 'condition' && type !== 'loop'}>
              Conditions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rule Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input
                      id="rule-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., research_and_summarize"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rule-type">Rule Type</Label>
                    <Select value={type} onValueChange={(value) => setType(value as any)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RULE_TYPES.map((ruleType) => (
                          <SelectItem key={ruleType.type} value={ruleType.type}>
                            <div className="flex items-center gap-2">
                              <ruleType.icon className="h-4 w-4" />
                              {ruleType.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="rule-description">Description</Label>
                  <Textarea
                    id="rule-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this rule does and when it should be triggered..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Rule Type Explanation */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                          {RULE_TYPES.find(rt => rt.type === type) && (
                            React.createElement(RULE_TYPES.find(rt => rt.type === type)!.icon, { className: "h-5 w-5 text-primary" })
                          )}
                  <h4 className="font-semibold">
                    {RULE_TYPES.find(rt => rt.type === type)?.name} Rule
                  </h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {RULE_TYPES.find(rt => rt.type === type)?.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="steps" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Tool Execution Steps</CardTitle>
                <Button variant="outline" size="sm" onClick={addStep} disabled={availableTools.length === 0}>
                  <Plus className="h-4 w-4" />
                  Add Step
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <AnimatePresence>
                    {steps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border border-border/50 rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Step {index + 1}</Badge>
                            {type === 'sequence' && index < steps.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            {type === 'parallel' && (
                              <Zap className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Tool</Label>
                            <Select 
                              value={step.toolName} 
                              onValueChange={(value) => updateStep(step.id, 'toolName', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableTools.map((tool) => (
                                  <SelectItem key={tool} value={tool}>
                                    {tool}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Parameters (JSON)</Label>
                            <Input
                              value={JSON.stringify(step.parameters)}
                              onChange={(e) => {
                                try {
                                  const params = JSON.parse(e.target.value);
                                  updateStep(step.id, 'parameters', params);
                                } catch {
                                  // Invalid JSON, ignore
                                }
                              }}
                              placeholder='{"param1": "value1"}'
                              className="font-mono text-sm"
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {steps.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      {availableTools.length === 0 ? (
                        "No tools available. Create some tools first."
                      ) : (
                        "No steps defined. Click 'Add Step' to get started."
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Rule Flow Visualization */}
            {steps.length > 0 && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">Rule Flow Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    {steps.map((step, index) => (
                      <React.Fragment key={step.id}>
                        <Badge variant="outline" className="p-2">
                          {step.toolName || 'Unknown Tool'}
                        </Badge>
                        {index < steps.length - 1 && (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="conditions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Execution Conditions</CardTitle>
                <Button variant="outline" size="sm" onClick={addCondition}>
                  <Plus className="h-4 w-4" />
                  Add Condition
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conditions.map((condition, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border/50 rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Condition {index + 1}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <Label>Field</Label>
                          <Input
                            value={condition.field}
                            onChange={(e) => updateCondition(index, 'field', e.target.value)}
                            placeholder="field_name"
                          />
                        </div>
                        <div>
                          <Label>Operator</Label>
                          <Select 
                            value={condition.operator} 
                            onValueChange={(value) => updateCondition(index, 'operator', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="equals">Equals</SelectItem>
                              <SelectItem value="contains">Contains</SelectItem>
                              <SelectItem value="greater_than">Greater Than</SelectItem>
                              <SelectItem value="less_than">Less Than</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Value</Label>
                          <Input
                            value={condition.value}
                            onChange={(e) => updateCondition(index, 'value', e.target.value)}
                            placeholder="expected_value"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {conditions.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No conditions defined. Click "Add Condition" to get started.
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
            disabled={!name.trim() || !description.trim() || steps.length === 0 || isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Rule'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}