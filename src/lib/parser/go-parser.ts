import { BaseParser, SupportedLanguage, ParserResult } from './base-parser';
import { ParsedSymbol, ParsedDependency } from './types';

export class GoParser extends BaseParser {
    getSupportedLanguages(): SupportedLanguage[] {
        return ['go'];
    }

    parse(code: string, filePath: string): ParserResult {
        const startTime = Date.now();
        const symbols: ParsedSymbol[] = [];
        const dependencies: ParsedDependency[] = [];

        const lines = code.split('\n');

        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();

            // Function definitions
            const functionMatch = trimmedLine.match(/^func\s+(\w+)\s*\(/);
            if (functionMatch) {
                symbols.push({
                    name: functionMatch[1],
                    type: 'function',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('func') + 1,
                    endColumn: line.length,
                    signature: this.extractGoFunctionSignature(line),
                    visibility: 'public',
                });
            }

            // Method definitions (receiver functions)
            const methodMatch = trimmedLine.match(/^func\s*\([^)]+\)\s+(\w+)\s*\(/);
            if (methodMatch) {
                symbols.push({
                    name: methodMatch[1],
                    type: 'method',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf(methodMatch[1]) + 1,
                    endColumn: line.length,
                    signature: this.extractGoFunctionSignature(line),
                    visibility: 'public',
                });
            }

            // Type definitions
            const typeMatch = trimmedLine.match(/^type\s+(\w+)\s+/);
            if (typeMatch) {
                symbols.push({
                    name: typeMatch[1],
                    type: 'type',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('type') + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });
            }

            // Struct definitions
            const structMatch = trimmedLine.match(/^type\s+(\w+)\s+struct/);
            if (structMatch) {
                symbols.push({
                    name: structMatch[1],
                    type: 'struct',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('type') + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });
            }

            // Interface definitions
            const interfaceMatch = trimmedLine.match(/^type\s+(\w+)\s+interface/);
            if (interfaceMatch) {
                symbols.push({
                    name: interfaceMatch[1],
                    type: 'interface',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('type') + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });
            }

            // Variable declarations
            const varMatch = trimmedLine.match(/^var\s+(\w+)/);
            if (varMatch) {
                symbols.push({
                    name: varMatch[1],
                    type: 'variable',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('var') + 1,
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

            // Import statements
            const importMatch = trimmedLine.match(/^import\s+([^)]+)/);
            if (importMatch) {
                const importContent = importMatch[1];
                // Handle both single and grouped imports
                if (importContent.includes('"')) {
                    const imports = importContent.match(/"([^"]+)"/g);
                    if (imports) {
                        imports.forEach(imp => {
                            const importPath = imp.replace(/"/g, '');
                            const packageName = importPath.split('/').pop()!;

                            symbols.push({
                                name: packageName,
                                type: 'import',
                                startLine: lineIndex + 1,
                                endLine: lineIndex + 1,
                                startColumn: line.indexOf(importPath) + 1,
                                endColumn: line.length,
                                visibility: 'public',
                            });

                            dependencies.push({
                                sourceName: 'current_file',
                                targetName: importPath,
                                type: 'imports',
                                metadata: { importType: 'package', fullPath: importPath },
                                sourceLocation: { line: lineIndex + 1, column: line.indexOf(importPath) + 1 },
                            });
                        });
                    }
                }
            }

            // Function calls
            const callMatch = trimmedLine.match(/(\w+)\s*\(/);
            if (callMatch && !trimmedLine.startsWith('func') && !trimmedLine.startsWith('type') && !trimmedLine.startsWith('var') && !trimmedLine.startsWith('const')) {
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
                language: 'go',
                fileSize: code.length,
                parseTime,
                symbolCount: symbols.length,
                dependencyCount: dependencies.length,
            },
        };
    }

    private extractGoFunctionSignature(line: string): string {
        const match = line.match(/func\s*(?:\([^)]+\)\s+)?\w+\s*\(([^)]*)\)/);
        if (match) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p);
            return `(${params.join(', ')})`;
        }
        return '()';
    }
}
