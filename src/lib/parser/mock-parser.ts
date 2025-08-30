import { BaseParser, SupportedLanguage, ParserResult } from './base-parser';
import { ParsedSymbol, ParsedDependency } from './types';

export class MockParser extends BaseParser {
    getSupportedLanguages(): SupportedLanguage[] {
        return ['typescript', 'javascript'];
    }

    parse(code: string, filePath: string): ParserResult {
        const startTime = Date.now();
        const symbols: ParsedSymbol[] = [];
        const dependencies: ParsedDependency[] = [];

        // Simple regex-based parsing for demonstration
        const lines = code.split('\n');

        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();

            // Function declarations
            const functionMatch = trimmedLine.match(/^function\s+(\w+)\s*\(/);
            if (functionMatch) {
                symbols.push({
                    name: functionMatch[1],
                    type: 'function',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('function') + 1,
                    endColumn: line.length,
                    signature: this.extractFunctionSignature(line),
                });
            }

            // Class declarations
            const classMatch = trimmedLine.match(/^class\s+(\w+)/);
            if (classMatch) {
                symbols.push({
                    name: classMatch[1],
                    type: 'class',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('class') + 1,
                    endColumn: line.length,
                });
            }

            // Interface declarations
            const interfaceMatch = trimmedLine.match(/^interface\s+(\w+)/);
            if (interfaceMatch) {
                symbols.push({
                    name: interfaceMatch[1],
                    type: 'interface',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('interface') + 1,
                    endColumn: line.length,
                });
            }

            // Variable declarations
            const varMatch = trimmedLine.match(/^(?:const|let|var)\s+(\w+)/);
            if (varMatch) {
                symbols.push({
                    name: varMatch[1],
                    type: 'variable',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf(varMatch[1]) + 1,
                    endColumn: line.length,
                });
            }

            // Import statements
            const importMatch = trimmedLine.match(/^import\s+.*?(\w+).*?from/);
            if (importMatch) {
                symbols.push({
                    name: importMatch[1],
                    type: 'import',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf(importMatch[1]) + 1,
                    endColumn: line.length,
                });
            }

            // Export statements
            const exportMatch = trimmedLine.match(/^export\s+.*?(\w+)/);
            if (exportMatch) {
                symbols.push({
                    name: exportMatch[1],
                    type: 'export',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf(exportMatch[1]) + 1,
                    endColumn: line.length,
                });
            }

            // Function calls
            const callMatch = trimmedLine.match(/(\w+)\s*\(/);
            if (callMatch && !trimmedLine.startsWith('function') && !trimmedLine.startsWith('if') && !trimmedLine.startsWith('for')) {
                dependencies.push({
                    sourceName: 'current_file',
                    targetName: callMatch[1],
                    type: 'calls',
                });
            }
        });

        const parseTime = Date.now() - startTime;

        return {
            symbols,
            dependencies,
            metadata: {
                language: 'typescript',
                fileSize: code.length,
                parseTime,
                symbolCount: symbols.length,
                dependencyCount: dependencies.length,
            },
        };
    }

    private extractFunctionSignature(line: string): string {
        const match = line.match(/function\s+\w+\s*\(([^)]*)\)/);
        if (match) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p);
            return `(${params.join(', ')})`;
        }
        return '()';
    }
}
