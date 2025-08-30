import { NextRequest, NextResponse } from 'next/server';
import { TreeSitterParser } from '@/lib/parser/tree-sitter-wrapper';
import { extractCodeContexts } from '@/lib/parser/context-extractor';
import { BedrockEmbeddingPipeline } from '@/lib/services/bedrock-embedding-service';
import { db } from '@/lib/db';
import { files, symbols } from '@/lib/db/schema';

// POST /api/embeddings
export async function POST(req: NextRequest) {
    const { fileId } = await req.json();
    if (!fileId) return NextResponse.json({ error: 'fileId required' }, { status: 400 });

    // Fetch file and symbols
    const [file] = await db.select().from(files).where(files.id.eq(fileId));
    if (!file) return NextResponse.json({ error: 'File not found' }, { status: 404 });
    const symbolRows = await db.select().from(symbols).where(symbols.fileId.eq(fileId));

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

    return NextResponse.json({ success: true, count: contexts.length });
}
