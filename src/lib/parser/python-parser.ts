import { BaseParser, SupportedLanguage, ParserResult } from './base-parser';
import { ParsedSymbol, ParsedDependency } from './types';

export class PythonParser extends BaseParser {
    getSupportedLanguages(): SupportedLanguage[] {
        return ['python'];
    }

    parse(code: string, filePath: string): ParserResult {
        const startTime = Date.now();
        const symbols: ParsedSymbol[] = [];
        const dependencies: ParsedDependency[] = [];

        const lines = code.split('\n');

        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();

            // Function definitions
            const functionMatch = trimmedLine.match(/^def\s+(\w+)\s*\(/);
            if (functionMatch) {
                symbols.push({
                    name: functionMatch[1],
                    type: 'function',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('def') + 1,
                    endColumn: line.length,
                    signature: this.extractPythonFunctionSignature(line),
                    visibility: 'public',
                });
            }

            // Class definitions
            const classMatch = trimmedLine.match(/^class\s+(\w+)/);
            if (classMatch) {
                symbols.push({
                    name: classMatch[1],
                    type: 'class',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('class') + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });
            }

            // Method definitions
            const methodMatch = trimmedLine.match(/^\s+def\s+(\w+)\s*\(/);
            if (methodMatch) {
                symbols.push({
                    name: methodMatch[1],
                    type: 'method',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('def') + 1,
                    endColumn: line.length,
                    signature: this.extractPythonFunctionSignature(line),
                    visibility: 'public',
                });
            }

            // Variable assignments
            const varMatch = trimmedLine.match(/^(\w+)\s*=/);
            if (varMatch && !trimmedLine.startsWith('def') && !trimmedLine.startsWith('class')) {
                symbols.push({
                    name: varMatch[1],
                    type: 'variable',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf(varMatch[1]) + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });
            }

            // Import statements
            const importMatch = trimmedLine.match(/^import\s+(\w+)/);
            if (importMatch) {
                symbols.push({
                    name: importMatch[1],
                    type: 'import',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf(importMatch[1]) + 1,
                    endColumn: line.length,
                    visibility: 'public',
                });

                dependencies.push({
                    sourceName: 'current_file',
                    targetName: importMatch[1],
                    type: 'imports',
                    metadata: { importType: 'module' },
                    sourceLocation: { line: lineIndex + 1, column: line.indexOf('import') + 1 },
                });
            }

            // From imports
            const fromImportMatch = trimmedLine.match(/^from\s+(\w+)\s+import/);
            if (fromImportMatch) {
                dependencies.push({
                    sourceName: 'current_file',
                    targetName: fromImportMatch[1],
                    type: 'imports_from',
                    metadata: { importType: 'from' },
                    sourceLocation: { line: lineIndex + 1, column: line.indexOf('from') + 1 },
                });
            }

            // Function calls
            const callMatch = trimmedLine.match(/(\w+)\s*\(/);
            if (callMatch && !trimmedLine.startsWith('def') && !trimmedLine.startsWith('class') && !trimmedLine.includes('=')) {
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
                language: 'python',
                fileSize: code.length,
                parseTime,
                symbolCount: symbols.length,
                dependencyCount: dependencies.length,
            },
        };
    }

    private extractPythonFunctionSignature(line: string): string {
        const match = line.match(/def\s+\w+\s*\(([^)]*)\)/);
        if (match) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p);
            return `(${params.join(', ')})`;
        }
        return '()';
    }
}
