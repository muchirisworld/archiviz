import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { searchQueries } from '@/lib/db/schema';

// POST /api/search-history
export async function POST(req: NextRequest) {
    const { query, userId, results } = await req.json();
    if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });
    await db.insert(searchQueries).values({
        query,
        userId: userId ?? null,
        results: results ? JSON.stringify(results) : null,
    });
    return NextResponse.json({ success: true });
}
