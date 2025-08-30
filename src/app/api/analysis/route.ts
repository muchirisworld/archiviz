import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analysisResults } from '@/lib/db/schema';

// POST /api/analysis
export async function POST(req: NextRequest) {
    const { symbolId, analysisType, result, confidence } = await req.json();
    if (!symbolId || !analysisType || !result) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    await db.insert(analysisResults).values({
        symbolId,
        analysisType,
        result: JSON.stringify(result),
        confidence: confidence ?? null,
    });
    return NextResponse.json({ success: true });
}
