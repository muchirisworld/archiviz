import { NextRequest, NextResponse } from 'next/server';
import { ParserFactory } from '@/lib/parser/parser-factory';
import { GraphGenerator } from '@/lib/graph/graph-generator';

export async function POST(request: NextRequest) {
    try {
        const { code, filePath, language } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: 'Code is required' },
                { status: 400 }
            );
        }

        // Auto-detect language if not provided
        const detectedLanguage = language || ParserFactory.getLanguageFromFile(filePath || 'unknown.ts');

        if (!ParserFactory.isSupportedLanguage(detectedLanguage)) {
            return NextResponse.json(
                { error: `Unsupported language: ${detectedLanguage}` },
                { status: 400 }
            );
        }

        // Get the appropriate parser
        const parser = ParserFactory.getParser(detectedLanguage);

        // Parse the code
        const parseResult = parser.parse(code, filePath || 'unknown');

        // Generate graph data
        const graphGenerator = new GraphGenerator();

        // Add a mock repository structure for demonstration
        const repositoryId = 'demo-repo';
        const packageId = 'demo-package';
        const fileId = 'demo-file';

        graphGenerator.addRepository(repositoryId, 'Demo Repository', '/demo');
        graphGenerator.addPackage(packageId, 'Demo Package', '/demo/src', repositoryId);
        graphGenerator.addFile(fileId, filePath || 'unknown', '/demo/src', packageId, parseResult);

        // Calculate graph metrics
        const metrics = graphGenerator.calculateMetrics();

        // Get graph data
        const graph = graphGenerator.getGraph();

        return NextResponse.json({
            success: true,
            data: {
                parseResult,
                graph: {
                    nodes: Array.from(graph.nodes.entries()),
                    edges: Array.from(graph.edges.entries()),
                    metadata: {
                        ...graph.metadata,
                        languages: Array.from(graph.metadata.languages),
                    },
                },
                metrics: {
                    centrality: Array.from(metrics.centrality.entries()),
                    clustering: Array.from(metrics.clustering.entries()),
                    complexity: Array.from(metrics.complexity.entries()),
                },
                supportedLanguages: parser.getSupportedLanguages(),
                detectedLanguage,
            },
        });
    } catch (error) {
        console.error('Enhanced parsing error:', error);
        return NextResponse.json(
            { error: 'Failed to parse code', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        // Return information about supported languages and capabilities
        const supportedLanguages = ['typescript', 'javascript', 'python', 'java', 'go', 'rust'];

        return NextResponse.json({
            success: true,
            data: {
                supportedLanguages,
                capabilities: {
                    multiLanguage: true,
                    monorepoDetection: true,
                    graphGeneration: true,
                    metricsCalculation: true,
                    incrementalParsing: false, // TODO: Implement in Stage 3
                    fileWatching: false, // TODO: Implement in Stage 3
                },
                performance: {
                    targetParseTime: '1000 files in under 10 seconds',
                    targetMemoryUsage: 'Under 1GB for large codebases',
                    targetIncrementalUpdate: 'Under 1 second',
                },
            },
        });
    } catch (error) {
        console.error('API info error:', error);
        return NextResponse.json(
            { error: 'Failed to get API information' },
            { status: 500 }
        );
    }
}
