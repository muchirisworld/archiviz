'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
    Search as SearchIcon,
    X,
    Clock,
    TrendingUp,
    Filter,
    Command,
    Sparkles,
    Brain,
    Lightbulb,
    Code,
    MessageSquare,
    Zap
} from 'lucide-react';

interface AISearchBarProps {
    onNodeSelect: (nodeId: string) => void;
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
}

interface SearchResult {
    id: string;
    name: string;
    type: string;
    signature?: string;
    documentation?: string;
    similarity?: number;
    explanation?: string;
}

interface QuerySuggestion {
    query: string;
    type: 'recent' | 'popular' | 'ai';
    description?: string;
}

export default function AISearchBar({
    onNodeSelect,
    onSearch,
    placeholder = "Ask about your code...",
    className = ''
}: AISearchBarProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [isLoading, setIsLoading] = useState(false);
    const [searchMode, setSearchMode] = useState<'semantic' | 'natural'>('natural');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [suggestions, setSuggestions] = useState<QuerySuggestion[]>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load search history
    useEffect(() => {
        loadSearchHistory();
        loadQuerySuggestions();
    }, []);

    const loadSearchHistory = async () => {
        try {
            const response = await fetch('/api/natural-language/history?limit=10');
            if (response.ok) {
                const data = await response.json();
                setSearchHistory(data.history.map((h: any) => h.query));
            }
        } catch (error) {
            console.warn('Failed to load search history:', error);
        }
    };

    const loadQuerySuggestions = () => {
        const aiSuggestions: QuerySuggestion[] = [
            {
                query: "Show me authentication flow",
                type: 'ai',
                description: "Find authentication-related components"
            },
            {
                query: "Find database queries",
                type: 'ai',
                description: "Locate database operations"
            },
            {
                query: "What uses this function?",
                type: 'ai',
                description: "Find dependencies and usages"
            },
            {
                query: "Similar functions",
                type: 'ai',
                description: "Find semantically similar code"
            },
            {
                query: "Explain this code",
                type: 'ai',
                description: "Get AI-powered code explanation"
            },
            {
                query: "Analyze complexity",
                type: 'ai',
                description: "Get complexity analysis"
            }
        ];

        setSuggestions(aiSuggestions);
    };

    const performSearch = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setResults([]);

        try {
            let response;
            if (searchMode === 'natural') {
                response = await fetch('/api/natural-language', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: searchQuery }),
                });
            } else {
                response = await fetch('/api/semantic-search', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: searchQuery, topK: 10 }),
                });
            }

            if (response.ok) {
                const data = await response.json();
                
                if (searchMode === 'natural') {
                    setResults(data.result.symbols || []);
                } else {
                    setResults(data.results || []);
                }
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!query.trim()) return;

        await performSearch(query);
        onSearch(query);
        setIsOpen(false);
        
        // Add to history
        setSearchHistory(prev => {
            const filtered = prev.filter(s => s !== query);
            return [query, ...filtered].slice(0, 10);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setFocusedIndex(prev => Math.min(prev + 1, results.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setFocusedIndex(prev => Math.max(prev - 1, -1));
        }
    };

    const handleSuggestionClick = (suggestion: QuerySuggestion) => {
        setQuery(suggestion.query);
        setFocusedIndex(-1);
        performSearch(suggestion.query);
    };

    const handleResultClick = (result: SearchResult) => {
        onNodeSelect(result.id);
        setIsOpen(false);
    };

    const getSearchIcon = () => {
        if (isLoading) return <Zap className="h-4 w-4 animate-pulse" />;
        if (searchMode === 'natural') return <Brain className="h-4 w-4" />;
        return <SearchIcon className="h-4 w-4" />;
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div className="relative">
                <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="pl-10 pr-10"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {getSearchIcon()}
                </div>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchMode(searchMode === 'natural' ? 'semantic' : 'natural')}
                        className="h-6 w-6 p-0"
                    >
                        {searchMode === 'natural' ? <Brain className="h-3 w-3" /> : <SearchIcon className="h-3 w-3" />}
                    </Button>
                    {query && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setQuery('')}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {isOpen && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96">
                    <CardHeader className="pb-2">
                        <Tabs value={results.length > 0 ? 'results' : 'suggestions'} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                                <TabsTrigger value="results" disabled={results.length === 0}>
                                    Results ({results.length})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="suggestions" className="mt-2">
                                <ScrollArea className="h-64">
                                    <div className="space-y-2">
                                        {/* AI Suggestions */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Sparkles className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm font-medium">AI Suggestions</span>
                                            </div>
                                            <div className="space-y-1">
                                                {suggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSuggestionClick(suggestion)}
                                                        className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Lightbulb className="h-3 w-3 text-yellow-500" />
                                                            <span className="text-sm">{suggestion.query}</span>
                                                        </div>
                                                        {suggestion.description && (
                                                            <p className="text-xs text-muted-foreground ml-5">
                                                                {suggestion.description}
                                                            </p>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <Separator />

                                        {/* Recent Searches */}
                                        {searchHistory.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm font-medium">Recent Searches</span>
                                                </div>
                                                <div className="space-y-1">
                                                    {searchHistory.slice(0, 5).map((search, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => handleSuggestionClick({ query: search, type: 'recent' })}
                                                            className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors"
                                                        >
                                                            <span className="text-sm">{search}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="results" className="mt-2">
                                <ScrollArea className="h-64">
                                    <div className="space-y-2">
                                        {results.map((result, index) => (
                                            <button
                                                key={result.id}
                                                onClick={() => handleResultClick(result)}
                                                className={`w-full text-left p-3 rounded-md border transition-colors ${
                                                    index === focusedIndex ? 'bg-muted border-primary' : 'hover:bg-muted'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Code className="h-3 w-3 text-blue-500" />
                                                            <span className="font-medium">{result.name}</span>
                                                            <Badge variant="secondary" className="text-xs">
                                                                {result.type}
                                                            </Badge>
                                                            {result.similarity && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {(result.similarity * 100).toFixed(1)}% match
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {result.signature && (
                                                            <p className="text-xs text-muted-foreground font-mono">
                                                                {result.signature}
                                                            </p>
                                                        )}
                                                        {result.documentation && (
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                {result.documentation}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </CardHeader>
                </Card>
            )}
        </div>
    );
}
