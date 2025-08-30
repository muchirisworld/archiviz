# 🤖 AI Integration & Semantic Features - Stage 4

This document outlines the AI-powered features implemented in the Archiviz code visualization platform.

## 🎯 Overview

Stage 4 introduces comprehensive AI integration for intelligent code analysis, semantic search, and natural language querying. The system now provides:

- **Semantic Code Search**: Find code using natural language queries
- **AI-Powered Analysis**: Get explanations, pattern detection, and refactoring suggestions
- **Intelligent Navigation**: Navigate codebases using natural language
- **Vector-Based Similarity**: Find similar code using embeddings

## 🏗️ Architecture

### Core Services

1. **EmbeddingService** (`src/lib/services/embedding-service.ts`)
   - Generates and stores code embeddings using pgvector
   - Performs semantic similarity search
   - Manages embedding lifecycle

2. **AIAnalysisService** (`src/lib/services/ai-analysis-service.ts`)
   - Code explanation generation
   - Design pattern detection
   - Complexity analysis
   - Refactoring suggestions
   - Code health assessment

3. **NaturalLanguageService** (`src/lib/services/natural-language-service.ts`)
   - Intent recognition and query processing
   - Intelligent code navigation
   - Search history management
   - Query suggestions

### Database Schema

The database has been extended with AI-specific tables:

```sql
-- Embeddings table for vector storage
CREATE TABLE embeddings (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  vector vector(1536), -- OpenAI ada-002 dimensions
  symbol_id UUID REFERENCES symbols(id),
  model TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Search queries for history and analytics
CREATE TABLE search_queries (
  id UUID PRIMARY KEY,
  query TEXT NOT NULL,
  user_id TEXT,
  results JSON,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Analysis results for AI insights
CREATE TABLE analysis_results (
  id UUID PRIMARY KEY,
  symbol_id UUID REFERENCES symbols(id),
  analysis_type TEXT NOT NULL,
  result JSON NOT NULL,
  confidence REAL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Features

### 1. Semantic Search

**API Endpoint**: `POST /api/semantic-search`

Find code using natural language queries with vector similarity search.

```typescript
// Example usage
const response = await fetch('/api/semantic-search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    query: "authentication function", 
    topK: 10 
  })
});
```

**Features**:
- Vector similarity search using pgvector
- Configurable result count
- Symbol metadata included in results
- Fallback to text search

### 2. Natural Language Queries

**API Endpoint**: `POST /api/natural-language`

Process natural language queries with intent recognition.

```typescript
// Example queries
"Show me authentication flow"
"Find database queries"
"What uses this function?"
"Similar functions"
"Explain this code"
"Analyze complexity"
```

**Intent Types**:
- `find`: Locate specific code
- `explain`: Get code explanations
- `navigate`: Navigate code structure
- `analyze`: Perform code analysis
- `compare`: Compare code elements

### 3. AI Code Analysis

**API Endpoint**: `POST /api/analysis`

Get comprehensive AI-powered code analysis.

**Analysis Types**:

#### Code Explanation
- What the code does
- How it works
- Important details and edge cases
- Context in the broader codebase

#### Pattern Detection
- Design patterns (Factory, Singleton, Observer, etc.)
- Architectural patterns (MVC, Repository, etc.)
- Anti-patterns identification
- Pattern improvement suggestions

#### Complexity Analysis
- Cyclomatic complexity
- Cognitive complexity
- Time and space complexity
- Maintainability score
- Performance bottlenecks
- Complexity reduction suggestions

#### Refactoring Suggestions
- Specific refactoring opportunities
- Code quality improvements
- Performance optimizations
- Better naming suggestions
- Structural improvements
- Testing recommendations

#### Code Health Assessment
- Code quality score (1-10)
- Documentation quality
- Test coverage needs
- Security considerations
- Maintainability factors
- Technical debt indicators

### 4. Embedding Generation

**API Endpoint**: `POST /api/embeddings`

Generate embeddings for code symbols using tree-sitter parsing and Bedrock embeddings.

```typescript
// Generate embeddings for a file
const response = await fetch('/api/embeddings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fileId: 'file-uuid' })
});
```

**Process**:
1. Parse code using tree-sitter
2. Extract code contexts
3. Generate embeddings using Bedrock
4. Store in pgvector database

## 🎨 UI Components

### AISearchBar

A comprehensive search component with AI-powered suggestions and natural language processing.

**Features**:
- Natural language query input
- AI-powered suggestions
- Search history
- Semantic and text search modes
- Real-time results

### AIAnalysisPanel

A detailed analysis panel showing AI insights for selected code symbols.

**Features**:
- Tabbed interface for different analysis types
- Confidence scoring
- Real-time analysis generation
- Error handling and loading states

## 🔧 Configuration

### Environment Variables

```bash
# Bedrock Configuration
BEDROCK_EMBEDDING_MODEL_ID=amazon.titan-embed-text-v1
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0

# Database
DATABASE_URL=postgresql://user:password@localhost:5433/archiviz

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### pgvector Setup

The system uses pgvector for vector similarity search. Ensure the extension is enabled:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

## 📊 Performance Metrics

### Target Performance

- **Embedding Generation**: 1000 symbols per minute
- **Search Response Time**: Under 200ms
- **Analysis Completion**: Under 5 seconds per file
- **Vector Similarity Search**: Under 50ms for 100k embeddings

### Monitoring

Use the stats endpoint to monitor system performance:

```typescript
// Get embedding statistics
const response = await fetch('/api/semantic-search');
const stats = await response.json();
// { totalEmbeddings: 1234 }
```

## 🧪 Testing

### Test Page

Visit `/test-enhanced` to test all AI features:

1. **AI Search**: Try natural language queries
2. **Analysis Panel**: Select symbols for AI analysis
3. **Test Controls**: Run embedding and analysis tests
4. **Feature Overview**: See all available AI capabilities

### Example Queries

```bash
# Authentication
"Show me authentication flow"
"Find login functions"

# Database
"Find database queries"
"Show me SQL operations"

# Dependencies
"What uses this function?"
"Find dependencies"

# Analysis
"Explain this code"
"Analyze complexity"
"Get refactoring suggestions"
```

## 🔮 Future Enhancements

### Planned Features

1. **Chat Interface**: Interactive AI chat for code exploration
2. **Batch Analysis**: Analyze entire codebases
3. **Custom Models**: Support for custom embedding models
4. **Advanced Patterns**: More sophisticated pattern detection
5. **Performance Optimization**: Caching and optimization
6. **Multi-language Support**: Enhanced language support

### Integration Opportunities

1. **IDE Extensions**: VS Code, IntelliJ integration
2. **CI/CD Integration**: Automated code analysis
3. **Team Collaboration**: Shared analysis and insights
4. **Documentation Generation**: Auto-generate documentation
5. **Code Review**: AI-assisted code review

## 🛠️ Development

### Adding New Analysis Types

1. Extend the `AIAnalysisService` with new analysis methods
2. Add analysis type to the database schema
3. Update the UI components to display new analysis
4. Add tests for the new functionality

### Custom Embedding Models

1. Implement custom embedding service
2. Update the `BedrockEmbeddingPipeline`
3. Configure model parameters
4. Test with your codebase

### Performance Optimization

1. Implement embedding caching
2. Add database indexing
3. Optimize vector similarity queries
4. Add result pagination

## 📚 API Reference

### Semantic Search

```typescript
POST /api/semantic-search
{
  "query": "string",
  "topK": number
}

Response:
{
  "results": Array<SearchResult>,
  "query": "string",
  "totalResults": number
}
```

### Natural Language

```typescript
POST /api/natural-language
{
  "query": "string",
  "userId": "string"
}

Response:
{
  "success": boolean,
  "result": QueryResult,
  "query": "string"
}
```

### AI Analysis

```typescript
POST /api/analysis
{
  "symbolId": "string",
  "analysisType": "explanation" | "pattern" | "complexity" | "suggestion" | "health"
}

Response:
{
  "success": boolean,
  "result": AnalysisResult,
  "analysisType": "string",
  "symbolId": "string"
}
```

### Embeddings

```typescript
POST /api/embeddings
{
  "fileId": "string"
}

Response:
{
  "success": boolean,
  "count": number,
  "fileId": "string",
  "language": "string"
}
```

## 🤝 Contributing

When contributing to AI features:

1. **Follow the service pattern**: Use the established service architecture
2. **Add comprehensive tests**: Ensure AI features are well-tested
3. **Document changes**: Update this README with new features
4. **Performance considerations**: Monitor and optimize performance
5. **Error handling**: Implement robust error handling for AI services

## 📄 License

This AI integration is part of the Archiviz project. See the main LICENSE file for details.
