import { NextRequest, NextResponse } from 'next/server';
import { MockParser } from '@/lib/parser/mock-parser';

export async function POST(request: NextRequest) {
    try {
        const { code, language = 'typescript' } = await request.json();

        if (!code) {
            return NextResponse.json(
                { error: 'Code is required' },
                { status: 400 }
            );
        }

        const parser = new MockParser();
        const result = parser.parse(code, 'unknown');

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Parsing error:', error);
        return NextResponse.json(
            { error: 'Failed to parse code' },
            { status: 500 }
        );
    }
}
