import { BaseParser, SupportedLanguage, ParserResult } from './base-parser';
import { ParsedSymbol, ParsedDependency } from './types';

export class RustParser extends BaseParser {
    getSupportedLanguages(): SupportedLanguage[] {
        return ['rust'];
    }

    parse(code: string, filePath: string): ParserResult {
        const startTime = Date.now();
        const symbols: ParsedSymbol[] = [];
        const dependencies: ParsedDependency[] = [];

        const lines = code.split('\n');

        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();

            // Function definitions
            const functionMatch = trimmedLine.match(/^fn\s+(\w+)\s*\(/);
            if (functionMatch) {
                symbols.push({
                    name: functionMatch[1],
                    type: 'function',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('fn') + 1,
                    endColumn: line.length,
                    signature: this.extractRustFunctionSignature(line),
                    visibility: this.extractRustVisibility(line),
                });
            }

            // Struct definitions
            const structMatch = trimmedLine.match(/^struct\s+(\w+)/);
            if (structMatch) {
                symbols.push({
                    name: structMatch[1],
                    type: 'struct',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('struct') + 1,
                    endColumn: line.length,
                    visibility: this.extractRustVisibility(line),
                });
            }

            // Enum definitions
            const enumMatch = trimmedLine.match(/^enum\s+(\w+)/);
            if (enumMatch) {
                symbols.push({
                    name: enumMatch[1],
                    type: 'enum',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('enum') + 1,
                    endColumn: line.length,
                    visibility: this.extractRustVisibility(line),
                });
            }

            // Trait definitions
            const traitMatch = trimmedLine.match(/^trait\s+(\w+)/);
            if (traitMatch) {
                symbols.push({
                    name: traitMatch[1],
                    type: 'trait',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('trait') + 1,
                    endColumn: line.length,
                    visibility: this.extractRustVisibility(line),
                });
            }

            // Impl blocks
            const implMatch = trimmedLine.match(/^impl\s+(\w+)/);
            if (implMatch) {
                symbols.push({
                    name: implMatch[1],
                    type: 'module',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('impl') + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });
            }

            // Module definitions
            const moduleMatch = trimmedLine.match(/^mod\s+(\w+)/);
            if (moduleMatch) {
                symbols.push({
                    name: moduleMatch[1],
                    type: 'module',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('mod') + 1,
                    endColumn: line.length,
                    visibility: this.extractRustVisibility(line),
                });
            }

            // Variable declarations
            const letMatch = trimmedLine.match(/^let\s+(?:mut\s+)?(\w+)/);
            if (letMatch) {
                symbols.push({
                    name: letMatch[1],
                    type: 'variable',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('let') + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });
            }

            // Const declarations
            const constMatch = trimmedLine.match(/^const\s+(\w+)/);
            if (constMatch) {
                symbols.push({
                    name: constMatch[1],
                    type: 'variable',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('const') + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });
            }

            // Use statements
            const useMatch = trimmedLine.match(/^use\s+([^;]+)/);
            if (useMatch) {
                const usePath = useMatch[1].trim();
                const parts = usePath.split('::');
                const moduleName = parts[parts.length - 1];

                symbols.push({
                    name: moduleName,
                    type: 'import',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('use') + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });

                dependencies.push({
                    sourceName: 'current_file',
                    targetName: usePath,
                    type: 'imports',
                    metadata: { importType: 'module', fullPath: usePath },
                    sourceLocation: { line: lineIndex + 1, column: line.indexOf('use') + 1 },
                });
            }

            // Function calls
            const callMatch = trimmedLine.match(/(\w+)\s*\(/);
            if (callMatch && !trimmedLine.startsWith('fn') && !trimmedLine.startsWith('struct') && !trimmedLine.startsWith('enum') && !trimmedLine.startsWith('trait') && !trimmedLine.startsWith('impl') && !trimmedLine.startsWith('mod') && !trimmedLine.startsWith('let') && !trimmedLine.startsWith('const')) {
                dependencies.push({
                    sourceName: 'current_file',
                    targetName: callMatch[1],
                    type: 'calls',
                    sourceLocation: { line: lineIndex + 1, column: line.indexOf(callMatch[1]) + 1 },
                });
            }
        });

        const parseTime = Date.now() - startTime;

        return {
            symbols,
            dependencies,
            metadata: {
                language: 'rust',
                fileSize: code.length,
                parseTime,
                symbolCount: symbols.length,
                dependencyCount: dependencies.length,
            },
        };
    }

    private extractRustVisibility(line: string): 'public' | 'private' | 'protected' | 'internal' {
        if (line.includes('pub')) return 'public';
        return 'private'; // Default in Rust is private
    }

    private extractRustFunctionSignature(line: string): string {
        const match = line.match(/fn\s+\w+\s*\(([^)]*)\)/);
        if (match) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p);
            return `(${params.join(', ')})`;
        }
        return '()';
    }
}
