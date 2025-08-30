
import { CodeContext } from '@/lib/parser/code-context';
import { EmbeddingService } from './embedding-service';
import { getBedrockEmbedding } from './bedrock-api';

export class BedrockEmbeddingPipeline {
    constructor(
        private embeddingService = new EmbeddingService(),
        private embeddingModel = process.env.BEDROCK_EMBEDDING_MODEL_ID || 'amazon.titan-embed-text-v1',
    ) { }

    async generateAndStore(contexts: CodeContext[], symbolIdMap: Record<string, string>) {
        for (const ctx of contexts) {
            const vector = await getBedrockEmbedding(ctx.codeSnippet, this.embeddingModel);
            const symbolId = symbolIdMap[ctx.symbol];
            if (!symbolId) continue;
            await this.embeddingService.addEmbedding({
                symbolId,
                content: ctx.codeSnippet,
                vector,
                model: this.embeddingModel,
            });
        }
    }
}
