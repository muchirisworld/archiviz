import { db } from '@/lib/db';
import { analysisResults, symbols } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getBedrockCompletion } from './bedrock-api';

export interface AnalysisResult {
    type: 'explanation' | 'pattern' | 'complexity' | 'suggestion' | 'health';
    content: string;
    confidence: number;
    metadata?: Record<string, any>;
}

export class AIAnalysisService {
    constructor(
        private model = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-sonnet-20240229-v1:0'
    ) {}

    async analyzeCode(symbolId: string, analysisType: string): Promise<AnalysisResult> {
        // Get symbol information
        const [symbol] = await db.select().from(symbols).where(eq(symbols.id, symbolId));
        if (!symbol) {
            throw new Error('Symbol not found');
        }

        let prompt: string;
        let result: AnalysisResult;

        switch (analysisType) {
            case 'explanation':
                result = await this.generateCodeExplanation(symbol);
                break;
            case 'pattern':
                result = await this.detectDesignPatterns(symbol);
                break;
            case 'complexity':
                result = await this.analyzeComplexity(symbol);
                break;
            case 'suggestion':
                result = await this.generateRefactoringSuggestions(symbol);
                break;
            case 'health':
                result = await this.analyzeCodeHealth(symbol);
                break;
            default:
                throw new Error(`Unknown analysis type: ${analysisType}`);
        }

        // Store the analysis result
        await db.insert(analysisResults).values({
            symbolId,
            analysisType,
            result: JSON.stringify(result),
            confidence: result.confidence,
        });

        return result;
    }

    private async generateCodeExplanation(symbol: any): Promise<AnalysisResult> {
        const prompt = `Analyze this code and provide a clear, concise explanation of what it does:

Symbol: ${symbol.name}
Type: ${symbol.type}
Signature: ${symbol.signature || 'N/A'}
Documentation: ${symbol.documentation || 'None provided'}

Please explain:
1. What this code does
2. How it works
3. Any important details or edge cases
4. The purpose in the broader codebase context

Keep the explanation clear and accessible to developers.`;

        const response = await getBedrockCompletion(prompt, this.model);
        
        return {
            type: 'explanation',
            content: response,
            confidence: 0.85,
            metadata: { symbolType: symbol.type }
        };
    }

    private async detectDesignPatterns(symbol: any): Promise<AnalysisResult> {
        const prompt = `Analyze this code to identify any design patterns or architectural patterns:

Symbol: ${symbol.name}
Type: ${symbol.type}
Signature: ${symbol.signature || 'N/A'}
Documentation: ${symbol.documentation || 'None provided'}

Please identify:
1. Any design patterns used (Factory, Singleton, Observer, etc.)
2. Architectural patterns (MVC, Repository, etc.)
3. Anti-patterns that should be avoided
4. Suggestions for better patterns if applicable

Provide specific examples and reasoning for your analysis.`;

        const response = await getBedrockCompletion(prompt, this.model);
        
        return {
            type: 'pattern',
            content: response,
            confidence: 0.80,
            metadata: { symbolType: symbol.type }
        };
    }

    private async analyzeComplexity(symbol: any): Promise<AnalysisResult> {
        const prompt = `Analyze the complexity of this code:

Symbol: ${symbol.name}
Type: ${symbol.type}
Signature: ${symbol.signature || 'N/A'}
Documentation: ${symbol.documentation || 'None provided'}

Please assess:
1. Cyclomatic complexity
2. Cognitive complexity
3. Time and space complexity
4. Maintainability score
5. Potential performance bottlenecks
6. Suggestions for complexity reduction

Provide specific metrics and actionable recommendations.`;

        const response = await getBedrockCompletion(prompt, this.model);
        
        return {
            type: 'complexity',
            content: response,
            confidence: 0.75,
            metadata: { symbolType: symbol.type }
        };
    }

    private async generateRefactoringSuggestions(symbol: any): Promise<AnalysisResult> {
        const prompt = `Analyze this code and provide refactoring suggestions:

Symbol: ${symbol.name}
Type: ${symbol.type}
Signature: ${symbol.signature || 'N/A'}
Documentation: ${symbol.documentation || 'None provided'}

Please provide:
1. Specific refactoring opportunities
2. Code quality improvements
3. Performance optimizations
4. Better naming suggestions
5. Structural improvements
6. Testing recommendations

Focus on practical, actionable suggestions that improve code quality.`;

        const response = await getBedrockCompletion(prompt, this.model);
        
        return {
            type: 'suggestion',
            content: response,
            confidence: 0.80,
            metadata: { symbolType: symbol.type }
        };
    }

    private async analyzeCodeHealth(symbol: any): Promise<AnalysisResult> {
        const prompt = `Analyze the health and quality of this code:

Symbol: ${symbol.name}
Type: ${symbol.type}
Signature: ${symbol.signature || 'N/A'}
Documentation: ${symbol.documentation || 'None provided'}

Please assess:
1. Code quality score (1-10)
2. Documentation quality
3. Test coverage needs
4. Security considerations
5. Maintainability factors
6. Technical debt indicators
7. Overall health recommendations

Provide a comprehensive health assessment with specific areas for improvement.`;

        const response = await getBedrockCompletion(prompt, this.model);
        
        return {
            type: 'health',
            content: response,
            confidence: 0.85,
            metadata: { symbolType: symbol.type }
        };
    }

    async getAnalysisHistory(symbolId: string) {
        return db
            .select()
            .from(analysisResults)
            .where(eq(analysisResults.symbolId, symbolId))
            .orderBy(analysisResults.createdAt);
    }

    async getAnalysisByType(symbolId: string, analysisType: string) {
        const [result] = await db
            .select()
            .from(analysisResults)
            .where(eq(analysisResults.symbolId, symbolId))
            .where(eq(analysisResults.analysisType, analysisType))
            .orderBy(analysisResults.createdAt);
        
        return result ? JSON.parse(result.result) : null;
    }
}
