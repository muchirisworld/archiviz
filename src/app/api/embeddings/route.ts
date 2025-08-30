import { NextRequest, NextResponse } from 'next/server';
import { TreeSitterParser } from '@/lib/parser/tree-sitter-wrapper';
import { extractCodeContexts } from '@/lib/parser/context-extractor';
import { BedrockEmbeddingPipeline } from '@/lib/services/bedrock-embedding-service';
import { db } from '@/lib/db';
import { files, symbols } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/embeddings
export async function POST(req: NextRequest) {
    try {
        const { fileId } = await req.json();
        if (!fileId) {
            return NextResponse.json({ error: 'fileId required' }, { status: 400 });
        }

        // Fetch file and symbols
        const [file] = await db.select().from(files).where(eq(files.id, fileId));
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }
        
        const symbolRows = await db.select().from(symbols).where(eq(symbols.fileId, fileId));

        // Parse code and extract contexts
        const parser = new TreeSitterParser(file.language as any);
        const parseResult = parser.parse(file.content, file.path);
        const symbolIdMap = Object.fromEntries(symbolRows.map(s => [s.name, s.id]));
        
        const contexts = extractCodeContexts({
            code: file.content,
            symbols: parseResult.symbols,
            dependencies: parseResult.dependencies,
            getCodeSnippet: (symbol) => file.content.split('\n').slice(symbol.startLine, symbol.endLine + 1).join('\n'),
            getComplexity: () => 1, // TODO: implement real complexity
        });

        // Generate and store embeddings
        const pipeline = new BedrockEmbeddingPipeline();
        await pipeline.generateAndStore(contexts, symbolIdMap);

        return NextResponse.json({ 
            success: true, 
            count: contexts.length,
            fileId,
            language: file.language
        });
    } catch (error) {
        console.error('Embedding generation error:', error);
        return NextResponse.json({ 
            error: 'Embedding generation failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}

// GET /api/embeddings/:symbolId
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const symbolId = searchParams.get('symbolId');
        
        if (!symbolId) {
            return NextResponse.json({ 
                error: 'symbolId is required' 
            }, { status: 400 });
        }

        // This would return embeddings for a specific symbol
        // For now, return a placeholder
        return NextResponse.json({ 
            symbolId,
            embeddings: [],
            message: 'Embeddings endpoint - implement symbol-specific retrieval'
        });
    } catch (error) {
        console.error('Embedding retrieval error:', error);
        return NextResponse.json({ 
            error: 'Failed to retrieve embeddings' 
        }, { status: 500 });
    }
}
