'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
// Helper for intelligent navigation API
async function runNavigationIntent(intent: string, pattern: string) {
    const res = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent, pattern }),
    });
    if (!res.ok) return { nodes: [], edges: [] };
    return await res.json();
}
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    PanelLeftClose,
    PanelLeftOpen,
    PanelRightClose,
    PanelRightOpen,
    Settings,
    Info,
    HelpCircle,
    Download,
    Share2,
    Eye,
    EyeOff
} from 'lucide-react';
import GraphCanvas from '@/components/visualization/GraphCanvas';
import SidebarPanel from '@/components/visualization/SidebarPanel';
import SearchBar from '@/components/visualization/SearchBar';
import FilterPanel, { GraphFilters } from '@/components/visualization/FilterPanel';
import { GraphNode, GraphEdge } from '@/lib/graph/graph-generator';

// Mock data for demonstration
const createMockGraphData = () => {
    const nodes = new Map<string, GraphNode>();
    const edges = new Map<string, GraphEdge>();

    // Repository
    nodes.set('repo-1', {
        id: 'repo-1',
        type: 'repository',
        name: 'archiviz',
        path: '/',
        metadata: {
            language: 'typescript',
            lineCount: 15000,
            complexity: 0,
            lastModified: new Date('2024-01-15')
        }
    });

    // Packages
    nodes.set('pkg-1', {
        id: 'pkg-1',
        type: 'package',
        name: 'frontend',
        path: '/packages/frontend',
        parent: 'repo-1',
        metadata: {
            language: 'typescript',
            lineCount: 8000,
            complexity: 0,
            lastModified: new Date('2024-01-14')
        }
    });

    nodes.set('pkg-2', {
        id: 'pkg-2',
        type: 'package',
        name: 'backend',
        path: '/packages/backend',
        parent: 'repo-1',
        metadata: {
            language: 'typescript',
            lineCount: 7000,
            complexity: 0,
            lastModified: new Date('2024-01-13')
        }
    });

    // Files
    nodes.set('file-1', {
        id: 'file-1',
        type: 'file',
        name: 'GraphCanvas.tsx',
        path: '/packages/frontend/src/components/GraphCanvas.tsx',
        parent: 'pkg-1',
        metadata: {
            language: 'typescript',
            lineCount: 450,
            complexity: 12,
            lastModified: new Date('2024-01-14')
        }
    });

    nodes.set('file-2', {
        id: 'file-2',
        type: 'file',
        name: 'SidebarPanel.tsx',
        path: '/packages/frontend/src/components/GraphCanvas.tsx',
        parent: 'pkg-1',
        metadata: {
            language: 'typescript',
            lineCount: 380,
            complexity: 8,
            lastModified: new Date('2024-01-14')
        }
    });

    nodes.set('file-3', {
        id: 'file-3',
        type: 'file',
        name: 'graph-generator.ts',
        path: '/packages/backend/src/lib/graph/graph-generator.ts',
        parent: 'pkg-2',
        metadata: {
            language: 'typescript',
            lineCount: 520,
            complexity: 15,
            lastModified: new Date('2024-01-13')
        }
    });

    // Functions
    nodes.set('func-1', {
        id: 'func-1',
        type: 'function',
        name: 'createGraph',
        path: '/packages/backend/src/lib/graph/graph-generator.ts',
        parent: 'file-3',
        metadata: {
            language: 'typescript',
            lineCount: 45,
            complexity: 8,
            lastModified: new Date('2024-01-13')
        }
    });

    nodes.set('func-2', {
        id: 'func-2',
        type: 'function',
        name: 'calculateMetrics',
        path: '/packages/backend/src/lib/graph/graph-generator.ts',
        parent: 'file-3',
        metadata: {
            language: 'typescript',
            lineCount: 32,
            complexity: 6,
            lastModified: new Date('2024-01-13')
        }
    });

    // Classes
    nodes.set('class-1', {
        id: 'class-1',
        type: 'class',
        name: 'GraphGenerator',
        path: '/packages/backend/src/lib/graph/graph-generator.ts',
        parent: 'file-3',
        metadata: {
            language: 'typescript',
            lineCount: 120,
            complexity: 12,
            lastModified: new Date('2024-01-13')
        }
    });

    // Edges
    edges.set('edge-1', {
        id: 'edge-1',
        source: 'pkg-1',
        target: 'repo-1',
        type: 'depends_on'
    });

    edges.set('edge-2', {
        id: 'edge-2',
        source: 'pkg-2',
        target: 'repo-1',
        type: 'depends_on'
    });

    edges.set('edge-3', {
        id: 'edge-3',
        source: 'file-1',
        target: 'pkg-1',
        type: 'depends_on'
    });

    edges.set('edge-4', {
        id: 'edge-4',
        source: 'file-2',
        target: 'pkg-1',
        type: 'depends_on'
    });

    edges.set('edge-5', {
        id: 'edge-5',
        source: 'file-3',
        target: 'pkg-2',
        type: 'depends_on'
    });

    edges.set('edge-6', {
        id: 'edge-6',
        source: 'func-1',
        target: 'file-3',
        type: 'depends_on'
    });

    edges.set('edge-7', {
        id: 'edge-7',
        source: 'func-2',
        target: 'file-3',
        type: 'depends_on'
    });

    edges.set('edge-8', {
        id: 'edge-8',
        source: 'class-1',
        target: 'file-3',
        type: 'depends_on'
    });

    edges.set('edge-9', {
        id: 'edge-9',
        source: 'func-1',
        target: 'class-1',
        type: 'calls'
    });

    edges.set('edge-10', {
        id: 'edge-10',
        source: 'func-2',
        target: 'class-1',
        type: 'calls'
    });

    return { nodes, edges };
};

export default function VisualizationPage() {
    const [leftPanelOpen, setLeftPanelOpen] = useState(true);
    // Intelligent navigation state
    const [navInput, setNavInput] = useState('');
    const [navLoading, setNavLoading] = useState(false);
    const [navError, setNavError] = useState<string | null>(null);
    const [navResult, setNavResult] = useState<{ nodes: any[]; edges: any[] } | null>(null);
    // Handler for navigation intent
    const handleNavigation = async (e: React.FormEvent) => {
        e.preventDefault();
        setNavLoading(true);
        setNavError(null);
        setNavResult(null);
        // Simple intent extraction: "show X flow" or "find Y"
        const input = navInput.trim().toLowerCase();
        let intent = '';
        let pattern = '';
        if (input.startsWith('show')) {
            intent = 'show_auth_flow';
            pattern = input.replace('show', '').replace('flow', '').trim();
        } else if (input.startsWith('find')) {
            intent = 'find_pattern';
            pattern = input.replace('find', '').trim();
        } else {
            intent = 'show_auth_flow';
            pattern = input;
        }
        try {
            const result = await runNavigationIntent(intent, pattern);
            setNavResult(result);
        } catch (err) {
            setNavError('Navigation failed.');
        }
        setNavLoading(false);
    };
    const [rightPanelOpen, setRightPanelOpen] = useState(true);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [filters, setFilters] = useState<GraphFilters>({
        nodeTypes: new Set(),
        languages: new Set(),
        complexityRange: [0, 50],
        lineCountRange: [0, 1000],
        showOnlySelected: false,
        showOnlyConnected: false,
        excludeExternal: false,
    });

    // Load mock data
    const { nodes: allNodes, edges: allEdges } = useMemo(() => createMockGraphData(), []);

    // Apply filters to nodes and edges
    const filteredNodes = useMemo(() => {
        let filtered = new Map(allNodes);

        // Filter by node types
        if (filters.nodeTypes.size > 0) {
            filtered = new Map(
                Array.from(filtered).filter(([, node]) =>
                    filters.nodeTypes.has(node.type)
                )
            );
        }

        // Filter by languages
        if (filters.languages.size > 0) {
            filtered = new Map(
                Array.from(filtered).filter(([, node]) =>
                    node.metadata.language && filters.languages.has(node.metadata.language)
                )
            );
        }

        // Filter by complexity
        filtered = new Map(
            Array.from(filtered).filter(([, node]) => {
                if (node.metadata.complexity === undefined) return true;
                return node.metadata.complexity >= filters.complexityRange[0] &&
                    node.metadata.complexity <= filters.complexityRange[1];
            })
        );

        // Filter by line count
        filtered = new Map(
            Array.from(filtered).filter(([, node]) => {
                if (!node.metadata.lineCount) return true;
                return node.metadata.lineCount >= filters.lineCountRange[0] &&
                    node.metadata.lineCount <= filters.lineCountRange[1];
            })
        );

        // Filter by selected nodes only
        if (filters.showOnlySelected && selectedNode) {
            const selectedIds = new Set([selectedNode.id]);
            // Add parent nodes
            let current = selectedNode;
            while (current.parent) {
                selectedIds.add(current.parent);
                current = allNodes.get(current.parent)!;
            }
            filtered = new Map(
                Array.from(filtered).filter(([id]) => selectedIds.has(id))
            );
        }

        // Filter by connected nodes only
        if (filters.showOnlyConnected && selectedNode) {
            const connectedIds = new Set([selectedNode.id]);
            // Add nodes connected by edges
            allEdges.forEach(edge => {
                if (edge.source === selectedNode.id) {
                    connectedIds.add(edge.target);
                }
                if (edge.target === selectedNode.id) {
                    connectedIds.add(edge.source);
                }
            });
            filtered = new Map(
                Array.from(filtered).filter(([id]) => connectedIds.has(id))
            );
        }

        return filtered;
    }, [allNodes, allEdges, filters, selectedNode]);

    // Filter edges based on filtered nodes
    const filteredEdges = useMemo(() => {
        const nodeIds = new Set(filteredNodes.keys());
        return new Map(
            Array.from(allEdges).filter(([, edge]) =>
                nodeIds.has(edge.source) && nodeIds.has(edge.target)
            )
        );
    }, [allEdges, filteredNodes]);

    // Get related nodes and edges for selected node
    const relatedNodes = useMemo(() => {
        if (!selectedNode) return [];

        const related: GraphNode[] = [];
        allEdges.forEach(edge => {
            if (edge.source === selectedNode.id) {
                const targetNode = allNodes.get(edge.target);
                if (targetNode) related.push(targetNode);
            }
            if (edge.target === selectedNode.id) {
                const sourceNode = allNodes.get(edge.source);
                if (sourceNode) related.push(sourceNode);
            }
        });

        return related;
    }, [selectedNode, allEdges, allNodes]);

    const relatedEdges = useMemo(() => {
        if (!selectedNode) return [];

        const related: GraphEdge[] = [];
        allEdges.forEach(edge => {
            if (edge.source === selectedNode.id || edge.target === selectedNode.id) {
                related.push(edge);
            }
        });

        return related;
    }, [selectedNode, allEdges]);

    // Handle node selection
    const handleNodeSelect = useCallback((nodeId: string) => {
        const node = allNodes.get(nodeId);
        setSelectedNode(node || null);
    }, [allNodes]);

    // Handle node hover
    const handleNodeHover = useCallback((nodeId: string | null) => {
        setHoveredNode(nodeId);
    }, []);

    // Handle search
    const handleSearch = useCallback((query: string) => {
        console.log('Search query:', query);
        // TODO: Implement search functionality
    }, []);

    // Handle filters change
    const handleFiltersChange = useCallback((newFilters: GraphFilters) => {
        setFilters(newFilters);
    }, []);

    // Toggle panels
    const toggleLeftPanel = () => setLeftPanelOpen(prev => !prev);
    const toggleRightPanel = () => setRightPanelOpen(prev => !prev);

    return (
        <div className="min-h-screen bg-background">
            {/* Intelligent Navigation UI */}
            <div className="flex items-center gap-2 p-4 border-b bg-background/80">
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                <form onSubmit={handleNavigation} className="flex-1 flex gap-2">
                    <input
                        type="text"
                        className="flex-1 border rounded px-3 py-2 text-sm bg-background"
                        placeholder="e.g. Show authentication flow, Find database queries, What uses this function?"
                        value={navInput}
                        onChange={e => setNavInput(e.target.value)}
                        disabled={navLoading}
                    />
                    <Button type="submit" size="sm" disabled={navLoading || !navInput.trim()}>
                        {navLoading ? 'Searching...' : 'Go'}
                    </Button>
                </form>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-65px)]">
                {/* Left Panel */}
                {leftPanelOpen && (
                    <div className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Search & Filters</h2>
                                <Button variant="ghost" size="sm" onClick={toggleLeftPanel}>
                                    <PanelLeftClose className="h-4 w-4" />
                                </Button>
                            </div>

                            <SearchBar
                                nodes={allNodes}
                                onNodeSelect={handleNodeSelect}
                                onSearch={handleSearch}
                                placeholder="Search nodes, files, functions..."
                                className="mb-4"
                            />
                        </div>

                        <FilterPanel
                            nodes={allNodes}
                            onFiltersChange={handleFiltersChange}
                        />
                    </div>
                )}

                {/* Main Graph Area */}
                <div className="flex-1 flex flex-col relative">
                    {/* Graph Canvas */}
                    <div className="flex-1 p-4">
                        {/* Show navigation results if present */}
                        {navResult && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-background border rounded shadow-lg p-4 max-w-lg w-full">
                                <div className="font-semibold mb-2">Navigation Result</div>
                                <div className="text-xs mb-2 text-muted-foreground">Nodes: {navResult.nodes.length}, Edges: {navResult.edges.length}</div>
                                <div className="max-h-40 overflow-y-auto">
                                    {navResult.nodes.map((n, i) => (
                                        <div key={n.id || i} className="mb-1">
                                            <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded mr-2">{n.type}</span>
                                            <span className="font-medium">{n.name || n.id}</span>
                                            {n.path && <span className="ml-2 text-muted-foreground">{n.path}</span>}
                                        </div>
                                    ))}
                                </div>
                                <Button size="sm" className="mt-2" onClick={() => setNavResult(null)}>Close</Button>
                            </div>
                        )}
                        {navError && (
                            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-destructive/90 text-white border rounded shadow-lg p-4 max-w-lg w-full">
                                {navError}
                                <Button size="sm" variant="ghost" className="ml-2" onClick={() => setNavError(null)}>Dismiss</Button>
                            </div>
                        )}
                        <GraphCanvas
                            nodes={filteredNodes}
                            edges={filteredEdges}
                            onNodeSelect={handleNodeSelect}
                            onNodeHover={handleNodeHover}
                            highlightNodes={navResult?.nodes?.map(n => n.id) || []}
                            highlightEdges={navResult?.edges?.map(e => e.id) || []}
                        />
                    </div>
                </div>

                {/* Right Panel */}
                {rightPanelOpen && (
                    <div className="w-80 border-l bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                        <div className="p-4 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold">Node Details</h2>
                                <Button variant="ghost" size="sm" onClick={toggleRightPanel}>
                                    <PanelRightClose className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <SidebarPanel
                            selectedNode={selectedNode}
                            relatedNodes={relatedNodes}
                            relatedEdges={relatedEdges}
                            onNodeSelect={handleNodeSelect}
                        />
                    </div>
                )}

                {/* Panel Toggle Buttons */}
                {!leftPanelOpen && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleLeftPanel}
                        className="fixed left-4 top-20 z-50"
                    >
                        <PanelLeftOpen className="h-4 w-4 mr-2" />
                        Show Filters
                    </Button>
                )}

                {!rightPanelOpen && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={toggleRightPanel}
                        className="fixed right-4 top-20 z-50"
                    >
                        <PanelRightOpen className="h-4 w-4 mr-2" />
                        Show Details
                    </Button>
                )}
            </div>

            {/* Info Panel */}
            {hoveredNode && (
                <div className="fixed bottom-4 left-4 bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg max-w-xs z-50">
                    <div className="text-xs space-y-1">
                        <div className="font-semibold">Hovering</div>
                        <div>
                            <Badge variant="outline" className="mr-1">
                                {allNodes.get(hoveredNode)?.type || 'unknown'}
                            </Badge>
                            {allNodes.get(hoveredNode)?.name || hoveredNode}
                        </div>
                        {allNodes.get(hoveredNode)?.metadata.language && (
                            <div className="text-muted-foreground">
                                Language: {allNodes.get(hoveredNode)?.metadata.language}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
