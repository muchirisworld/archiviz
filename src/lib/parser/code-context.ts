// CodeContext type for semantic extraction
export interface CodeContext {
    symbol: string;
    type: 'function' | 'class' | 'variable' | 'type';
    documentation?: string;
    parameters?: string[];
    returnType?: string;
    dependencies: string[];
    codeSnippet: string;
    complexity: number;
}
