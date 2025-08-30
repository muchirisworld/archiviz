import { db } from '@/lib/db';
import { symbols, dependencies, files, searchQueries } from '@/lib/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import { getBedrockEmbedding } from './bedrock-api';
import { EmbeddingService } from './embedding-service';

export interface QueryIntent {
    type: 'find' | 'explain' | 'navigate' | 'analyze' | 'compare';
    target: string;
    filters?: Record<string, any>;
    context?: string;
}

export interface QueryResult {
    symbols: any[];
    paths?: string[];
    suggestions?: string[];
    explanation?: string;
}

export class NaturalLanguageService {
    private embeddingService = new EmbeddingService();

    async processQuery(query: string, userId?: string): Promise<QueryResult> {
        // Store the query for history
        await this.storeQuery(query, userId);

        // Analyze query intent
        const intent = await this.analyzeIntent(query);
        
        // Process based on intent
        switch (intent.type) {
            case 'find':
                return await this.findSymbols(intent);
            case 'explain':
                return await this.explainCode(intent);
            case 'navigate':
                return await this.navigateCode(intent);
            case 'analyze':
                return await this.analyzeCode(intent);
            case 'compare':
                return await this.compareCode(intent);
            default:
                return await this.fallbackSearch(query);
        }
    }

    private async analyzeIntent(query: string): Promise<QueryIntent> {
        const intentKeywords = {
            find: ['find', 'show', 'where', 'locate', 'search'],
            explain: ['explain', 'what', 'how', 'why', 'describe'],
            navigate: ['navigate', 'go to', 'show me', 'take me'],
            analyze: ['analyze', 'check', 'review', 'examine'],
            compare: ['compare', 'difference', 'similar', 'versus']
        };

        const lowerQuery = query.toLowerCase();
        
        for (const [type, keywords] of Object.entries(intentKeywords)) {
            if (keywords.some(keyword => lowerQuery.includes(keyword))) {
                return {
                    type: type as QueryIntent['type'],
                    target: query,
                    context: this.extractContext(query)
                };
            }
        }

        return { type: 'find', target: query };
    }

    private extractContext(query: string): string {
        // Extract context from common patterns
        const patterns = [
            /(?:show me|find|where is) (?:the )?(\w+)/i,
            /(\w+) (?:flow|function|class|method)/i,
            /(?:how does|what is) (\w+)/i
        ];

        for (const pattern of patterns) {
            const match = query.match(pattern);
            if (match) return match[1];
        }

        return '';
    }

    private async findSymbols(intent: QueryIntent): Promise<QueryResult> {
        const { target, context } = intent;
        
        // Try semantic search first
        try {
            const queryVector = await getBedrockEmbedding(target);
            const semanticResults = await this.embeddingService.searchSimilarEmbeddingsWithSymbols(queryVector, 10);
            
            if (semanticResults.length > 0) {
                return {
                    symbols: semanticResults.map(r => ({
                        id: r.symbolId,
                        name: r.symbolName,
                        type: r.symbolType,
                        signature: r.symbolSignature,
                        documentation: r.symbolDocumentation,
                        similarity: r.similarity
                    }))
                };
            }
        } catch (error) {
            console.warn('Semantic search failed, falling back to text search:', error);
        }

        // Fallback to text search
        const textResults = await db
            .select()
            .from(symbols)
            .where(
                or(
                    like(symbols.name, `%${target}%`),
                    like(symbols.documentation, `%${target}%`),
                    like(symbols.signature, `%${target}%`)
                )
            )
            .limit(10);

        return { symbols: textResults };
    }

    private async explainCode(intent: QueryIntent): Promise<QueryResult> {
        // Find the target symbol first
        const findResult = await this.findSymbols(intent);
        
        if (findResult.symbols.length === 0) {
            return {
                symbols: [],
                explanation: `I couldn't find any code related to "${intent.target}". Could you be more specific?`
            };
        }

        // Get the most relevant symbol
        const symbol = findResult.symbols[0];
        
        // Generate explanation using AI
        const explanation = await this.generateExplanation(symbol, intent.target);
        
        return {
            symbols: [symbol],
            explanation
        };
    }

    private async navigateCode(intent: QueryIntent): Promise<QueryResult> {
        const { target, context } = intent;
        
        // Handle specific navigation patterns
        if (target.includes('authentication') || target.includes('auth')) {
            return await this.findAuthenticationFlow();
        }
        
        if (target.includes('database') || target.includes('query')) {
            return await this.findDatabaseQueries();
        }
        
        if (target.includes('uses') || target.includes('dependencies')) {
            return await this.findDependencies(context);
        }
        
        if (target.includes('similar')) {
            return await this.findSimilarFunctions(context);
        }

        // Default to finding symbols
        return await this.findSymbols(intent);
    }

    private async analyzeCode(intent: QueryIntent): Promise<QueryResult> {
        const findResult = await this.findSymbols(intent);
        
        if (findResult.symbols.length === 0) {
            return {
                symbols: [],
                explanation: `I couldn't find any code to analyze for "${intent.target}".`
            };
        }

        const symbol = findResult.symbols[0];
        const analysis = await this.generateAnalysis(symbol, intent.target);
        
        return {
            symbols: [symbol],
            explanation: analysis
        };
    }

    private async compareCode(intent: QueryIntent): Promise<QueryResult> {
        // Extract multiple targets for comparison
        const targets = intent.target.split(/\s+(?:vs|versus|compared to)\s+/i);
        
        if (targets.length < 2) {
            return {
                symbols: [],
                explanation: "Please specify two things to compare, e.g., 'compare functionA vs functionB'"
            };
        }

        const results = await Promise.all(
            targets.map(target => this.findSymbols({ ...intent, target: target.trim() }))
        );

        const allSymbols = results.flatMap(r => r.symbols);
        const comparison = await this.generateComparison(allSymbols);
        
        return {
            symbols: allSymbols,
            explanation: comparison
        };
    }

    private async fallbackSearch(query: string): Promise<QueryResult> {
        // Simple text-based search as fallback
        const results = await db
            .select()
            .from(symbols)
            .where(
                or(
                    like(symbols.name, `%${query}%`),
                    like(symbols.documentation, `%${query}%`)
                )
            )
            .limit(5);

        return { symbols: results };
    }

    private async findAuthenticationFlow(): Promise<QueryResult> {
        // Find authentication-related symbols
        const authSymbols = await db
            .select()
            .from(symbols)
            .where(
                or(
                    like(symbols.name, '%auth%'),
                    like(symbols.name, '%login%'),
                    like(symbols.name, '%password%'),
                    like(symbols.documentation, '%auth%')
                )
            )
            .limit(10);

        return {
            symbols: authSymbols,
            explanation: "Here are the authentication-related components in your codebase:"
        };
    }

    private async findDatabaseQueries(): Promise<QueryResult> {
        // Find database-related symbols
        const dbSymbols = await db
            .select()
            .from(symbols)
            .where(
                or(
                    like(symbols.name, '%query%'),
                    like(symbols.name, '%sql%'),
                    like(symbols.name, '%database%'),
                    like(symbols.documentation, '%query%')
                )
            )
            .limit(10);

        return {
            symbols: dbSymbols,
            explanation: "Here are the database query-related components:"
        };
    }

    private async findDependencies(target: string): Promise<QueryResult> {
        // Find what uses a specific symbol
        const [targetSymbol] = await db
            .select()
            .from(symbols)
            .where(eq(symbols.name, target))
            .limit(1);

        if (!targetSymbol) {
            return {
                symbols: [],
                explanation: `Couldn't find symbol "${target}" to analyze dependencies.`
            };
        }

        const deps = await db
            .select({
                symbol: symbols,
                dependencyType: dependencies.type
            })
            .from(dependencies)
            .innerJoin(symbols, eq(dependencies.sourceId, symbols.id))
            .where(eq(dependencies.targetId, targetSymbol.id));

        return {
            symbols: deps.map(d => d.symbol),
            explanation: `Here are the components that use "${target}":`
        };
    }

    private async findSimilarFunctions(target: string): Promise<QueryResult> {
        try {
            const queryVector = await getBedrockEmbedding(target);
            const results = await this.embeddingService.searchSimilarEmbeddingsWithSymbols(queryVector, 5);
            
            return {
                symbols: results.map(r => ({
                    id: r.symbolId,
                    name: r.symbolName,
                    type: r.symbolType,
                    similarity: r.similarity
                })),
                explanation: `Here are functions similar to "${target}":`
            };
        } catch (error) {
            return {
                symbols: [],
                explanation: `Couldn't find similar functions for "${target}".`
            };
        }
    }

    private async generateExplanation(symbol: any, query: string): Promise<string> {
        // This would use the AI analysis service
        return `This ${symbol.type} "${symbol.name}" appears to be related to your query "${query}". ${symbol.documentation || 'No documentation available.'}`;
    }

    private async generateAnalysis(symbol: any, query: string): Promise<string> {
        // This would use the AI analysis service
        return `Analysis of ${symbol.name}: This ${symbol.type} appears to be well-structured. Consider reviewing its complexity and test coverage.`;
    }

    private async generateComparison(symbols: any[]): Promise<string> {
        if (symbols.length < 2) {
            return "Need at least two symbols to compare.";
        }
        
        return `Comparing ${symbols.map(s => s.name).join(' and ')}: Both are ${symbols[0].type}s with similar purposes. Consider consolidating if they have overlapping functionality.`;
    }

    private async storeQuery(query: string, userId?: string) {
        await db.insert(searchQueries).values({
            query,
            userId: userId || 'anonymous',
            results: JSON.stringify({ timestamp: new Date().toISOString() })
        });
    }

    async getSearchHistory(userId?: string, limit = 10) {
        return db
            .select()
            .from(searchQueries)
            .where(eq(searchQueries.userId, userId || 'anonymous'))
            .orderBy(desc(searchQueries.createdAt))
            .limit(limit);
    }

    async getPopularQueries(limit = 10) {
        // This would require a more complex query to count popular searches
        return db
            .select()
            .from(searchQueries)
            .orderBy(desc(searchQueries.createdAt))
            .limit(limit);
    }
}
