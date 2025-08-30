'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import AISearchBar from '@/components/visualization/AISearchBar';
import AIAnalysisPanel from '@/components/visualization/AIAnalysisPanel';
import {
    Brain,
    Search,
    Code,
    Database,
    Zap,
    TrendingUp,
    Lightbulb,
    Sparkles,
    BarChart3,
    FileText,
    Shield
} from 'lucide-react';

interface TestResult {
    id: string;
    name: string;
    type: string;
    description?: string;
    similarity?: number;
}

export default function TestEnhancedPage() {
    const [selectedSymbol, setSelectedSymbol] = useState<TestResult | null>(null);
    const [searchResults, setSearchResults] = useState<TestResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<any>(null);

    // Mock data for demonstration
    const mockSymbols: TestResult[] = [
        {
            id: '1',
            name: 'authenticateUser',
            type: 'function',
            description: 'Handles user authentication with JWT tokens'
        },
        {
            id: '2',
            name: 'UserService',
            type: 'class',
            description: 'Service class for user management operations'
        },
        {
            id: '3',
            name: 'DatabaseConnection',
            type: 'class',
            description: 'Manages database connections and pooling'
        },
        {
            id: '4',
            name: 'validateInput',
            type: 'function',
            description: 'Validates user input data'
        },
        {
            id: '5',
            name: 'sendEmail',
            type: 'function',
            description: 'Sends email notifications to users'
        }
    ];

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await fetch('/api/semantic-search');
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.warn('Failed to load stats:', error);
        }
    };

    const handleNodeSelect = (nodeId: string) => {
        const symbol = mockSymbols.find(s => s.id === nodeId) || 
                      searchResults.find(s => s.id === nodeId);
        setSelectedSymbol(symbol || null);
    };

    const handleSearch = (query: string) => {
        console.log('Search query:', query);
        // In a real implementation, this would trigger the search
        setSearchResults(mockSymbols.filter((s: TestResult) => 
            s.name.toLowerCase().includes(query.toLowerCase()) ||
            s.description?.toLowerCase().includes(query.toLowerCase())
        ));
    };

    const runEmbeddingTest = async () => {
        setIsLoading(true);
        try {
            // This would be a real file ID in production
            const response = await fetch('/api/embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId: 'test-file-id' }),
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Embedding generation result:', data);
            }
        } catch (error) {
            console.error('Embedding test failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const runAnalysisTest = async () => {
        if (!selectedSymbol) return;
        
        setIsLoading(true);
        try {
            const response = await fetch('/api/analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    symbolId: selectedSymbol.id, 
                    analysisType: 'explanation' 
                }),
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Analysis result:', data);
            }
        } catch (error) {
            console.error('Analysis test failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">🤖 AI-Powered Code Analysis</h1>
                <p className="text-muted-foreground">
                    Test the enhanced AI features including semantic search, natural language queries, and intelligent code analysis
                </p>
            </div>

            {/* Stats Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        System Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                            <div className="text-2xl font-bold">{stats?.totalEmbeddings || 0}</div>
                            <div className="text-sm text-muted-foreground">Embeddings</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <Code className="h-8 w-8 mx-auto mb-2 text-green-500" />
                            <div className="text-2xl font-bold">{mockSymbols.length}</div>
                            <div className="text-sm text-muted-foreground">Symbols</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                            <div className="text-2xl font-bold">5</div>
                            <div className="text-sm text-muted-foreground">Analysis Types</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <Zap className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                            <div className="text-2xl font-bold">Active</div>
                            <div className="text-sm text-muted-foreground">AI Services</div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AI Search Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            AI-Powered Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <AISearchBar
                            onNodeSelect={handleNodeSelect}
                            onSearch={handleSearch}
                            placeholder="Try: 'Show me authentication flow' or 'Find database queries'"
                        />
                        
                        <Separator />
                        
                        <div className="space-y-2">
                            <h4 className="font-medium">Search Results</h4>
                            <ScrollArea className="h-48">
                                {searchResults.length > 0 ? (
                                    <div className="space-y-2">
                                        {searchResults.map((result) => (
                                            <div
                                                key={result.id}
                                                className="p-3 border rounded-md hover:bg-muted cursor-pointer"
                                                onClick={() => handleNodeSelect(result.id)}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Code className="h-3 w-3 text-blue-500" />
                                                    <span className="font-medium">{result.name}</span>
                                                    <Badge variant="secondary" className="text-xs">
                                                        {result.type}
                                                    </Badge>
                                                </div>
                                                {result.description && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {result.description}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted-foreground py-8">
                                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No search results yet</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Analysis Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            AI Analysis Panel
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AIAnalysisPanel
                            symbolId={selectedSymbol?.id}
                            symbolName={selectedSymbol?.name}
                            symbolType={selectedSymbol?.type}
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Test Controls */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5" />
                        Test Controls
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Button
                            onClick={runEmbeddingTest}
                            disabled={isLoading}
                            variant="outline"
                        >
                            <Database className="h-4 w-4 mr-2" />
                            Test Embedding Generation
                        </Button>
                        
                        <Button
                            onClick={runAnalysisTest}
                            disabled={isLoading || !selectedSymbol}
                            variant="outline"
                        >
                            <Brain className="h-4 w-4 mr-2" />
                            Test AI Analysis
                        </Button>
                        
                        <Button
                            onClick={() => setSelectedSymbol(mockSymbols[0])}
                            variant="outline"
                        >
                            <Code className="h-4 w-4 mr-2" />
                            Select Test Symbol
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Feature Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Features Overview
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Search className="h-4 w-4 text-blue-500" />
                                <h4 className="font-medium">Semantic Search</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Find code using natural language queries with vector similarity search
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="h-4 w-4 text-purple-500" />
                                <h4 className="font-medium">Natural Language</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Ask questions about your code in plain English
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-green-500" />
                                <h4 className="font-medium">Code Explanation</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Get AI-powered explanations of what code does
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                <h4 className="font-medium">Pattern Detection</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Identify design patterns and architectural decisions
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <BarChart3 className="h-4 w-4 text-orange-500" />
                                <h4 className="font-medium">Complexity Analysis</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Analyze code complexity and maintainability
                            </p>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-red-500" />
                                <h4 className="font-medium">Code Health</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Assess code quality and identify improvement areas
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
