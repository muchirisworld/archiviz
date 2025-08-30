import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { symbols, dependencies } from '@/lib/db/schema';

// POST /api/navigation
export async function POST(req: NextRequest) {
    const { intent, pattern } = await req.json();
    // Example: intent = 'show_auth_flow', pattern = 'auth'
    // TODO: Implement real intent recognition and graph traversal
    if (intent === 'show_auth_flow' && pattern) {
        // Find symbols and dependencies matching pattern
        const { ilike, inArray } = await import('drizzle-orm');
        const symbolRows = await db.select().from(symbols).where(ilike(symbols.name, `%${pattern}%`));
        // Find dependencies for these symbols
        const symbolIds = symbolRows.map(s => s.id);
        const deps = symbolIds.length
            ? await db.select().from(dependencies).where(inArray(dependencies.sourceId, symbolIds))
            : [];
        return NextResponse.json({ nodes: symbolRows, edges: deps });
    }
    return NextResponse.json({ error: 'Not implemented' }, { status: 400 });
}
