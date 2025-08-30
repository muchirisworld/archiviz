import { GraphNode, GraphEdge } from '../graph/graph-generator';

export interface CytoscapeConfig {
    layout: any;
    style: any[];
    minZoom: number;
    maxZoom: number;
    wheelSensitivity: number;
    autoungrabify: boolean;
    autolock: boolean;
    autounselectify: boolean;
}

export const getNodeColor = (type: string): string => {
    const colors: Record<string, string> = {
        repository: '#1e40af', // Blue
        package: '#3b82f6',   // Light blue
        file: '#60a5fa',      // Lighter blue
        class: '#10b981',     // Green
        interface: '#059669',  // Dark green
        function: '#f59e0b',   // Amber
        method: '#d97706',     // Dark amber
        variable: '#8b5cf6',   // Purple
        field: '#7c3aed',      // Dark purple
        enum: '#ec4899',       // Pink
        struct: '#06b6d4',     // Cyan
        trait: '#0891b2',      // Dark cyan
        module: '#84cc16',     // Lime
        namespace: '#65a30d',  // Dark lime
        import: '#ef4444',     // Red
        export: '#dc2626',     // Dark red
        type: '#f97316',       // Orange
    };
    return colors[type] || '#6b7280'; // Default gray
};

export const getNodeShape = (type: string): string => {
    const shapes: Record<string, string> = {
        repository: 'ellipse',
        package: 'round-rectangle',
        file: 'rectangle',
        class: 'hexagon',
        interface: 'diamond',
        function: 'triangle',
        method: 'triangle',
        variable: 'circle',
        field: 'circle',
        enum: 'octagon',
        struct: 'hexagon',
        trait: 'diamond',
        module: 'round-rectangle',
        namespace: 'round-rectangle',
        import: 'vee',
        export: 'vee',
        type: 'polygon',
    };
    return shapes[type] || 'ellipse';
};

export const getNodeSize = (type: string, complexity?: number): number => {
    const baseSizes: Record<string, number> = {
        repository: 60,
        package: 50,
        file: 40,
        class: 35,
        interface: 30,
        function: 25,
        method: 25,
        variable: 20,
        field: 20,
        enum: 30,
        struct: 35,
        trait: 30,
        module: 45,
        namespace: 45,
        import: 20,
        export: 20,
        type: 25,
    };

    const baseSize = baseSizes[type] || 25;
    const complexityMultiplier = complexity ? Math.min(complexity / 10, 2) : 1;

    return Math.max(baseSize * complexityMultiplier, 15);
};

export const getEdgeColor = (type: string): string => {
    const colors: Record<string, string> = {
        imports: '#ef4444',      // Red
        calls: '#f59e0b',        // Amber
        extends: '#10b981',      // Green
        implements: '#8b5cf6',   // Purple
        uses: '#3b82f6',         // Blue
        imports_from: '#f97316', // Orange
        exports_to: '#ec4899',   // Pink
        references: '#06b6d4',   // Cyan
        depends_on: '#84cc16',   // Lime
    };
    return colors[type] || '#6b7280'; // Default gray
};

export const getEdgeStyle = (type: string): string => {
    const styles: Record<string, string> = {
        imports: 'solid',
        calls: 'dashed',
        extends: 'solid',
        implements: 'dotted',
        uses: 'solid',
        imports_from: 'dashed',
        exports_to: 'dashed',
        references: 'dotted',
        depends_on: 'solid',
    };
    return styles[type] || 'solid';
};

export const getEdgeWidth = (type: string): number => {
    const widths: Record<string, number> = {
        imports: 2,
        calls: 1.5,
        extends: 3,
        implements: 2,
        uses: 1.5,
        imports_from: 1.5,
        exports_to: 1.5,
        references: 1,
        depends_on: 2,
    };
    return widths[type] || 1;
};

export const createCytoscapeStyle = (): any[] => [
    // Node styles
    {
        selector: 'node',
        style: {
            'background-color': 'data(color)',
            'shape': 'data(shape)',
            'width': 'data(size)',
            'height': 'data(size)',
            'border-color': '#374151',
            'border-width': '1px',
            'color': '#ffffff',
            'font-size': '10px',
            'font-weight': '600',
            'text-wrap': 'wrap',
            'text-max-width': '80px',
            'text-valign': 'center',
            'text-halign': 'center',
            'text-outline-color': '#000000',
            'text-outline-width': '1px',
            'text-outline-opacity': '0.8',
            'label': 'data(name)',
            'text-events': 'yes',
            'events': 'yes',
        },
    },

    // Edge styles
    {
        selector: 'edge',
        style: {
            'width': 'data(width)',
            'line-color': 'data(color)',
            'line-style': 'data(style)',
            'curve-style': 'bezier',
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'target-arrow-width': 'data(width)',
            'arrow-scale': '0.8',
            'edge-distances': 'intersection',
            'loop-direction': '-45deg',
            'loop-sweep': '-90deg',
            'label': 'data(label)',
            'font-size': '8px',
            'color': '#6b7280',
            'text-rotation': 'autorotate',
            'text-margin-y': '-10px',
        },
    },

    // Compound node styles
    {
        selector: 'node:parent',
        style: {
            'background-color': 'rgba(59, 130, 246, 0.1)',
            'border-color': '#3b82f6',
            'border-width': '2px',
            'border-style': 'dashed',
            'shape': 'round-rectangle',
            'width': 'label',
            'height': 'label',
            'padding': '20px',
            'text-valign': 'top',
            'text-halign': 'center',
            'text-margin-y': '10px',
            'font-size': '12px',
            'font-weight': '700',
            'color': '#1e40af',
        },
    },

    // Selection styles
    {
        selector: 'node:selected',
        style: {
            'border-color': '#fbbf24',
            'border-width': '3px',
            'border-style': 'solid',
            'shadow-blur': '10px',
            'shadow-color': '#fbbf24',
            'shadow-offset-x': '0px',
            'shadow-offset-y': '0px',
            'shadow-opacity': '0.5',
        },
    },

    {
        selector: 'edge:selected',
        style: {
            'line-color': '#fbbf24',
            'width': 'data(width)',
            'line-style': 'solid',
            'target-arrow-color': '#fbbf24',
        },
    },

    // Hover styles
    {
        selector: 'node:hover',
        style: {
            'border-color': '#f59e0b',
            'border-width': '2px',
            'shadow-blur': '5px',
            'shadow-color': '#f59e0b',
            'shadow-offset-x': '0px',
            'shadow-offset-y': '0px',
            'shadow-opacity': '0.3',
        },
    },

    {
        selector: 'edge:hover',
        style: {
            'line-color': '#f59e0b',
            'width': 'data(width)',
            'line-style': 'solid',
            'target-arrow-color': '#f59e0b',
        },
    },
];

export const createLayoutConfig = (type: 'hierarchical' | 'force' | 'circular' | 'grid' = 'hierarchical'): any => {
    switch (type) {
        case 'hierarchical':
            return {
                name: 'dagre',
                rankDir: 'TB',
                rankSep: 100,
                nodeSep: 50,
                edgeSep: 20,
                animate: true,
                animationDuration: 1000,
                animationEasing: 'ease-in-out',
                padding: 50,
                fit: true,
            };

        case 'force':
            return {
                name: 'fcose',
                animate: true,
                animationDuration: 1000,
                animationEasing: 'ease-in-out',
                fit: true,
                padding: 50,
                nodeDimensionsIncludeLabels: true,
                idealEdgeLength: 100,
                nodeOverlap: 20,
                gravity: 0.1,
                numIter: 1000,
                tile: false,
                tilingPaddingVertical: 10,
                tilingPaddingHorizontal: 10,
                randomize: true,
            };

        case 'circular':
            return {
                name: 'circle',
                animate: true,
                animationDuration: 1000,
                animationEasing: 'ease-in-out',
                fit: true,
                padding: 50,
                radius: undefined,
                startAngle: 0,
                sweep: undefined,
                clockwise: true,
                sort: undefined,
                nodeDimensionsIncludeLabels: false,
            };

        case 'grid':
            return {
                name: 'grid',
                animate: true,
                animationDuration: 1000,
                animationEasing: 'ease-in-out',
                fit: true,
                padding: 50,
                rows: undefined,
                cols: undefined,
                position: undefined,
                sort: undefined,
                nodeDimensionsIncludeLabels: false,
            };

        default:
            return {
                name: 'dagre',
                rankDir: 'TB',
                rankSep: 100,
                nodeSep: 50,
                edgeSep: 20,
                animate: true,
                animationDuration: 1000,
                animationEasing: 'ease-in-out',
                padding: 50,
                fit: true,
            };
    }
};

export const defaultCytoscapeConfig: CytoscapeConfig = {
    layout: createLayoutConfig('hierarchical'),
    style: createCytoscapeStyle(),
    minZoom: 0.1,
    maxZoom: 3,
    wheelSensitivity: 0.1,
    autoungrabify: false,
    autolock: false,
    autounselectify: false,
};

export const convertGraphToCytoscape = (nodes: Map<string, GraphNode>, edges: Map<string, GraphEdge>) => {
    const elements: any[] = [];

    // Convert nodes
    for (const [id, node] of nodes) {
        elements.push({
            data: {
                id,
                name: node.name,
                type: node.type,
                color: getNodeColor(node.type),
                shape: getNodeShape(node.type),
                size: getNodeSize(node.type, node.metadata.complexity),
                parent: node.parent,
                language: node.metadata.language,
                complexity: node.metadata.complexity,
                lineCount: node.metadata.lineCount,
                symbolCount: node.metadata.symbolCount,
                dependencyCount: node.metadata.dependencyCount,
                parseTime: node.metadata.parseTime,
                path: node.path,
            },
            classes: [node.type],
        });
    }

    // Convert edges
    for (const [id, edge] of edges) {
        elements.push({
            data: {
                id,
                source: edge.source,
                target: edge.target,
                type: edge.type,
                color: getEdgeColor(edge.type),
                style: getEdgeStyle(edge.type),
                width: getEdgeWidth(edge.type),
                label: edge.type,
                weight: edge.weight || 1,
                metadata: edge.metadata,
            },
            classes: [edge.type],
        });
    }

    return elements;
};
