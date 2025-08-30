import { NextRequest, NextResponse } from 'next/server';
import { AIAnalysisService } from '@/lib/services/ai-analysis-service';

// POST /api/analysis
export async function POST(req: NextRequest) {
    try {
        const { symbolId, analysisType } = await req.json();
        
        if (!symbolId || !analysisType) {
            return NextResponse.json({ 
                error: 'symbolId and analysisType are required' 
            }, { status: 400 });
        }

        const service = new AIAnalysisService();
        const result = await service.analyzeCode(symbolId, analysisType);
        
        return NextResponse.json({ 
            success: true, 
            result,
            analysisType,
            symbolId
        });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ 
            error: 'Analysis failed', 
            details: error instanceof Error ? error.message : 'Unknown error' 
        }, { status: 500 });
    }
}

// GET /api/analysis/:symbolId
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const symbolId = searchParams.get('symbolId');
        const analysisType = searchParams.get('type');
        
        if (!symbolId) {
            return NextResponse.json({ 
                error: 'symbolId is required' 
            }, { status: 400 });
        }

        const service = new AIAnalysisService();
        
        if (analysisType) {
            // Get specific analysis type
            const result = await service.getAnalysisByType(symbolId, analysisType);
            return NextResponse.json({ result });
        } else {
            // Get all analysis history
            const history = await service.getAnalysisHistory(symbolId);
            return NextResponse.json({ history });
        }
    } catch (error) {
        console.error('Analysis history error:', error);
        return NextResponse.json({ 
            error: 'Failed to get analysis history' 
        }, { status: 500 });
    }
}
