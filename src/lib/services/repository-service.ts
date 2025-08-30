import { db } from '@/lib/db';
import { repositories, packages, files, symbols, dependencies, embeddings } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export class RepositoryService {
    async createRepository(name: string, url: string) {
        const [repository] = await db
            .insert(repositories)
            .values({
                name,
                url,
            })
            .returning();

        return repository;
    }

    async getRepository(id: string) {
        const [repository] = await db
            .select()
            .from(repositories)
            .where(eq(repositories.id, id));

        return repository;
    }

    async getAllRepositories() {
        return await db.select().from(repositories);
    }

    async updateRepositoryLastParsed(id: string) {
        const [repository] = await db
            .update(repositories)
            .set({
                lastParsed: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(repositories.id, id))
            .returning();

        return repository;
    }

    async deleteRepository(id: string) {
        await db.delete(repositories).where(eq(repositories.id, id));
    }

    async createPackage(name: string, path: string, repositoryId: string) {
        const [pkg] = await db
            .insert(packages)
            .values({
                name,
                path,
                repositoryId,
            })
            .returning();

        return pkg;
    }

    async getPackagesByRepository(repositoryId: string) {
        return await db
            .select()
            .from(packages)
            .where(eq(packages.repositoryId, repositoryId));
    }

    async createFile(name: string, path: string, packageId: string, contentHash: string, language: string, size: number) {
        const [file] = await db
            .insert(files)
            .values({
                name,
                path,
                packageId,
                contentHash,
                language,
                size,
            })
            .returning();

        return file;
    }

    async getFilesByPackage(packageId: string) {
        return await db
            .select()
            .from(files)
            .where(eq(files.packageId, packageId));
    }

    async createSymbol(symbolData: {
        name: string;
        type: 'function' | 'class' | 'interface' | 'variable' | 'import' | 'export' | 'type' | 'namespace' | 'module';
        fileId: string;
        startLine: number;
        endLine: number;
        startColumn: number;
        endColumn: number;
        signature?: string;
        documentation?: string;
    }) {
        const [symbol] = await db
            .insert(symbols)
            .values(symbolData)
            .returning();

        return symbol;
    }

    async getSymbolsByFile(fileId: string) {
        return await db
            .select()
            .from(symbols)
            .where(eq(symbols.fileId, fileId));
    }

    async createDependency(sourceId: string, targetId: string, type: string, metadata?: string) {
        const [dependency] = await db
            .insert(dependencies)
            .values({
                sourceId,
                targetId,
                type: type as any,
                metadata,
            })
            .returning();

        return dependency;
    }

    async getDependenciesBySymbol(symbolId: string) {
        return await db
            .select()
            .from(dependencies)
            .where(eq(dependencies.sourceId, symbolId));
    }

    async createEmbedding(content: string, vector: string, symbolId: string, model: string) {
        const [embedding] = await db
            .insert(embeddings)
            .values({
                content,
                vector,
                symbolId,
                model,
            })
            .returning();

        return embedding;
    }

    async getEmbeddingsBySymbol(symbolId: string) {
        return await db
            .select()
            .from(embeddings)
            .where(eq(embeddings.symbolId, symbolId));
    }
}
