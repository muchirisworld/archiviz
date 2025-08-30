import { BaseParser, SupportedLanguage, ParserResult } from './base-parser';
import { ParsedSymbol, ParsedDependency } from './types';

export class JavaParser extends BaseParser {
    getSupportedLanguages(): SupportedLanguage[] {
        return ['java'];
    }

    parse(code: string, filePath: string): ParserResult {
        const startTime = Date.now();
        const symbols: ParsedSymbol[] = [];
        const dependencies: ParsedDependency[] = [];

        const lines = code.split('\n');

        lines.forEach((line, lineIndex) => {
            const trimmedLine = line.trim();

            // Class definitions
            const classMatch = trimmedLine.match(/^(?:public\s+)?(?:abstract\s+)?(?:final\s+)?class\s+(\w+)/);
            if (classMatch) {
                const modifiers = this.extractModifiers(line);
                symbols.push({
                    name: classMatch[1],
                    type: 'class',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('class') + 1,
                    endColumn: line.length,
                    modifiers,
                    visibility: this.extractVisibility(modifiers),
                    isAbstract: modifiers.includes('abstract'),
                    isFinal: modifiers.includes('final'),
                });
            }

            // Interface definitions
            const interfaceMatch = trimmedLine.match(/^(?:public\s+)?interface\s+(\w+)/);
            if (interfaceMatch) {
                const modifiers = this.extractModifiers(line);
                symbols.push({
                    name: interfaceMatch[1],
                    type: 'interface',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf('interface') + 1,
                    endColumn: line.length,
                    modifiers,
                    visibility: this.extractVisibility(modifiers),
                });
            }

            // Method definitions
            const methodMatch = trimmedLine.match(/^(?:public|private|protected|static|final|abstract|synchronized|native|strictfp\s+)*\w+\s+(\w+)\s*\(/);
            if (methodMatch && !trimmedLine.includes('class') && !trimmedLine.includes('interface')) {
                const modifiers = this.extractModifiers(line);
                symbols.push({
                    name: methodMatch[1],
                    type: 'method',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf(methodMatch[1]) + 1,
                    endColumn: line.length,
                    signature: this.extractJavaMethodSignature(line),
                    modifiers,
                    visibility: this.extractVisibility(modifiers),
                    isStatic: modifiers.includes('static'),
                    isAbstract: modifiers.includes('abstract'),
                    isFinal: modifiers.includes('final'),
                });
            }

            // Field declarations
            const fieldMatch = trimmedLine.match(/^(?:public|private|protected|static|final|volatile|transient\s+)*\w+\s+(\w+)\s*[=;]/);
            if (fieldMatch && !trimmedLine.includes('class') && !trimmedLine.includes('interface') && !trimmedLine.includes('(')) {
                const modifiers = this.extractModifiers(line);
                symbols.push({
                    name: fieldMatch[1],
                    type: 'field',
                    startLine: lineIndex + 1,
                    endLine: lineIndex + 1,
                    startColumn: line.indexOf(fieldMatch[1]) + 1,
                    endColumn: line.length,
                    modifiers,
                    visibility: this.extractVisibility(modifiers),
                    isStatic: modifiers.includes('static'),
                    isFinal: modifiers.includes('final'),
                });
            }

            // Import statements
            const importMatch = trimmedLine.match(/^import\s+(?:static\s+)?([\w.]+)/);
            if (importMatch) {
                const importPath = importMatch[1];
                const className = importPath.split('.').pop()!;

                symbols.push({
                    name: className,
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
                    metadata: { importType: 'class', fullPath: importPath },
                    sourceLocation: { line: lineIndex + 1, column: line.indexOf('import') + 1 },
                });
            }

            // Extends clause
            const extendsMatch = trimmedLine.match(/extends\s+(\w+)/);
            if (extendsMatch) {
                dependencies.push({
                    sourceName: 'current_file',
                    targetName: extendsMatch[1],
                    type: 'extends',
                    sourceLocation: { line: lineIndex + 1, column: line.indexOf('extends') + 1 },
                });
            }

            // Implements clause
            const implementsMatch = trimmedLine.match(/implements\s+([\w,\s]+)/);
            if (implementsMatch) {
                const interfaces = implementsMatch[1].split(',').map(i => i.trim());
                interfaces.forEach(interfaceName => {
                    dependencies.push({
                        sourceName: 'current_file',
                        targetName: interfaceName,
                        type: 'implements',
                        sourceLocation: { line: lineIndex + 1, column: line.indexOf('implements') + 1 },
                    });
                });
            }

            // Method calls
            const callMatch = trimmedLine.match(/(\w+)\s*\(/);
            if (callMatch && !trimmedLine.includes('class') && !trimmedLine.includes('interface') && !trimmedLine.includes('=')) {
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
                language: 'java',
                fileSize: code.length,
                parseTime,
                symbolCount: symbols.length,
                dependencyCount: dependencies.length,
            },
        };
    }

    private extractModifiers(line: string): string[] {
        const modifiers = ['public', 'private', 'protected', 'static', 'final', 'abstract', 'synchronized', 'native', 'strictfp', 'volatile', 'transient'];
        return modifiers.filter(modifier => line.includes(modifier));
    }

    private extractVisibility(modifiers: string[]): 'public' | 'private' | 'protected' | 'internal' {
        if (modifiers.includes('public')) return 'public';
        if (modifiers.includes('private')) return 'private';
        if (modifiers.includes('protected')) return 'protected';
        return 'internal';
    }

    private extractJavaMethodSignature(line: string): string {
        const match = line.match(/\(\s*([^)]*)\s*\)/);
        if (match) {
            const params = match[1].split(',').map(p => p.trim()).filter(p => p);
            return `(${params.join(', ')})`;
        }
        return '()';
    }
}
