import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import { BaseParser, SupportedLanguage, ParserResult } from './base-parser';
import { ParsedSymbol, ParsedDependency } from './types';

export class TreeSitterParser extends BaseParser {
    private parser: Parser;
    private language: Parser.Language;

    getSupportedLanguages(): SupportedLanguage[] {
        return ['javascript', 'typescript'];
    }

    constructor(language: 'javascript' | 'typescript' = 'typescript') {
        super();
        this.parser = new Parser();

        if (language === 'javascript') {
            this.language = JavaScript as any;
        } else {
            this.language = TypeScript as any;
        }

        this.parser.setLanguage(this.language);
    }

    parse(code: string, filePath: string): ParserResult {
        const startTime = Date.now();
        const tree = this.parser.parse(code);
        const symbols: ParsedSymbol[] = [];
        const dependencies: ParsedDependency[] = [];

        // Parse symbols
        this.extractSymbols(tree.rootNode, symbols);

        // Parse dependencies
        this.extractDependencies(tree.rootNode, dependencies);

        const parseTime = Date.now() - startTime;

        return {
            symbols,
            dependencies,
            metadata: {
                language: this.language === JavaScript ? 'javascript' : 'typescript',
                fileSize: code.length,
                parseTime,
                symbolCount: symbols.length,
                dependencyCount: dependencies.length,
            },
        };
    }

    private extractSymbols(node: Parser.SyntaxNode, symbols: ParsedSymbol[]): void {
        // Function declarations
        if (node.type === 'function_declaration' && node.firstNamedChild) {
            const nameNode = node.firstNamedChild;
            if (nameNode.type === 'identifier') {
                symbols.push({
                    name: nameNode.text,
                    type: 'function',
                    startLine: nameNode.startPosition.row,
                    endLine: node.endPosition.row,
                    startColumn: nameNode.startPosition.column,
                    endColumn: node.endPosition.column,
                    signature: this.extractFunctionSignature(node),
                });
            }
        }

        // Class declarations
        if (node.type === 'class_declaration' && node.firstNamedChild) {
            const nameNode = node.firstNamedChild;
            if (nameNode.type === 'identifier') {
                symbols.push({
                    name: nameNode.text,
                    type: 'class',
                    startLine: nameNode.startPosition.row,
                    endLine: node.endPosition.row,
                    startColumn: nameNode.startPosition.column,
                    endColumn: node.endPosition.column,
                });
            }
        }

        // Interface declarations
        if (node.type === 'interface_declaration' && node.firstNamedChild) {
            const nameNode = node.firstNamedChild;
            if (nameNode.type === 'identifier') {
                symbols.push({
                    name: nameNode.text,
                    type: 'interface',
                    startLine: nameNode.startPosition.row,
                    endLine: node.endPosition.row,
                    startColumn: nameNode.startPosition.column,
                    endColumn: node.endPosition.column,
                });
            }
        }

        // Variable declarations
        if (node.type === 'variable_declaration') {
            const declarator = node.firstNamedChild;
            if (declarator?.type === 'variable_declarator') {
                const nameNode = declarator.firstNamedChild;
                if (nameNode?.type === 'identifier') {
                    symbols.push({
                        name: nameNode.text,
                        type: 'variable',
                        startLine: nameNode.startPosition.row,
                        endLine: declarator.endPosition.row,
                        startColumn: nameNode.startPosition.column,
                        endColumn: declarator.endPosition.column,
                    });
                }
            }
        }

        // Import statements
        if (node.type === 'import_statement') {
            const importClause = node.firstNamedChild;
            if (importClause?.type === 'import_clause') {
                const namedImports = importClause.firstNamedChild;
                if (namedImports?.type === 'named_imports') {
                    namedImports.namedChildren.forEach((importSpecifier) => {
                        if (importSpecifier.type === 'import_specifier') {
                            const nameNode = importSpecifier.firstNamedChild;
                            if (nameNode?.type === 'identifier') {
                                symbols.push({
                                    name: nameNode.text,
                                    type: 'import',
                                    startLine: nameNode.startPosition.row,
                                    endLine: importSpecifier.endPosition.row,
                                    startColumn: nameNode.startPosition.column,
                                    endColumn: importSpecifier.endPosition.column,
                                });
                            }
                        }
                    });
                }
            }
        }

        // Export statements
        if (node.type === 'export_statement') {
            const exportClause = node.firstNamedChild;
            if (exportClause?.type === 'export_clause') {
                const namedExports = exportClause.firstNamedChild;
                if (namedExports?.type === 'named_exports') {
                    namedExports.namedChildren.forEach((exportSpecifier) => {
                        if (exportSpecifier.type === 'export_specifier') {
                            const nameNode = exportSpecifier.firstNamedChild;
                            if (nameNode?.type === 'identifier') {
                                symbols.push({
                                    name: nameNode.text,
                                    type: 'export',
                                    startLine: nameNode.startPosition.row,
                                    endLine: exportSpecifier.endPosition.row,
                                    startColumn: nameNode.startPosition.column,
                                    endColumn: exportSpecifier.endPosition.column,
                                });
                            }
                        }
                    });
                }
            }
        }

        // Type declarations
        if (node.type === 'type_alias_declaration' && node.firstNamedChild) {
            const nameNode = node.firstNamedChild;
            if (nameNode.type === 'identifier') {
                symbols.push({
                    name: nameNode.text,
                    type: 'type',
                    startLine: nameNode.startPosition.row,
                    endLine: node.endPosition.row,
                    startColumn: nameNode.startPosition.column,
                    endColumn: node.endPosition.column,
                });
            }
        }

        // Recursively process child nodes
        node.namedChildren.forEach((child) => {
            this.extractSymbols(child, symbols);
        });
    }

    private extractDependencies(node: Parser.SyntaxNode, dependencies: ParsedDependency[]): void {
        // Import statements
        if (node.type === 'import_statement') {
            const importClause = node.firstNamedChild;
            if (importClause?.type === 'import_clause') {
                const namedImports = importClause.firstNamedChild;
                if (namedImports?.type === 'named_imports') {
                    namedImports.namedChildren.forEach((importSpecifier) => {
                        if (importSpecifier.type === 'import_specifier') {
                            const nameNode = importSpecifier.firstNamedChild;
                            if (nameNode?.type === 'identifier') {
                                dependencies.push({
                                    sourceName: 'current_file',
                                    targetName: nameNode.text,
                                    type: 'imports',
                                    metadata: { importType: 'named' },
                                });
                            }
                        }
                    });
                }
            }
        }

        // Class extends
        if (node.type === 'class_declaration') {
            const heritageClause = node.namedChildren.find((child) => child.type === 'heritage_clause');
            if (heritageClause) {
                const extendsClause = heritageClause.namedChildren.find((child) => child.type === 'extends_clause');
                if (extendsClause) {
                    const typeRef = extendsClause.firstNamedChild;
                    if (typeRef?.type === 'identifier') {
                        dependencies.push({
                            sourceName: 'current_file',
                            targetName: typeRef.text,
                            type: 'extends',
                        });
                    }
                }
            }
        }

        // Interface extends
        if (node.type === 'interface_declaration') {
            const heritageClause = node.namedChildren.find((child) => child.type === 'heritage_clause');
            if (heritageClause) {
                const extendsClause = heritageClause.namedChildren.find((child) => child.type === 'extends_clause');
                if (extendsClause) {
                    const typeRef = extendsClause.firstNamedChild;
                    if (typeRef?.type === 'identifier') {
                        dependencies.push({
                            sourceName: 'current_file',
                            targetName: typeRef.text,
                            type: 'extends',
                        });
                    }
                }
            }
        }

        // Function calls
        if (node.type === 'call_expression') {
            const functionName = node.firstNamedChild;
            if (functionName?.type === 'identifier') {
                dependencies.push({
                    sourceName: 'current_file',
                    targetName: functionName.text,
                    type: 'calls',
                });
            }
        }

        // Recursively process child nodes
        node.namedChildren.forEach((child) => {
            this.extractDependencies(child, dependencies);
        });
    }

    private extractFunctionSignature(node: Parser.SyntaxNode): string {
        const params: string[] = [];

        // Find parameters
        const parameterList = node.namedChildren.find((child) => child.type === 'formal_parameters');
        if (parameterList) {
            parameterList.namedChildren.forEach((param) => {
                if (param.type === 'parameter') {
                    const paramName = param.firstNamedChild;
                    if (paramName?.type === 'identifier') {
                        params.push(paramName.text);
                    }
                }
            });
        }

        return `(${params.join(', ')})`;
    }

    destroy(): void {
        // this.parser.delete();
    }
}
