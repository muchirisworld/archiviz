'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Brain,
    Lightbulb,
    Code,
    TrendingUp,
    AlertTriangle,
    CheckCircle,
    Clock,
    Zap,
    Sparkles,
    BarChart3,
    FileText,
    Shield,
    RefreshCw
} from 'lucide-react';

interface AIAnalysisPanelProps {
    symbolId?: string;
    symbolName?: string;
    symbolType?: string;
    className?: string;
}

interface AnalysisResult {
    type: 'explanation' | 'pattern' | 'complexity' | 'suggestion' | 'health';
    content: string;
    confidence: number;
    metadata?: Record<string, any>;
}

const analysisTypes = [
    {
        key: 'explanation',
        label: 'Explanation',
        icon: FileText,
        description: 'Understand what this code does',
        color: 'text-blue-500'
    },
    {
        key: 'pattern',
        label: 'Patterns',
        icon: Sparkles,
        description: 'Identify design patterns',
        color: 'text-purple-500'
    },
    {
        key: 'complexity',
        label: 'Complexity',
        icon: BarChart3,
        description: 'Analyze code complexity',
        color: 'text-orange-500'
    },
    {
        key: 'suggestion',
        label: 'Suggestions',
        icon: Lightbulb,
        description: 'Get refactoring suggestions',
        color: 'text-green-500'
    },
    {
        key: 'health',
        label: 'Health',
        icon: Shield,
        description: 'Code quality assessment',
        color: 'text-red-500'
    }
];

export default function AIAnalysisPanel({
    symbolId,
    symbolName,
    symbolType,
    className = ''
}: AIAnalysisPanelProps) {
    const [activeTab, setActiveTab] = useState('explanation');
    const [analysisResults, setAnalysisResults] = useState<Record<string, AnalysisResult>>({});
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [errorStates, setErrorStates] = useState<Record<string, string>>({});

    useEffect(() => {
        if (symbolId) {
            loadAnalysis(activeTab);
        }
    }, [symbolId, activeTab]);

    const loadAnalysis = async (analysisType: string) => {
        if (!symbolId) return;

        setLoadingStates(prev => ({ ...prev, [analysisType]: true }));
        setErrorStates(prev => ({ ...prev, [analysisType]: '' }));

        try {
            const response = await fetch('/api/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ symbolId, analysisType }),
            });

            if (response.ok) {
                const data = await response.json();
                setAnalysisResults(prev => ({
                    ...prev,
                    [analysisType]: data.result
                }));
            } else {
                const errorData = await response.json();
                setErrorStates(prev => ({
                    ...prev,
                    [analysisType]: errorData.error || 'Analysis failed'
                }));
            }
        } catch (error) {
            setErrorStates(prev => ({
                ...prev,
                [analysisType]: 'Network error occurred'
            }));
        } finally {
            setLoadingStates(prev => ({ ...prev, [analysisType]: false }));
        }
    };

    const refreshAnalysis = () => {
        if (symbolId) {
            loadAnalysis(activeTab);
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-500';
        if (confidence >= 0.6) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getConfidenceIcon = (confidence: number) => {
        if (confidence >= 0.8) return <CheckCircle className="h-4 w-4" />;
        if (confidence >= 0.6) return <AlertTriangle className="h-4 w-4" />;
        return <AlertTriangle className="h-4 w-4" />;
    };

    if (!symbolId) {
        return (
            <Card className={className}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select a symbol to analyze with AI</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5" />
                        AI Analysis
                    </CardTitle>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshAnalysis}
                        disabled={loadingStates[activeTab]}
                    >
                        <RefreshCw className={`h-4 w-4 ${loadingStates[activeTab] ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
                {symbolName && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{symbolName}</span>
                        {symbolType && <Badge variant="secondary">{symbolType}</Badge>}
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-5">
                        {analysisTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                                <TabsTrigger key={type.key} value={type.key} className="text-xs">
                                    <Icon className="h-3 w-3 mr-1" />
                                    {type.label}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {analysisTypes.map((type) => {
                        const Icon = type.icon;
                        const result = analysisResults[type.key];
                        const isLoading = loadingStates[type.key];
                        const error = errorStates[type.key];

                        return (
                            <TabsContent key={type.key} value={type.key} className="mt-4">
                                <div className="space-y-4">
                                    {/* Header */}
                                    <div className="flex items-center gap-2">
                                        <Icon className={`h-4 w-4 ${type.color}`} />
                                        <h3 className="font-medium">{type.label}</h3>
                                        {result && (
                                            <div className="flex items-center gap-1 ml-auto">
                                                {getConfidenceIcon(result.confidence)}
                                                <span className={`text-xs ${getConfidenceColor(result.confidence)}`}>
                                                    {(result.confidence * 100).toFixed(0)}% confidence
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground">
                                        {type.description}
                                    </p>

                                    <Separator />

                                    {/* Content */}
                                    <ScrollArea className="h-64">
                                        {isLoading && (
                                            <div className="flex items-center justify-center py-8">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="h-4 w-4 animate-pulse" />
                                                    <span>Analyzing code...</span>
                                                </div>
                                            </div>
                                        )}

                                        {error && (
                                            <div className="flex items-center gap-2 p-4 text-red-500 bg-red-50 rounded-md">
                                                <AlertTriangle className="h-4 w-4" />
                                                <span className="text-sm">{error}</span>
                                            </div>
                                        )}

                                        {result && !isLoading && !error && (
                                            <div className="prose prose-sm max-w-none">
                                                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                                                    {result.content}
                                                </div>
                                                
                                                {result.metadata && (
                                                    <div className="mt-4 p-3 bg-muted rounded-md">
                                                        <h4 className="text-xs font-medium mb-2">Analysis Metadata</h4>
                                                        <pre className="text-xs text-muted-foreground">
                                                            {JSON.stringify(result.metadata, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {!result && !isLoading && !error && (
                                            <div className="text-center text-muted-foreground py-8">
                                                <Icon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">No analysis available</p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => loadAnalysis(type.key)}
                                                    className="mt-2"
                                                >
                                                    Run Analysis
                                                </Button>
                                            </div>
                                        )}
                                    </ScrollArea>
                                </div>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </CardContent>
        </Card>
    );
}
