'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GraphNode } from '@/lib/graph/graph-generator';
// Add semantic search API integration
async function semanticSearch(query: string): Promise<string[]> {
    const res = await fetch('/api/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    // Assume results is an array of node IDs
    return data.results?.map((r: any) => r.nodeId || r.id) || [];
}
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Search as SearchIcon,
    X,
    Clock,
    TrendingUp,
    Filter,
    Command
} from 'lucide-react';
import { GraphNode } from '@/lib/graph/graph-generator';

interface SearchBarProps {
    nodes: Map<string, GraphNode>;
    onNodeSelect: (nodeId: string) => void;
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
}

interface SearchResult {
    node: GraphNode;
    score: number;
    highlights: string[];
}

export default function SearchBar({
    nodes,
    onNodeSelect,
    onSearch,
    placeholder = "Search nodes, files, functions...",
    className = ''
}: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [popularSearches, setPopularSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('archiviz-recent-searches');
        if (saved) {
            try {
                setRecentSearches(JSON.parse(saved));
            } catch (error) {
                console.warn('Failed to parse recent searches:', error);
            }
        }

        // Generate popular searches based on node types
        const typeCounts: Record<string, number> = {};
        nodes.forEach(node => {
            typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
        });

        const popular = Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([type]) => type);

        setPopularSearches(popular);
    }, [nodes]);

    // Save recent searches to localStorage
    const addToRecentSearches = (search: string) => {
        if (!search.trim()) return;

        setRecentSearches(prev => {
            const filtered = prev.filter(s => s !== search);
            const newRecent = [search, ...filtered].slice(0, 10);
            localStorage.setItem('archiviz-recent-searches', JSON.stringify(newRecent));
            return newRecent;
        });
    };


    // Search results: combine local fuzzy and semantic search
    const [semanticResults, setSemanticResults] = useState<string[]>([]);
    useEffect(() => {
        if (!query.trim()) return;
        let cancelled = false;
        semanticSearch(query).then(ids => {
            if (!cancelled) setSemanticResults(ids);
        });
        return () => { cancelled = true; };
    }, [query]);

    const searchResults = useMemo(() => {
        if (!query.trim()) return [];
        // Local fuzzy
        const results: SearchResult[] = [];
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/);
        nodes.forEach(node => {
            let score = 0;
            const highlights: string[] = [];
            if (node.name.toLowerCase().includes(queryLower)) { score += 100; highlights.push('name'); }
            if (node.type.toLowerCase().includes(queryLower)) { score += 50; highlights.push('type'); }
            if (node.path && node.path.toLowerCase().includes(queryLower)) { score += 30; highlights.push('path'); }
            if (node.metadata.language && node.metadata.language.toLowerCase().includes(queryLower)) { score += 20; highlights.push('language'); }
            queryWords.forEach(word => {
                if (node.name.toLowerCase().includes(word)) score += 10;
                if (node.type.toLowerCase().includes(word)) score += 5;
            });
            if (score > 0) results.push({ node, score, highlights });
        });
        // Boost semantic results
        semanticResults.forEach(id => {
            const idx = results.findIndex(r => r.node.id === id);
            if (idx >= 0) results[idx].score += 1000;
            else if (nodes.has(id)) results.push({ node: nodes.get(id)!, score: 1000, highlights: [] });
        });
        return results.sort((a, b) => b.score - a.score).slice(0, 20);
    }, [query, nodes, semanticResults]);

    // Handle search submission
    const handleSearch = (searchQuery: string) => {
        if (searchQuery.trim()) {
            onSearch(searchQuery);
            addToRecentSearches(searchQuery);
            setIsOpen(false);
            setQuery('');
        }
    };

    // Handle node selection from search
    const handleNodeSelect = (nodeId: string) => {
        onNodeSelect(nodeId);
        setIsOpen(false);
        setQuery('');
    };

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent) => {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                setFocusedIndex(prev =>
                    prev < searchResults.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                event.preventDefault();
                setFocusedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                event.preventDefault();
                if (focusedIndex >= 0 && focusedIndex < searchResults.length) {
                    handleNodeSelect(searchResults[focusedIndex].node.id);
                } else {
                    handleSearch(query);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setFocusedIndex(-1);
                break;
        }
    };

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setFocusedIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus input when Cmd/Ctrl + K is pressed
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
                event.preventDefault();
                inputRef.current?.focus();
                setIsOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    const highlightText = (text: string, highlights: string[]) => {
        if (!query.trim()) return text;

        const queryLower = query.toLowerCase();
        const parts = text.split(new RegExp(`(${queryLower})`, 'gi'));

        return parts.map((part, index) =>
            part.toLowerCase() === queryLower ? (
                <mark key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 rounded">
                    {part}
                </mark>
            ) : part
        );
    };

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setFocusedIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    className="pl-10 pr-4 py-2"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                    {query && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setQuery('');
                                setIsOpen(false);
                                setFocusedIndex(-1);
                            }}
                            className="h-6 w-6 p-0"
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Search Results Dropdown */}
            {isOpen && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 shadow-lg border">
                    <CardContent className="p-0">
                        <ScrollArea className="max-h-96">
                            {/* Search Results */}
                            {query.trim() && searchResults.length > 0 && (
                                <div className="p-2">
                                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2">
                                        Search Results ({searchResults.length})
                                    </div>
                                    {searchResults.map((result, index) => (
                                        <Button
                                            key={result.node.id}
                                            variant="ghost"
                                            size="sm"
                                            className={`w-full justify-start h-auto p-3 ${index === focusedIndex ? 'bg-accent' : ''
                                                }`}
                                            onClick={() => handleNodeSelect(result.node.id)}
                                        >
                                            <div className="flex items-start gap-3 w-full text-left">
                                                <div className="flex-shrink-0 mt-1">
                                                    <Badge variant="outline" className="text-xs">
                                                        {result.node.type}
                                                    </Badge>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm">
                                                        {highlightText(result.node.name, result.highlights)}
                                                    </div>
                                                    {result.node.path && (
                                                        <div className="text-xs text-muted-foreground mt-1 truncate">
                                                            {result.node.path}
                                                        </div>
                                                    )}
                                                    {result.node.metadata.language && (
                                                        <div className="text-xs text-muted-foreground mt-1">
                                                            Language: {result.node.metadata.language}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-shrink-0 text-xs text-muted-foreground">
                                                    {result.score}
                                                </div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Recent Searches */}
                            {!query.trim() && recentSearches.length > 0 && (
                                <div className="p-2 border-t">
                                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-2">
                                        <Clock className="h-3 w-3" />
                                        Recent Searches
                                    </div>
                                    {recentSearches.map((search, index) => (
                                        <Button
                                            key={index}
                                            variant="ghost"
                                            size="sm"
                                            className="w-full justify-start h-auto p-2 text-sm"
                                            onClick={() => handleSearch(search)}
                                        >
                                            <SearchIcon className="h-3 w-3 mr-2 text-muted-foreground" />
                                            {search}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {/* Popular Searches */}
                            {!query.trim() && popularSearches.length > 0 && (
                                <div className="p-2 border-t">
                                    <div className="text-xs font-medium text-muted-foreground mb-2 px-2 flex items-center gap-2">
                                        <TrendingUp className="h-3 w-3" />
                                        Popular Types
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {popularSearches.map((type) => (
                                            <Button
                                                key={type}
                                                variant="outline"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={() => handleSearch(type)}
                                            >
                                                {type}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* No Results */}
                            {query.trim() && searchResults.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground">
                                    <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No results found for "{query}"</p>
                                    <p className="text-xs mt-1">Try different keywords or check spelling</p>
                                </div>
                            )}

                            {/* Empty State */}
                            {!query.trim() && recentSearches.length === 0 && (
                                <div className="p-4 text-center text-muted-foreground">
                                    <SearchIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Start typing to search</p>
                                    <p className="text-xs mt-1">Use ⌘K to quickly focus search</p>
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
