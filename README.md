# 🚀 Archiviz - Codebase Knowledge Graph

An intelligent codebase visualization platform that transforms complex software architectures into interactive, navigable knowledge graphs with AI-powered semantic understanding.

## 🎯 Vision Statement

Build an intelligent codebase visualization platform that transforms complex software architectures into interactive, navigable knowledge graphs with AI-powered semantic understanding.

## ✨ Core Value Propositions

- **Visual Understanding**: Transform abstract code relationships into intuitive visual maps
- **AI-Powered Navigation**: Natural language queries to find code patterns and dependencies
- **Impact Analysis**: Understand ripple effects of changes across the entire codebase
- **Team Collaboration**: Shared annotations and knowledge capture
- **Onboarding Acceleration**: New developers understand system architecture faster

## 🏗️ Stage 1: Foundation & Core Infrastructure

### ✅ Completed Objectives

- [x] Initialize Next.js 14+ with TypeScript and App Router
- [x] Configure Tailwind CSS and shadcn/ui components
- [x] Set up ESLint, Prettier, and Husky for code quality
- [x] Configure development scripts and Docker environment
- [x] Set up PostgreSQL with pgvector extension
- [x] Design and implement Drizzle ORM schema
- [x] Create migration system
- [x] Set up connection pooling and environment configs
- [x] Research and select tree-sitter language grammars
- [x] Create tree-sitter wrapper service
- [x] Implement basic AST parsing for JavaScript/TypeScript
- [x] Test parsing accuracy and performance

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15+ (App Router) with TypeScript
- **Visualization**: Cytoscape.js for interactive graphs
- **UI**: shadcn/ui + Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend & Data
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Drizzle ORM
- **Code Parsing**: Tree-sitter
- **Embeddings**: OpenAI API or Transformers.js
- **Real-time**: Socket.io for collaboration

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ with pnpm package manager
- Docker and Docker Compose
- PostgreSQL 15+ with pgvector extension (handled by Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd archiviz
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp config.env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start the database**
   ```bash
   pnpm docker:up
   ```

5. **Generate and apply database migrations**
   ```bash
   pnpm db:generate
   pnpm db:push
   ```

6. **Start the development server**
```bash
pnpm dev
   ```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/archiviz"

# Redis
REDIS_URL="redis://localhost:6379"

# OpenAI (for embeddings)
OPENAI_API_KEY="your-openai-api-key-here"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📊 Database Schema

The application uses a comprehensive schema designed for codebase analysis:

- **repositories**: Source code repositories
- **packages**: Packages within repositories (for monorepos)
- **files**: Source code files with metadata
- **symbols**: Code symbols (functions, classes, variables, etc.)
- **dependencies**: Relationships between symbols
- **embeddings**: Vector representations for semantic search

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Apply database migrations
- `pnpm db:studio` - Open Drizzle Studio
- `pnpm db:push` - Push schema changes to database
- `pnpm docker:up` - Start Docker services
- `pnpm docker:down` - Stop Docker services
- `pnpm docker:logs` - View Docker logs
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues
- `pnpm format` - Format code with Prettier
- `pnpm type-check` - Run TypeScript type checking

## 🧪 Testing

Visit `/test` in your browser to test:
- Tree-sitter parsing functionality
- API endpoints
- Database connectivity

## 📁 Project Structure

```
archiviz/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API routes
│   │   └── test/           # Test page
│   ├── components/          # UI components
│   ├── lib/
│   │   ├── db/             # Database configuration
│   │   ├── parser/         # Tree-sitter integration
│   │   └── services/       # Business logic services
│   └── hooks/              # Custom React hooks
├── drizzle/                 # Database migrations
├── docker-compose.yml       # Docker services
└── drizzle.config.ts        # Drizzle configuration
```

## 🔍 Tree-sitter Integration

The application uses Tree-sitter for accurate, language-agnostic code parsing:

- **Supported Languages**: JavaScript, TypeScript (primary), Python, Java, Go, Rust
- **Features**: AST parsing, symbol extraction, dependency analysis
- **Performance**: Optimized for large codebases

## 🎯 Next Steps

### Week 2: Enhanced Parsing & Integration
- [ ] Support for additional programming languages
- [ ] Improved dependency resolution
- [ ] Performance optimization for large files

### Week 3: Visualization & UI
- [ ] Cytoscape.js integration
- [ ] Interactive graph visualization
- [ ] Search and filtering capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For questions or issues, please open an issue on GitHub or contact the development team.
