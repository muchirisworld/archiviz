import { NextRequest, NextResponse } from 'next/server';
import { AIAnalysisService } from '@/lib/services/ai-analysis-service';

// POST /api/analysis/explain
export async function POST(req: NextRequest) {
    try {
        const { symbolId } = await req.json();
        
        if (!symbolId) {
            return NextResponse.json({ 
                error: 'symbolId is required' 
            }, { status: 400 });
        }

        const service = new AIAnalysisService();
        const result = await service.analyzeCode(symbolId, 'explanation');
        
        return NextResponse.json({ 
            success: true, 
            result,
            analysisType: 'explanation',
            symbolId
        });
    } catch (error) {
        console.error('Code explanation error:', error);
        return NextResponse.json({ 
            error: 'Explanation generation failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}
