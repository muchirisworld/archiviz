'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Maximize,
    Search,
    Filter,
    Settings,
    Download,
    Eye,
    EyeOff
} from 'lucide-react';
import {
    defaultCytoscapeConfig,
    createLayoutConfig,
    convertGraphToCytoscape,
    CytoscapeConfig
} from '@/lib/visualization/cytoscape-config';
import { GraphNode, GraphEdge } from '@/lib/graph/graph-generator';

// Import Cytoscape types
declare global {
    interface Window {
        cytoscape: any;
    }
}

interface GraphCanvasProps {
    nodes: Map<string, GraphNode>;
    edges: Map<string, GraphEdge>;
    onNodeSelect?: (nodeId: string) => void;
    onNodeHover?: (nodeId: string | null) => void;
    className?: string;
}

export default function GraphCanvas({
    nodes,
    edges,
    onNodeSelect,
    onNodeHover,
    className = ''
}: GraphCanvasProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cyRef = useRef<any>(null);
    const { theme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [currentLayout, setCurrentLayout] = useState<'hierarchical' | 'force' | 'circular' | 'grid'>('hierarchical');
    const [showLabels, setShowLabels] = useState(true);
    const [zoom, setZoom] = useState(1);

    // Initialize Cytoscape
    useEffect(() => {
        if (!containerRef.current || !window.cytoscape) return;

        const elements = convertGraphToCytoscape(nodes, edges);

        const cy = window.cytoscape({
            container: containerRef.current,
            elements,
            ...defaultCytoscapeConfig,
            layout: createLayoutConfig(currentLayout),
        });

        // Register layout extensions
        if (window.cytoscape.prototype.hasInitialised) {
            // Extensions already loaded
        } else {
            // Load extensions
            try {
                require('cytoscape-dagre');
                require('cytoscape-fcose');
                require('cytoscape-elk');
                require('cytoscape-cose-bilkent');
                require('cytoscape-layout-utilities');

                window.cytoscape.use(require('cytoscape-dagre'));
                window.cytoscape.use(require('cytoscape-fcose'));
                window.cytoscape.use(require('cytoscape-elk'));
                window.cytoscape.use(require('cytoscape-cose-bilkent'));
                window.cytoscape.use(require('cytoscape-layout-utilities'));
            } catch (error) {
                console.warn('Some Cytoscape extensions failed to load:', error);
            }
        }

        // Event handlers
        cy.on('select', 'node', (event: any) => {
            const nodeId = event.target.id();
            setSelectedNodes(prev => [...prev, nodeId]);
            onNodeSelect?.(nodeId);
        });

        cy.on('unselect', 'node', (event: any) => {
            const nodeId = event.target.id();
            setSelectedNodes(prev => prev.filter(id => id !== nodeId));
        });

        cy.on('mouseover', 'node', (event: any) => {
            const nodeId = event.target.id();
            setHoveredNode(nodeId);
            onNodeHover?.(nodeId);
        });

        cy.on('mouseout', 'node', () => {
            setHoveredNode(null);
            onNodeHover?.(null);
        });

        cy.on('zoom', (event: any) => {
            setZoom(event.target.zoom());
        });

        // Run layout
        cy.layout(createLayoutConfig(currentLayout)).run();

        cyRef.current = cy;
        setIsLoading(false);

        return () => {
            if (cy) {
                cy.destroy();
            }
        };
    }, [nodes, edges, currentLayout, onNodeSelect, onNodeHover]);

    // Update graph when data changes
    useEffect(() => {
        if (!cyRef.current) return;

        const elements = convertGraphToCytoscape(nodes, edges);
        cyRef.current.elements().remove();
        cyRef.current.add(elements);
        cyRef.current.layout(createLayoutConfig(currentLayout)).run();
    }, [nodes, edges, currentLayout]);

    // Zoom controls
    const zoomIn = useCallback(() => {
        if (cyRef.current) {
            cyRef.current.zoom({
                level: cyRef.current.zoom() * 1.2,
                renderedPosition: { x: 0, y: 0 }
            });
        }
    }, []);

    const zoomOut = useCallback(() => {
        if (cyRef.current) {
            cyRef.current.zoom({
                level: cyRef.current.zoom() * 0.8,
                renderedPosition: { x: 0, y: 0 }
            });
        }
    }, []);

    const resetZoom = useCallback(() => {
        if (cyRef.current) {
            cyRef.current.fit();
        }
    }, []);

    const fitView = useCallback(() => {
        if (cyRef.current) {
            cyRef.current.fit();
        }
    }, []);

    // Layout controls
    const changeLayout = useCallback((layout: typeof currentLayout) => {
        setCurrentLayout(layout);
    }, []);

    // Toggle labels
    const toggleLabels = useCallback(() => {
        if (cyRef.current) {
            setShowLabels(prev => {
                const newValue = !prev;
                cyRef.current.style().selector('node').style('label', newValue ? 'data(name)' : '').update();
                return newValue;
            });
        }
    }, []);

    // Export functions
    const exportPNG = useCallback(() => {
        if (cyRef.current) {
            const png = cyRef.current.png({
                output: 'blob',
                scale: 2,
                quality: 1,
                full: true
            });

            const url = URL.createObjectURL(png);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'graph.png';
            link.click();
            URL.revokeObjectURL(url);
        }
    }, []);

    const exportSVG = useCallback(() => {
        if (cyRef.current) {
            const svg = cyRef.current.svg({
                output: 'blob',
                full: true
            });

            const url = URL.createObjectURL(svg);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'graph.svg';
            link.click();
            URL.revokeObjectURL(url);
        }
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
                return;
            }

            switch (event.key) {
                case ' ':
                    event.preventDefault();
                    fitView();
                    break;
                case '=':
                case '+':
                    event.preventDefault();
                    zoomIn();
                    break;
                case '-':
                    event.preventDefault();
                    zoomOut();
                    break;
                case 'Escape':
                    if (cyRef.current) {
                        cyRef.current.elements().unselect();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [zoomIn, zoomOut, fitView]);

    return (
        <Card className={`relative ${className}`}>
            <style>{`
                .highlighted { stroke: #f59e42 !important; stroke-width: 4px !important; filter: drop-shadow(0 0 6px #f59e42); }
                .highlighted > [class*='cy-node'] { background: #f59e42 !important; }
            `}</style>
            <CardContent className="p-0">
                {/* Toolbar */}
                <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                            {nodes.size} nodes, {edges.size} edges
                        </Badge>
                        <Badge variant="secondary">
                            Zoom: {Math.round(zoom * 100)}%
                        </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Layout Controls */}
                        <div className="flex items-center gap-1">
                            {(['hierarchical', 'force', 'circular', 'grid'] as const).map((layout) => (
                                <Button
                                    key={layout}
                                    variant={currentLayout === layout ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => changeLayout(layout)}
                                    className="capitalize"
                                >
                                    {layout}
                                </Button>
                            ))}
                        </div>

                        {/* View Controls */}
                        <Button variant="outline" size="sm" onClick={toggleLabels}>
                            {showLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </Button>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" onClick={zoomOut}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={resetZoom}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={zoomIn}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Action Controls */}
                        <Button variant="outline" size="sm" onClick={fitView}>
                            <Maximize className="h-4 w-4" />
                        </Button>

                        {/* Export Controls */}
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="sm" onClick={exportPNG}>
                                PNG
                            </Button>
                            <Button variant="outline" size="sm" onClick={exportSVG}>
                                SVG
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Graph Container */}
                <div className="relative w-full h-[600px] bg-muted/20">
                    <div
                        ref={containerRef}
                        className="w-full h-full"
                        style={{
                            background: theme === 'dark' ? '#0f172a' : '#f8fafc',
                            cursor: 'grab'
                        }}
                    />

                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">Loading graph...</p>
                            </div>
                        </div>
                    )}

                    {/* Selection Info */}
                    {selectedNodes.length > 0 && (
                        <div className="absolute top-4 left-4 bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg">
                            <h4 className="font-semibold text-sm mb-2">Selected ({selectedNodes.length})</h4>
                            <div className="space-y-1">
                                {selectedNodes.slice(0, 3).map(nodeId => {
                                    const node = nodes.get(nodeId);
                                    return (
                                        <div key={nodeId} className="text-xs">
                                            <Badge variant="outline" className="mr-1">
                                                {node?.type || 'unknown'}
                                            </Badge>
                                            {node?.name || nodeId}
                                        </div>
                                    );
                                })}
                                {selectedNodes.length > 3 && (
                                    <div className="text-xs text-muted-foreground">
                                        +{selectedNodes.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hover Info */}
                    {hoveredNode && (
                        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur border rounded-lg p-3 shadow-lg max-w-xs">
                            <h4 className="font-semibold text-sm mb-2">Hovered</h4>
                            <div className="text-xs space-y-1">
                                <div>
                                    <Badge variant="outline" className="mr-1">
                                        {nodes.get(hoveredNode)?.type || 'unknown'}
                                    </Badge>
                                    {nodes.get(hoveredNode)?.name || hoveredNode}
                                </div>
                                {nodes.get(hoveredNode)?.metadata.language && (
                                    <div className="text-muted-foreground">
                                        Language: {nodes.get(hoveredNode)?.metadata.language}
                                    </div>
                                )}
                                {nodes.get(hoveredNode)?.metadata.complexity && (
                                    <div className="text-muted-foreground">
                                        Complexity: {nodes.get(hoveredNode)?.metadata.complexity}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Keyboard Shortcuts Help */}
                <div className="p-3 border-t bg-muted/20 text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                        <span>Keyboard shortcuts:</span>
                        <span>Space: Fit view</span>
                        <span>+/-: Zoom in/out</span>
                        <span>Escape: Clear selection</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
