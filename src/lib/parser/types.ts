export interface ParsedSymbol {
    name: string;
    type: 'function' | 'class' | 'interface' | 'variable' | 'import' | 'export' | 'type' | 'namespace' | 'module' | 'method' | 'field' | 'enum' | 'struct' | 'trait';
    startLine: number;
    endLine: number;
    startColumn: number;
    endColumn: number;
    signature?: string;
    documentation?: string;
    modifiers?: string[];
    visibility?: 'public' | 'private' | 'protected' | 'internal';
    isStatic?: boolean;
    isAbstract?: boolean;
    isFinal?: boolean;
}

export interface ParsedDependency {
    sourceName: string;
    targetName: string;
    type: 'imports' | 'extends' | 'implements' | 'calls' | 'references' | 'depends_on' | 'uses' | 'imports_from' | 'exports_to';
    metadata?: Record<string, any>;
    sourceLocation?: {
        line: number;
        column: number;
    };
    targetLocation?: {
        line: number;
        column: number;
    };
}

export interface ParseOptions {
    includeComments?: boolean;
    includeWhitespace?: boolean;
    maxFileSize?: number;
    timeout?: number;
    cacheResults?: boolean;
}

export interface ParseError {
    message: string;
    line?: number;
    column?: number;
    severity: 'error' | 'warning' | 'info';
    code?: string;
}
