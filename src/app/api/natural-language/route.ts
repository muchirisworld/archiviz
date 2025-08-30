import { NextRequest, NextResponse } from 'next/server';
import { NaturalLanguageService } from '@/lib/services/natural-language-service';

// POST /api/natural-language
export async function POST(req: NextRequest) {
    try {
        const { query, userId } = await req.json();
        
        if (!query || typeof query !== 'string') {
            return NextResponse.json({ 
                error: 'Query string is required' 
            }, { status: 400 });
        }

        const service = new NaturalLanguageService();
        const result = await service.processQuery(query, userId);
        
        return NextResponse.json({ 
            success: true, 
            result,
            query
        });
    } catch (error) {
        console.error('Natural language query error:', error);
        return NextResponse.json({ 
            error: 'Query processing failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}

// GET /api/natural-language/history
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const limit = parseInt(searchParams.get('limit') || '10');
        
        const service = new NaturalLanguageService();
        const history = await service.getSearchHistory(userId || undefined, limit);
        
        return NextResponse.json({ 
            history,
            totalQueries: history.length
        });
    } catch (error) {
        console.error('Search history error:', error);
        return NextResponse.json({ 
            error: 'Failed to get search history' 
        }, { status: 500 });
    }
}
