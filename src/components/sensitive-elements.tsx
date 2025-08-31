'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Edit2, Check } from 'lucide-react';
import { DetectionResult } from '@/lib/gemini';
import { ProgressBar, completeProgressBar } from '@/components/progress-bar';

// 为了兼容API返回的数据结构，我们需要重新定义接口
interface SensitiveElement {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  suggestions: string[];
}

interface SensitiveElementsProps {
  detectionResult: DetectionResult;
  onGenerateCompliantImage: (selectedSuggestions: string[]) => Promise<void>;
  isGenerating?: boolean;
  onBackToHome?: () => void;
}

export function SensitiveElements({ 
  detectionResult, 
  onGenerateCompliantImage,
  isGenerating = false,
  onBackToHome
}: SensitiveElementsProps) {
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());
  const [editingSuggestion, setEditingSuggestion] = useState<string | null>(null);
  const [customSuggestions, setCustomSuggestions] = useState<Record<string, string>>({});
  const [showProgress, setShowProgress] = useState(false);

  // 按类型分组敏感元素
  const groupedElements = detectionResult.elements.reduce((groups, element, index) => {
    const type = element.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push({ ...element, index });
    return groups;
  }, {} as Record<string, Array<SensitiveElement & { index: number }>>);

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

  const handleElementToggle = (elementIndex: string) => {
    const newSelected = new Set(selectedElements);
    if (newSelected.has(elementIndex)) {
      newSelected.delete(elementIndex);
    } else {
      newSelected.add(elementIndex);
    }
    setSelectedElements(newSelected);
    
    // 更新类型选择状态
    updateTypeSelection();
  };

  const handleTypeToggle = (type: string) => {
    const typeElements = groupedElements[type];
    const typeElementIds = typeElements.map(el => el.index.toString());
    const newSelected = new Set(selectedElements);
    
    // 检查是否所有该类型的元素都已选中
    const allSelected = typeElementIds.every(id => selectedElements.has(id));
    
    if (allSelected) {
      // 取消选择所有该类型的元素
      typeElementIds.forEach(id => newSelected.delete(id));
    } else {
      // 选择所有该类型的元素
      typeElementIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedElements(newSelected);
    updateTypeSelection();
  };

  const updateTypeSelection = () => {
    const newSelectedTypes = new Set<string>();
    
    Object.entries(groupedElements).forEach(([type, elements]) => {
      const typeElementIds = elements.map(el => el.index.toString());
      const selectedCount = typeElementIds.filter(id => selectedElements.has(id)).length;
      
      if (selectedCount === typeElementIds.length) {
        newSelectedTypes.add(type);
      }
    });
    
    setSelectedTypes(newSelectedTypes);
  };

  const getTypeSelectionState = (type: string) => {
    const typeElements = groupedElements[type];
    const typeElementIds = typeElements.map(el => el.index.toString());
    const selectedCount = typeElementIds.filter(id => selectedElements.has(id)).length;
    
    if (selectedCount === 0) return 'none';
    if (selectedCount === typeElementIds.length) return 'all';
    return 'partial';
  };

  const handleSuggestionEdit = (elementIndex: string, newSuggestion: string) => {
    setCustomSuggestions(prev => ({
      ...prev,
      [elementIndex]: newSuggestion
    }));
    setEditingSuggestion(null);
  };

  const handleSelectAll = () => {
    const allElementIds = new Set(detectionResult.elements.map((_, index) => index.toString()));
    setSelectedElements(allElementIds);
  };

  const handleDeselectAll = () => {
    setSelectedElements(new Set());
  };

  const handleGenerate = async () => {
    const selectedSuggestions = detectionResult.elements
      .filter((_, index) => selectedElements.has(index.toString()))
      .flatMap((element, index) => {
        const customSuggestion = customSuggestions[index.toString()];
        return customSuggestion ? [customSuggestion] : element.suggestions;
      });
    
    setShowProgress(true);
    
    try {
      await onGenerateCompliantImage(selectedSuggestions);
      // API返回后完成进度条
      completeProgressBar();
    } catch (error) {
      setShowProgress(false);
      throw error;
    }
  };

  if (!detectionResult.hasSensitiveContent) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6 text-center space-y-4">
          <Check className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">图片检测完成</h3>
          <p className="text-muted-foreground mb-4">
            未检测到敏感元素，图片可以安全使用。
          </p>
          {onBackToHome && (
            <Button
              onClick={onBackToHome}
              variant="outline"
              className="mt-4"
            >
              返回主页
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              检测到敏感元素
              <Badge variant="destructive">
                高风险
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={selectedElements.size === detectionResult.elements.length ? handleDeselectAll : handleSelectAll}
              >
                {selectedElements.size === detectionResult.elements.length ? '取消全选' : '一键全选'}
              </Button>
              {onBackToHome && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBackToHome}
                >
                  返回主页
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedElements).map(([type, elements]) => {
            const selectionState = getTypeSelectionState(type);
            return (
              <div key={type} className="border rounded-lg p-4 space-y-4">
                {/* 类型标题和选择框 */}
                <div className="flex items-center space-x-3 pb-2 border-b">
                  <Checkbox
                    id={`type-${type}`}
                    checked={selectionState === 'all'}
                    ref={(el) => {
                      if (el) {
                        el.indeterminate = selectionState === 'partial';
                      }
                    }}
                    onCheckedChange={() => handleTypeToggle(type)}
                    className={selectionState === 'partial' ? 'data-[state=checked]:bg-muted' : ''}
                  />
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`type-${type}`} className="font-semibold text-lg">
                      {getTypeLabel(type)}
                    </Label>
                    <Badge variant={getRiskColor(elements[0].severity)}>
                      {elements.length} 项
                    </Badge>
                  </div>
                </div>
                
                {/* 该类型下的具体元素 */}
                <div className="space-y-3 ml-6">
                  {elements.map((element) => (
                    <div key={element.index} className="border rounded-lg p-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={element.index.toString()}
                            checked={selectedElements.has(element.index.toString())}
                            onCheckedChange={() => handleElementToggle(element.index.toString())}
                          />
                          <div className="space-y-1">
                            <Label htmlFor={element.index.toString()} className="font-medium">
                              {element.description}
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              严重程度: {element.severity === 'high' ? '高' : element.severity === 'medium' ? '中' : '低'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 space-y-2">
                        <Label className="text-sm font-medium">修改建议:</Label>
                        {editingSuggestion === element.index.toString() ? (
                          <div className="flex gap-2">
                            <Input
                              defaultValue={customSuggestions[element.index.toString()] || element.suggestions.join('; ')}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleSuggestionEdit(element.index.toString(), e.currentTarget.value);
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={(e) => {
                                const input = e.currentTarget.parentElement?.querySelector('input');
                                if (input) {
                                  handleSuggestionEdit(element.index.toString(), input.value);
                                }
                              }}
                            >
                              保存
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {element.suggestions.map((suggestion, suggestionIndex) => (
                              <div key={suggestionIndex} className="flex items-center justify-between bg-muted p-3 rounded">
                                <p className="text-sm">
                                  {customSuggestions[element.index.toString()] || suggestion}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingSuggestion(element.index.toString())}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          <div className="pt-4 border-t space-y-4">
            {showProgress && (
              <ProgressBar 
                isActive={isGenerating} 
                onComplete={() => setShowProgress(false)}
                className="mb-4"
              />
            )}
            <Button
              onClick={handleGenerate}
              disabled={selectedElements.size === 0 || isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  AI正在生成合规图片...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  一键生成合规图片 ({selectedElements.size} 项建议)
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}