import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingService } from '@/lib/services/embedding-service';

// POST /api/semantic-search
export async function POST(req: NextRequest) {
    const { queryVector, topK } = await req.json();
    if (!Array.isArray(queryVector)) return NextResponse.json({ error: 'queryVector required' }, { status: 400 });
    const service = new EmbeddingService();
    // TODO: implement real pgvector search
    const results = await service.searchSimilarEmbeddings(queryVector, topK || 10);
    return NextResponse.json({ results });
}
