'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Edit2, Check } from 'lucide-react';
import { SensitiveElement, DetectionResult } from '@/lib/gemini';

interface SensitiveElementsProps {
  detectionResult: DetectionResult;
  onGenerateCompliantImage: (selectedSuggestions: string[]) => void;
  isGenerating?: boolean;
}

export function SensitiveElements({ 
  detectionResult, 
  onGenerateCompliantImage,
  isGenerating = false 
}: SensitiveElementsProps) {
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(null);
  const [customSuggestions, setCustomSuggestions] = useState<Record<string, string>>({});

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'trademark': return '商标';
      case 'copyright': return '版权';
      case 'product': return '产品';
      case 'character': return '角色';
      case 'artwork': return '艺术作品';
      default: return type;
    }
  };

  const handleElementToggle = (elementId: string) => {
    const newSelected = new Set(selectedElements);
    if (newSelected.has(elementId)) {
      newSelected.delete(elementId);
    } else {
      newSelected.add(elementId);
    }
    setSelectedElements(newSelected);
  };

  const handleSuggestionEdit = (elementId: string, newSuggestion: string) => {
    setCustomSuggestions(prev => ({
      ...prev,
      [elementId]: newSuggestion
    }));
    setEditingSuggestion(null);
  };

  const handleGenerate = () => {
    const selectedSuggestions = detectionResult.elements
      .filter(element => selectedElements.has(element.id))
      .map(element => customSuggestions[element.id] || element.suggestion);
    
    onGenerateCompliantImage(selectedSuggestions);
  };

  if (!detectionResult.hasSensitiveContent) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center">
          <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">图片检测完成</h3>
          <p className="text-muted-foreground">
            未检测到敏感元素，图片可以安全使用。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            检测到敏感元素
            <Badge variant={getRiskColor(detectionResult.overallRisk)}>
              {detectionResult.overallRisk === 'high' ? '高风险' : 
               detectionResult.overallRisk === 'medium' ? '中风险' : '低风险'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {detectionResult.elements.map((element) => (
            <div key={element.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={element.id}
                    checked={selectedElements.has(element.id)}
                    onCheckedChange={() => handleElementToggle(element.id)}
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={element.id} className="font-medium">
                        {element.content}
                      </Label>
                      <Badge variant={getRiskColor(element.riskLevel)}>
                        {getTypeLabel(element.type)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      位置: {element.location}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="ml-6 space-y-2">
                <Label className="text-sm font-medium">修改建议:</Label>
                {editingSuggestion === element.id ? (
                  <div className="flex gap-2">
                    <Input
                      defaultValue={customSuggestions[element.id] || element.suggestion}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleSuggestionEdit(element.id, e.currentTarget.value);
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input');
                        if (input) {
                          handleSuggestionEdit(element.id, input.value);
                        }
                      }}
                    >
                      保存
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-muted p-3 rounded">
                    <p className="text-sm">
                      {customSuggestions[element.id] || element.suggestion}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSuggestion(element.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t">
            <Button
              onClick={handleGenerate}
              disabled={selectedElements.size === 0 || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  生成中...
                </>
              ) : (
                `一键修改 (${selectedElements.size} 项建议)`
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}