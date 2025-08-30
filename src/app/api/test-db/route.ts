import { NextResponse } from 'next/server';
import { RepositoryService } from '@/lib/services/repository-service';

export async function GET() {
  try {
    const service = new RepositoryService();
    
    // Test creating a repository
    const repository = await service.createRepository('test-repo', 'https://github.com/test/repo');
    
    // Test getting the repository
    const retrievedRepo = await service.getRepository(repository.id);
    
    // Test creating a package
    const pkg = await service.createPackage('test-package', '/src', repository.id);
    
    // Test creating a file
    const file = await service.createFile('test.ts', '/src/test.ts', pkg.id, 'hash123', 'typescript', 100);
    
    // Test creating a symbol
    const symbol = await service.createSymbol({
      name: 'testFunction',
      type: 'function',
      fileId: file.id,
      startLine: 1,
      endLine: 5,
      startColumn: 1,
      endColumn: 20,
      signature: '()',
    });
    
    // Test creating a dependency
    const dependency = await service.createDependency(symbol.id, symbol.id, 'calls', 'test metadata');
    
    // Test creating an embedding
    const embedding = await service.createEmbedding('test function content', 'vector123', symbol.id, 'test-model');
    
    return NextResponse.json({
      success: true,
      message: 'Database operations successful',
      data: {
        repository: retrievedRepo,
        package: pkg,
        file,
        symbol,
        dependency,
        embedding,
      },
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { error: 'Database test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
