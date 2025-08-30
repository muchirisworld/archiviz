import { db } from '@/lib/db';
import { embeddings } from '@/lib/db/schema';

// Service for handling code embeddings (Stage 4: AI Integration)
export class EmbeddingService {
    async addEmbedding({ symbolId, content, vector, model }: {
        symbolId: string;
        content: string;
        vector: number[];
        model: string;
    }) {
        // Store as string for pgvector compatibility
        await db.insert(embeddings).values({
            symbolId,
            content,
            vector: JSON.stringify(vector),
            model,
        });
    }

    async getEmbeddingsBySymbol(symbolId: string) {
        // Use eq from drizzle-orm for where clause
        const { eq } = await import('drizzle-orm');
        return db.select().from(embeddings).where(eq(embeddings.symbolId, symbolId));
    }

    async searchSimilarEmbeddings(queryVector: number[], topK = 10) {
        // Placeholder: implement pgvector similarity search
        // SELECT * FROM embeddings ORDER BY vector <=> '[queryVector]' LIMIT topK;
        return [];
    }
}
