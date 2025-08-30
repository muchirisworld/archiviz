import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Code,
  GitBranch,
  BarChart3,
  Zap,
  Eye,
  Search,
  Filter,
  Settings,
  ArrowRight,
  Github,
  BookOpen,
  Play
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Code className="h-12 w-12 text-primary" />
            <h1 className="text-5xl font-bold">Archiviz</h1>
          </div>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Interactive codebase knowledge graph that visualizes your project structure,
            dependencies, and relationships in stunning detail.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/visualization">
              <Button size="lg" className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Try Visualization
              </Button>
            </Link>
            <Link href="/test-enhanced">
              <Button variant="outline" size="lg" className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Test Parser
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Interactive Visualization</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Explore your codebase through beautiful, interactive graphs with
                  zoom, pan, and selection capabilities.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Smart Search</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Find functions, classes, and files quickly with intelligent
                  search and fuzzy matching.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Filter className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Advanced Filtering</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Filter by language, complexity, file size, and more to
                  focus on what matters.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <GitBranch className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Multi-Language Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Parse and analyze TypeScript, JavaScript, Python, Java,
                  Go, and Rust codebases.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Code Metrics</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Understand code complexity, dependencies, and relationships
                  with detailed metrics and analysis.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>High Performance</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Handle large codebases with thousands of files efficiently
                  using optimized parsing and rendering.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Start Section */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold mb-2">Explore Visualization</h3>
              <p className="text-sm text-muted-foreground">
                Try the interactive graph visualization with sample data
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold mb-2">Test Parser</h3>
              <p className="text-sm text-muted-foreground">
                Test the multi-language parsing engine with your own code
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold mb-2">Customize</h3>
              <p className="text-sm text-muted-foreground">
                Configure filters, layouts, and export your visualizations
              </p>
            </div>
          </div>
          <Link href="/visualization">
            <Button size="lg" className="flex items-center gap-2 mx-auto">
              Start Exploring
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <Link href="/visualization" className="text-muted-foreground hover:text-foreground">
              Visualization
            </Link>
            <Link href="/test" className="text-muted-foreground hover:text-foreground">
              Test Parser
            </Link>
            <Link href="/test-enhanced" className="text-muted-foreground hover:text-foreground">
              Test Enhanced
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js, TypeScript, and Cytoscape.js
          </p>
        </div>
      </footer>
    </div>
  );
}
