import { ParsedSymbol, ParsedDependency } from '../parser/types';
import { ParserResult } from '../parser/base-parser';

export interface GraphNode {
    id: string;
    type: 'repository' | 'package' | 'file' | 'class' | 'function' | 'variable' | 'interface' | 'method' | 'field' | 'enum' | 'struct' | 'trait' | 'module' | 'namespace' | 'import' | 'export' | 'type';
    name: string;
    path?: string;
    metadata: {
        language?: string;
        lineCount?: number;
        complexity?: number;
        lastModified?: Date;
        size?: number;
        symbolCount?: number;
        dependencyCount?: number;
        parseTime?: number;
    };
    parent?: string;
    children?: string[];
    position?: {
        x: number;
        y: number;
    };
}

export interface GraphEdge {
    id: string;
    source: string;
    target: string;
    type: 'imports' | 'calls' | 'extends' | 'implements' | 'uses' | 'imports_from' | 'exports_to' | 'references' | 'depends_on';
    weight?: number;
    metadata?: Record<string, any>;
}

export interface Graph {
    nodes: Map<string, GraphNode>;
    edges: Map<string, GraphEdge>;
    metadata: {
        nodeCount: number;
        edgeCount: number;
        languages: Set<string>;
        totalSize: number;
        totalParseTime: number;
    };
}

export class GraphGenerator {
    private graph: Graph;

    constructor() {
        this.graph = {
            nodes: new Map(),
            edges: new Map(),
            metadata: {
                nodeCount: 0,
                edgeCount: 0,
                languages: new Set(),
                totalSize: 0,
                totalParseTime: 0,
            },
        };
    }

    addRepository(repositoryId: string, name: string, path: string): void {
        const node: GraphNode = {
            id: repositoryId,
            type: 'repository',
            name,
            path,
            metadata: {},
            children: [],
        };

        this.graph.nodes.set(repositoryId, node);
        this.graph.metadata.nodeCount++;
    }

    addPackage(packageId: string, name: string, path: string, repositoryId: string): void {
        const node: GraphNode = {
            id: packageId,
            type: 'package',
            name,
            path,
            metadata: {},
            parent: repositoryId,
            children: [],
        };

        this.graph.nodes.set(packageId, node);
        this.graph.metadata.nodeCount++;

        // Add to parent's children
        const repository = this.graph.nodes.get(repositoryId);
        if (repository) {
            repository.children = repository.children || [];
            repository.children.push(packageId);
        }
    }

    addFile(fileId: string, name: string, path: string, packageId: string, parseResult: ParserResult): void {
        const node: GraphNode = {
            id: fileId,
            type: 'file',
            name,
            path,
            metadata: {
                language: parseResult.metadata.language,
                size: parseResult.metadata.fileSize,
                symbolCount: parseResult.metadata.symbolCount,
                dependencyCount: parseResult.metadata.dependencyCount,
                parseTime: parseResult.metadata.parseTime,
            },
            parent: packageId,
            children: [],
        };

        this.graph.nodes.set(fileId, node);
        this.graph.metadata.nodeCount++;
        this.graph.metadata.languages.add(parseResult.metadata.language);
        this.graph.metadata.totalSize += parseResult.metadata.fileSize;
        this.graph.metadata.totalParseTime += parseResult.metadata.parseTime;

        // Add to parent's children
        const pkg = this.graph.nodes.get(packageId);
        if (pkg) {
            pkg.children = pkg.children || [];
            pkg.children.push(fileId);
        }

        // Add symbols as nodes
        this.addSymbols(fileId, parseResult.symbols);

        // Add dependencies as edges
        this.addDependencies(fileId, parseResult.dependencies);
    }

    private addSymbols(fileId: string, symbols: ParsedSymbol[]): void {
        for (const symbol of symbols) {
            const symbolId = `${fileId}:${symbol.name}`;
            const node: GraphNode = {
                id: symbolId,
                type: symbol.type,
                name: symbol.name,
                metadata: {
                    lineCount: symbol.endLine - symbol.startLine + 1,
                    complexity: this.calculateComplexity(symbol),
                },
                parent: fileId,
            };

            this.graph.nodes.set(symbolId, node);
            this.graph.metadata.nodeCount++;

            // Add to parent's children
            const file = this.graph.nodes.get(fileId);
            if (file) {
                file.children = file.children || [];
                file.children.push(symbolId);
            }
        }
    }

    private addDependencies(fileId: string, dependencies: ParsedDependency[]): void {
        for (const dep of dependencies) {
            const edgeId = `${fileId}:${dep.sourceName}:${dep.targetName}`;
            const edge: GraphEdge = {
                id: edgeId,
                source: fileId,
                target: dep.targetName,
                type: dep.type,
                weight: 1,
                metadata: dep.metadata,
            };

            this.graph.edges.set(edgeId, edge);
            this.graph.metadata.edgeCount++;
        }
    }

    private calculateComplexity(symbol: ParsedSymbol): number {
        let complexity = 1;

        // Base complexity based on type
        switch (symbol.type) {
            case 'function':
            case 'method':
                complexity = 2;
                break;
            case 'class':
            case 'interface':
                complexity = 3;
                break;
            case 'struct':
            case 'trait':
                complexity = 2;
                break;
        }

        // Add complexity based on size
        const size = symbol.endLine - symbol.startLine + 1;
        if (size > 50) complexity += 2;
        if (size > 100) complexity += 3;
        if (size > 200) complexity += 5;

        return complexity;
    }

    getGraph(): Graph {
        return this.graph;
    }

    getNode(id: string): GraphNode | undefined {
        return this.graph.nodes.get(id);
    }

    getEdge(id: string): GraphEdge | undefined {
        return this.graph.edges.get(id);
    }

    getChildren(nodeId: string): GraphNode[] {
        const node = this.graph.nodes.get(nodeId);
        if (!node || !node.children) {
            return [];
        }

        return node.children
            .map(childId => this.graph.nodes.get(childId))
            .filter((child): child is GraphNode => child !== undefined);
    }

    getParents(nodeId: string): GraphNode[] {
        const node = this.graph.nodes.get(nodeId);
        if (!node || !node.parent) {
            return [];
        }

        const parent = this.graph.nodes.get(node.parent);
        if (!parent) {
            return [];
        }

        return [parent];
    }

    getDependencies(nodeId: string): GraphEdge[] {
        const edges: GraphEdge[] = [];

        for (const edge of this.graph.edges.values()) {
            if (edge.source === nodeId) {
                edges.push(edge);
            }
        }

        return edges;
    }

    getDependents(nodeId: string): GraphEdge[] {
        const edges: GraphEdge[] = [];

        for (const edge of this.graph.edges.values()) {
            if (edge.target === nodeId) {
                edges.push(edge);
            }
        }

        return edges;
    }

    calculateMetrics(): {
        centrality: Map<string, number>;
        clustering: Map<string, number>;
        complexity: Map<string, number>;
    } {
        const centrality = this.calculateCentrality();
        const clustering = this.calculateClustering();
        const complexity = this.calculateOverallComplexity();

        return { centrality, clustering, complexity };
    }

    private calculateCentrality(): Map<string, number> {
        const centrality = new Map<string, number>();

        for (const [nodeId, node] of this.graph.nodes) {
            const inDegree = this.getDependents(nodeId).length;
            const outDegree = this.getDependencies(nodeId).length;
            const totalDegree = inDegree + outDegree;

            centrality.set(nodeId, totalDegree);
        }

        return centrality;
    }

    private calculateClustering(): Map<string, number> {
        const clustering = new Map<string, number>();

        for (const [nodeId, node] of this.graph.nodes) {
            const neighbors = this.getNeighbors(nodeId);
            if (neighbors.length < 2) {
                clustering.set(nodeId, 0);
                continue;
            }

            let triangles = 0;
            let possibleTriangles = 0;

            for (let i = 0; i < neighbors.length; i++) {
                for (let j = i + 1; j < neighbors.length; j++) {
                    possibleTriangles++;
                    if (this.areConnected(neighbors[i], neighbors[j])) {
                        triangles++;
                    }
                }
            }

            const coefficient = possibleTriangles > 0 ? triangles / possibleTriangles : 0;
            clustering.set(nodeId, coefficient);
        }

        return clustering;
    }

    private calculateOverallComplexity(): Map<string, number> {
        const complexity = new Map<string, number>();

        for (const [nodeId, node] of this.graph.nodes) {
            let totalComplexity = node.metadata.complexity || 0;

            // Add complexity from children
            const children = this.getChildren(nodeId);
            for (const child of children) {
                totalComplexity += child.metadata.complexity || 0;
            }

            complexity.set(nodeId, totalComplexity);
        }

        return complexity;
    }

    private getNeighbors(nodeId: string): string[] {
        const neighbors = new Set<string>();

        // Outgoing edges
        for (const edge of this.graph.edges.values()) {
            if (edge.source === nodeId) {
                neighbors.add(edge.target);
            }
        }

        // Incoming edges
        for (const edge of this.graph.edges.values()) {
            if (edge.target === nodeId) {
                neighbors.add(edge.source);
            }
        }

        return Array.from(neighbors);
    }

    private areConnected(node1: string, node2: string): boolean {
        for (const edge of this.graph.edges.values()) {
            if ((edge.source === node1 && edge.target === node2) ||
                (edge.source === node2 && edge.target === node1)) {
                return true;
            }
        }
        return false;
    }

    serialize(): string {
        const serializableGraph = {
            nodes: Array.from(this.graph.nodes.entries()),
            edges: Array.from(this.graph.edges.entries()),
            metadata: {
                ...this.graph.metadata,
                languages: Array.from(this.graph.metadata.languages),
            },
        };

        return JSON.stringify(serializableGraph, null, 2);
    }

    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);

            this.graph.nodes = new Map(parsed.nodes);
            this.graph.edges = new Map(parsed.edges);
            this.graph.metadata = {
                ...parsed.metadata,
                languages: new Set(parsed.metadata.languages),
            };
        } catch (error) {
            console.error('Error deserializing graph:', error);
        }
    }
}
