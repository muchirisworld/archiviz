'use client';

import React, { useState, useMemo } from 'react';
// Add code explanation API integration
async function fetchExplanation(symbolId: string): Promise<string> {
    const res = await fetch('/api/analysis/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbolId }),
    });
    if (!res.ok) return 'No explanation available.';
    const data = await res.json();
    return data.explanation || 'No explanation available.';
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    FileText,
    Code,
    GitBranch,
    Package,
    FunctionSquare,
    Square,
    Variable,
    Import,
    Download,
    Type,
    Layers,
    Settings,
    Database,
    Construction,
    ExternalLink,
    Copy,
    Edit,
    Trash2,
    MoreHorizontal,
    ChevronRight,
    ChevronDown
} from 'lucide-react';
import { GraphNode, GraphEdge } from '@/lib/graph/graph-generator';

interface SidebarPanelProps {
    selectedNode: GraphNode | null;
    relatedNodes: GraphNode[];
    relatedEdges: GraphEdge[];
    onNodeSelect: (nodeId: string) => void;
    onNodeExpand?: (nodeId: string) => void;
    onNodeCollapse?: (nodeId: string) => void;
    className?: string;
}

const getNodeIcon = (type: string) => {
    switch (type) {
        case 'repository':
            return <GitBranch className="h-4 w-4" />;
        case 'package':
            return <Package className="h-4 w-4" />;
        case 'file':
            return <FileText className="h-4 w-4" />;
        case 'function':
            return <FunctionSquare className="h-4 w-4" />;
        case 'class':
            return <Square className="h-4 w-4" />;
        case 'interface':
            return <Code className="h-4 w-4" />;
        case 'variable':
            return <Variable className="h-4 w-4" />;
        case 'import':
            return <Import className="h-4 w-4" />;
        case 'export':
            return <Download className="h-4 w-4" />;
        case 'type':
            return <Type className="h-4 w-4" />;
        case 'namespace':
            return <Layers className="h-4 w-4" />;
        case 'method':
            return <Settings className="h-4 w-4" />;
        case 'field':
            return <Database className="h-4 w-4" />;
        case 'enum':
            return <Code className="h-4 w-4" />;
        case 'struct':
            return <Construction className="h-4 w-4" />;
        case 'trait':
            return <Layers className="h-4 w-4" />;
        default:
            return <Code className="h-4 w-4" />;
    }
};

const getNodeColor = (type: string) => {
    switch (type) {
        case 'repository':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        case 'package':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        case 'file':
            return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
        case 'function':
            return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        case 'class':
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        case 'interface':
            return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
        case 'variable':
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
};

export default function SidebarPanel({
    selectedNode,
    relatedNodes,
    relatedEdges,
    onNodeSelect,
    onNodeExpand,
    onNodeCollapse,
    className = ''
}: SidebarPanelProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['details', 'relationships']));
    const [explanation, setExplanation] = useState<string | null>(null);
    const [loadingExplanation, setLoadingExplanation] = useState(false);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }
            return newSet;
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const formatComplexity = (complexity?: number) => {
        if (!complexity) return 'N/A';
        if (complexity < 5) return 'Low';
        if (complexity < 10) return 'Medium';
        if (complexity < 20) return 'High';
        return 'Very High';
    };

    const getComplexityColor = (complexity?: number) => {
        if (!complexity) return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        if (complexity < 5) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        if (complexity < 10) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        if (complexity < 20) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    };

    const groupedEdges = useMemo(() => {
        const groups: Record<string, GraphEdge[]> = {};
        relatedEdges.forEach(edge => {
            if (!groups[edge.type]) {
                groups[edge.type] = [];
            }
            groups[edge.type].push(edge);
        });
        return groups;
    }, [relatedEdges]);

    // Handler for explain button
    const handleExplain = async () => {
        if (!selectedNode) return;
        setLoadingExplanation(true);
        setExplanation(await fetchExplanation(selectedNode.id));
        setLoadingExplanation(false);
    };

    if (!selectedNode) {
        return (
            <Card className={`w-80 ${className}`}>
                <CardContent className="p-6">
                    <div className="text-center text-muted-foreground">
                        <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="text-sm">Select a node to view details</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={`w-80 ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        {getNodeIcon(selectedNode.type)}
                        <CardTitle className="text-lg">{selectedNode.name}</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex items-center gap-2">
                    <Badge className={getNodeColor(selectedNode.type)}>
                        {selectedNode.type}
                    </Badge>
                    {selectedNode.metadata.language && (
                        <Badge variant="outline">
                            {selectedNode.metadata.language}
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <ScrollArea className="h-[calc(100vh-200px)]">
                <CardContent className="space-y-4">
                    {/* Details Section */}
                    <div>
                        <button
                            onClick={() => toggleSection('details')}
                            className="flex items-center gap-2 w-full text-left font-semibold text-sm hover:text-foreground transition-colors"
                        >
                            {expandedSections.has('details') ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            Details
                        </button>

                        {expandedSections.has('details') && (
                            <div className="mt-3 space-y-3 pl-6">
                                {selectedNode.path && (
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Path</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                                                {selectedNode.path}
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(selectedNode.path!)}
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {selectedNode.metadata.lineCount && (
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Lines of Code</label>
                                        <p className="text-sm mt-1">{selectedNode.metadata.lineCount}</p>
                                    </div>
                                )}

                                {selectedNode.metadata.complexity !== undefined && (
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Complexity</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge className={getComplexityColor(selectedNode.metadata.complexity)}>
                                                {formatComplexity(selectedNode.metadata.complexity)}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                ({selectedNode.metadata.complexity})
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {selectedNode.metadata.lastModified && (
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Last Modified</label>
                                        <p className="text-sm mt-1">
                                            {new Date(selectedNode.metadata.lastModified).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                {selectedNode.parent && (
                                    <div>
                                        <label className="text-xs font-medium text-muted-foreground">Parent</label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 text-sm mt-1"
                                            onClick={() => onNodeSelect(selectedNode.parent!)}
                                        >
                                            {selectedNode.parent}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>


                    {/* AI Code Explanation */}
                    {(selectedNode.type === 'function' || selectedNode.type === 'class') && (
                        <div>
                            <label className="text-xs font-medium text-muted-foreground">AI Explanation</label>
                            <div className="flex items-center gap-2 mt-1">
                                <Button variant="outline" size="sm" onClick={handleExplain} disabled={loadingExplanation}>
                                    Explain
                                </Button>
                                {loadingExplanation && <span className="text-xs text-muted-foreground">Loading...</span>}
                            </div>
                            {explanation && (
                                <div className="mt-2 text-sm bg-muted rounded p-2 border">
                                    {explanation}
                                </div>
                            )}
                        </div>
                    )}
                    <Separator />

                    {/* Relationships Section */}
                    <div>
                        <button
                            onClick={() => toggleSection('relationships')}
                            className="flex items-center gap-2 w-full text-left font-semibold text-sm hover:text-foreground transition-colors"
                        >
                            {expandedSections.has('relationships') ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            Relationships ({relatedEdges.length})
                        </button>

                        {expandedSections.has('relationships') && (
                            <div className="mt-3 space-y-3 pl-6">
                                {Object.entries(groupedEdges).map(([edgeType, edges]) => (
                                    <div key={edgeType}>
                                        <label className="text-xs font-medium text-muted-foreground capitalize">
                                            {edgeType.replace('_', ' ')} ({edges.length})
                                        </label>
                                        <div className="space-y-1 mt-1">
                                            {edges.slice(0, 5).map((edge) => {
                                                const targetNode = relatedNodes.find(n => n.id === edge.target);
                                                return (
                                                    <Button
                                                        key={edge.id}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-auto p-1 text-xs justify-start w-full"
                                                        onClick={() => onNodeSelect(edge.target)}
                                                    >
                                                        <div className="flex items-center gap-2 w-full">
                                                            {getNodeIcon(targetNode?.type || 'unknown')}
                                                            <span className="truncate">{targetNode?.name || edge.target}</span>
                                                            <Badge variant="outline" className="ml-auto text-xs">
                                                                {targetNode?.type || 'unknown'}
                                                            </Badge>
                                                        </div>
                                                    </Button>
                                                );
                                            })}
                                            {edges.length > 5 && (
                                                <p className="text-xs text-muted-foreground">
                                                    +{edges.length - 5} more...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Actions Section */}
                    <div>
                        <button
                            onClick={() => toggleSection('actions')}
                            className="flex items-center gap-2 w-full text-left font-semibold text-sm hover:text-foreground transition-colors"
                        >
                            {expandedSections.has('actions') ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            Actions
                        </button>

                        {expandedSections.has('actions') && (
                            <div className="mt-3 space-y-2 pl-6">
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Open in Editor
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start">
                                    <GitBranch className="h-4 w-4 mr-2" />
                                    View History
                                </Button>
                                <Button variant="outline" size="sm" className="w-full justify-start text-destructive hover:text-destructive">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </ScrollArea>
        </Card>
    );
}
