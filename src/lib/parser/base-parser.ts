import { ParsedSymbol, ParsedDependency } from './types';

export type SupportedLanguage = 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust';

export interface ParserResult {
    symbols: ParsedSymbol[];
    dependencies: ParsedDependency[];
    metadata: {
        language: SupportedLanguage;
        fileSize: number;
        parseTime: number;
        symbolCount: number;
        dependencyCount: number;
    };
}

export abstract class BaseParser {
    abstract parse(code: string, filePath: string): ParserResult;
    abstract getSupportedLanguages(): SupportedLanguage[];
}
