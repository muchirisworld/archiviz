import { db } from '@/lib/db';
import { embeddings, symbols } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// Service for handling code embeddings (Stage 4: AI Integration)
export class EmbeddingService {
    async addEmbedding({ symbolId, content, vector, model }: {
        symbolId: string;
        content: string;
        vector: number[];
        model: string;
    }) {
        await db.insert(embeddings).values({
            symbolId,
            content,
            vector: JSON.stringify(vector), // Store as JSON string
            model,
        });
    }

    async getEmbeddingsBySymbol(symbolId: string) {
        return db.select().from(embeddings).where(eq(embeddings.symbolId, symbolId));
    }

    async searchSimilarEmbeddings(queryVector: number[], topK = 10) {
        // Use pgvector cosine similarity search with JSON string conversion
        const queryVectorStr = JSON.stringify(queryVector);
        const results = await db
            .select({
                id: embeddings.id,
                content: embeddings.content,
                symbolId: embeddings.symbolId,
                model: embeddings.model,
                similarity: sql<number>`1 - (${embeddings.vector}::vector <=> ${queryVectorStr}::vector)`,
            })
            .from(embeddings)
            .orderBy(desc(sql<number>`1 - (${embeddings.vector}::vector <=> ${queryVectorStr}::vector)`))
            .limit(topK);

        return results;
    }

    async searchSimilarEmbeddingsWithSymbols(queryVector: number[], topK = 10) {
        // Join with symbols table to get more context
        const queryVectorStr = JSON.stringify(queryVector);
        const results = await db
            .select({
                id: embeddings.id,
                content: embeddings.content,
                symbolId: embeddings.symbolId,
                model: embeddings.model,
                symbolName: symbols.name,
                symbolType: symbols.type,
                symbolSignature: symbols.signature,
                symbolDocumentation: symbols.documentation,
                similarity: sql<number>`1 - (${embeddings.vector}::vector <=> ${queryVectorStr}::vector)`,
            })
            .from(embeddings)
            .innerJoin(symbols, eq(embeddings.symbolId, symbols.id))
            .orderBy(desc(sql<number>`1 - (${embeddings.vector}::vector <=> ${queryVectorStr}::vector)`))
            .limit(topK);

        return results;
    }

    async deleteEmbeddingsBySymbol(symbolId: string) {
        await db.delete(embeddings).where(eq(embeddings.symbolId, symbolId));
    }

    async getEmbeddingStats() {
        const [count] = await db
            .select({ count: sql<number>`count(*)` })
            .from(embeddings);
        
        return { totalEmbeddings: count.count };
    }
}
