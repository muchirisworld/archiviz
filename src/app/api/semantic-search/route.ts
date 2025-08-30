import { NextRequest, NextResponse } from 'next/server';
import { EmbeddingService } from '@/lib/services/embedding-service';
import { getBedrockEmbedding } from '@/lib/services/bedrock-api';

// POST /api/semantic-search
export async function POST(req: NextRequest) {
    try {
        const { query, topK = 10 } = await req.json();
        
        if (!query || typeof query !== 'string') {
            return NextResponse.json({ error: 'Query string required' }, { status: 400 });
        }

        const service = new EmbeddingService();
        
        // Generate embedding for the query
        const queryVector = await getBedrockEmbedding(query);
        
        // Search for similar embeddings
        const results = await service.searchSimilarEmbeddingsWithSymbols(queryVector, topK);
        
        return NextResponse.json({ 
            results,
            query,
            totalResults: results.length
        });
    } catch (error) {
        console.error('Semantic search error:', error);
        return NextResponse.json({ 
            error: 'Search failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}

// GET /api/semantic-search/stats
export async function GET() {
    try {
        const service = new EmbeddingService();
        const stats = await service.getEmbeddingStats();
        
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stats error:', error);
        return NextResponse.json({ 
            error: 'Failed to get stats' 
        }, { status: 500 });
    }
}
