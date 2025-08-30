import { BaseParser, SupportedLanguage, ParserResult } from './base-parser';

export class ParserFactory {
    private static parsers: Map<SupportedLanguage, BaseParser> = new Map();

    static getParser(language: SupportedLanguage): BaseParser {
        if (!this.parsers.has(language)) {
            this.parsers.set(language, this.createParser(language));
        }
        return this.parsers.get(language)!;
    }

    private static createParser(language: SupportedLanguage): BaseParser {
        switch (language) {
            case 'typescript':
            case 'javascript':
                // Use MockParser for now due to tree-sitter native module issues
                return this.createMockParser();
            case 'python':
                return this.createPythonParser();
            case 'java':
                return this.createJavaParser();
            case 'go':
                return this.createGoParser();
            case 'rust':
                return this.createRustParser();
            default:
                return this.createMockParser();
        }
    }

    private static createMockParser(): BaseParser {
        const { MockParser } = require('./mock-parser');
        return new MockParser();
    }

    private static createPythonParser(): BaseParser {
        const { PythonParser } = require('./python-parser');
        return new PythonParser();
    }

    private static createJavaParser(): BaseParser {
        const { JavaParser } = require('./java-parser');
        return new JavaParser();
    }

    private static createGoParser(): BaseParser {
        const { GoParser } = require('./go-parser');
        return new GoParser();
    }

    private static createRustParser(): BaseParser {
        const { RustParser } = require('./rust-parser');
        return new RustParser();
    }

    static getLanguageFromFile(filePath: string): SupportedLanguage {
        const extension = filePath.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'ts':
            case 'tsx':
                return 'typescript';
            case 'js':
            case 'jsx':
                return 'javascript';
            case 'py':
                return 'python';
            case 'java':
                return 'java';
            case 'go':
                return 'go';
            case 'rs':
                return 'rust';
            default:
                return 'typescript'; // fallback
        }
    }

    static isSupportedLanguage(language: string): language is SupportedLanguage {
        return ['typescript', 'javascript', 'python', 'java', 'go', 'rust'].includes(language);
    }
}
