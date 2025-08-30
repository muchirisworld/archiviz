import { ParsedSymbol, ParsedDependency } from './types';
import { CodeContext } from './code-context';

// Utility to extract code context for embeddings/AI
export function extractCodeContexts({
    code,
    symbols,
    dependencies,
    getCodeSnippet,
    getComplexity,
}: {
    code: string;
    symbols: ParsedSymbol[];
    dependencies: ParsedDependency[];
    getCodeSnippet: (symbol: ParsedSymbol) => string;
    getComplexity: (symbol: ParsedSymbol) => number;
}): CodeContext[] {
    return symbols
        .filter((s) => ['function', 'class', 'variable', 'type'].includes(s.type))
        .map((symbol) => {
            const symbolDeps = dependencies
                .filter((d) => d.sourceName === symbol.name)
                .map((d) => d.targetName);
            return {
                symbol: symbol.name,
                type: symbol.type as CodeContext['type'],
                documentation: symbol.documentation,
                parameters: symbol.signature ? symbol.signature.replace(/[()]/g, '').split(',').map(p => p.trim()).filter(Boolean) : undefined,
                returnType: undefined, // Could be parsed from signature if available
                dependencies: symbolDeps,
                codeSnippet: getCodeSnippet(symbol),
                complexity: getComplexity(symbol),
            };
        });
}
