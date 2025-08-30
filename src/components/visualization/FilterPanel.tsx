'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
    Filter,
    X,
    RefreshCw,
    FileText,
    Code,
    GitBranch,
    Package,
    FunctionSquare,
    Square,
    Variable,
    Import,
    Download,
    Type,
    Layers,
    Settings,
    Database,
    Construction,
    ChevronDown,
    ChevronRight
} from 'lucide-react';
import { GraphNode } from '@/lib/graph/graph-generator';

interface FilterPanelProps {
    nodes: Map<string, GraphNode>;
    onFiltersChange: (filters: GraphFilters) => void;
    className?: string;
}

export interface GraphFilters {
    nodeTypes: Set<string>;
    languages: Set<string>;
    complexityRange: [number, number];
    lineCountRange: [number, number];
    showOnlySelected: boolean;
    showOnlyConnected: boolean;
    excludeExternal: boolean;
}

const getNodeIcon = (type: string) => {
    switch (type) {
        case 'repository':
            return <GitBranch className="h-4 w-4" />;
        case 'package':
            return <Package className="h-4 w-4" />;
        case 'file':
            return <FileText className="h-4 w-4" />;
        case 'function':
            return <FunctionSquare className="h-4 w-4" />;
        case 'class':
            return <Square className="h-4 w-4" />;
        case 'interface':
            return <Code className="h-4 w-4" />;
        case 'variable':
            return <Variable className="h-4 w-4" />;
        case 'import':
            return <Import className="h-4 w-4" />;
        case 'export':
            return <Download className="h-4 w-4" />;
        case 'type':
            return <Type className="h-4 w-4" />;
        case 'namespace':
            return <Layers className="h-4 w-4" />;
        case 'method':
            return <Settings className="h-4 w-4" />;
        case 'field':
            return <Database className="h-4 w-4" />;
        case 'enum':
            return <Code className="h-4 w-4" />;
        case 'struct':
            return <Construction className="h-4 w-4" />;
        case 'trait':
            return <Layers className="h-4 w-4" />;
        default:
            return <Code className="h-4 w-4" />;
    }
};

export default function FilterPanel({
    nodes,
    onFiltersChange,
    className = ''
}: FilterPanelProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(
        new Set(['types', 'languages', 'complexity'])
    );
    const [filters, setFilters] = useState<GraphFilters>({
        nodeTypes: new Set(),
        languages: new Set(),
        complexityRange: [0, 50],
        lineCountRange: [0, 1000],
        showOnlySelected: false,
        showOnlyConnected: false,
        excludeExternal: false,
    });

    // Extract available filter options from nodes
    const filterOptions = useMemo(() => {
        const types = new Set<string>();
        const languages = new Set<string>();
        let maxComplexity = 0;
        let maxLineCount = 0;

        nodes.forEach(node => {
            types.add(node.type);
            if (node.metadata.language) {
                languages.add(node.metadata.language);
            }
            if (node.metadata.complexity !== undefined) {
                maxComplexity = Math.max(maxComplexity, node.metadata.complexity);
            }
            if (node.metadata.lineCount) {
                maxLineCount = Math.max(maxLineCount, node.metadata.lineCount);
            }
        });

        return {
            types: Array.from(types).sort(),
            languages: Array.from(languages).sort(),
            maxComplexity,
            maxLineCount,
        };
    }, [nodes]);

    // Update filters and notify parent
    const updateFilters = useCallback((newFilters: Partial<GraphFilters>) => {
        const updatedFilters = { ...filters, ...newFilters };
        setFilters(updatedFilters);
        onFiltersChange(updatedFilters);
    }, [filters, onFiltersChange]);

    // Toggle section expansion
    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(section)) {
                newSet.delete(section);
            } else {
                newSet.add(section);
            }
            return newSet;
        });
    };

    // Toggle node type filter
    const toggleNodeType = (type: string) => {
        const newTypes = new Set(filters.nodeTypes);
        if (newTypes.has(type)) {
            newTypes.delete(type);
        } else {
            newTypes.add(type);
        }
        updateFilters({ nodeTypes: newTypes });
    };

    // Toggle language filter
    const toggleLanguage = (language: string) => {
        const newLanguages = new Set(filters.languages);
        if (newLanguages.has(language)) {
            newLanguages.delete(language);
        } else {
            newLanguages.add(language);
        }
        updateFilters({ languages: newLanguages });
    };

    // Update complexity range
    const updateComplexityRange = (range: [number, number]) => {
        updateFilters({ complexityRange: range });
    };

    // Update line count range
    const updateLineCountRange = (range: [number, number]) => {
        updateFilters({ lineCountRange: range });
    };

    // Reset all filters
    const resetFilters = () => {
        const resetFilters: GraphFilters = {
            nodeTypes: new Set(),
            languages: new Set(),
            complexityRange: [0, filterOptions.maxComplexity],
            lineCountRange: [0, filterOptions.maxLineCount],
            showOnlySelected: false,
            showOnlyConnected: false,
            excludeExternal: false,
        };
        setFilters(resetFilters);
        onFiltersChange(resetFilters);
    };

    // Clear specific filter type
    const clearFilterType = (filterType: keyof GraphFilters) => {
        if (filterType === 'nodeTypes') {
            updateFilters({ nodeTypes: new Set() });
        } else if (filterType === 'languages') {
            updateFilters({ languages: new Set() });
        } else if (filterType === 'complexityRange') {
            updateFilters({ complexityRange: [0, filterOptions.maxComplexity] });
        } else if (filterType === 'lineCountRange') {
            updateFilters({ lineCountRange: [0, filterOptions.maxLineCount] });
        }
    };

    // Get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.nodeTypes.size > 0) count++;
        if (filters.languages.size > 0) count++;
        if (filters.complexityRange[0] > 0 || filters.complexityRange[1] < filterOptions.maxComplexity) count++;
        if (filters.lineCountRange[0] > 0 || filters.lineCountRange[1] < filterOptions.maxLineCount) count++;
        if (filters.showOnlySelected) count++;
        if (filters.showOnlyConnected) count++;
        if (filters.excludeExternal) count++;
        return count;
    };

    const activeFilterCount = getActiveFilterCount();

    return (
        <Card className={`w-80 ${className}`}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        <CardTitle className="text-lg">Filters</CardTitle>
                    </div>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                            {activeFilterCount} active
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>
                    {activeFilterCount > 0 && (
                        <Button variant="ghost" size="sm" onClick={resetFilters}>
                            <X className="h-4 w-4 mr-2" />
                            Clear All
                        </Button>
                    )}
                </div>
            </CardHeader>

            <ScrollArea className="h-[calc(100vh-200px)]">
                <CardContent className="space-y-4">
                    {/* Node Types Filter */}
                    <div>
                        <button
                            onClick={() => toggleSection('types')}
                            className="flex items-center gap-2 w-full text-left font-semibold text-sm hover:text-foreground transition-colors"
                        >
                            {expandedSections.has('types') ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            Node Types ({filterOptions.types.length})
                        </button>

                        {expandedSections.has('types') && (
                            <div className="mt-3 space-y-2 pl-6">
                                {filterOptions.types.map((type) => (
                                    <div key={type} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`type-${type}`}
                                            checked={filters.nodeTypes.has(type)}
                                            onCheckedChange={() => toggleNodeType(type)}
                                        />
                                        <label
                                            htmlFor={`type-${type}`}
                                            className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground"
                                        >
                                            {getNodeIcon(type)}
                                            {type}
                                        </label>
                                    </div>
                                ))}
                                {filters.nodeTypes.size > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => clearFilterType('nodeTypes')}
                                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Clear types
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Languages Filter */}
                    <div>
                        <button
                            onClick={() => toggleSection('languages')}
                            className="flex items-center gap-2 w-full text-left font-semibold text-sm hover:text-foreground transition-colors"
                        >
                            {expandedSections.has('languages') ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            Languages ({filterOptions.languages.length})
                        </button>

                        {expandedSections.has('languages') && (
                            <div className="mt-3 space-y-2 pl-6">
                                {filterOptions.languages.map((language) => (
                                    <div key={language} className="flex items-center gap-2">
                                        <Checkbox
                                            id={`lang-${language}`}
                                            checked={filters.languages.has(language)}
                                            onCheckedChange={() => toggleLanguage(language)}
                                        />
                                        <label
                                            htmlFor={`lang-${language}`}
                                            className="text-sm cursor-pointer hover:text-foreground"
                                        >
                                            {language}
                                        </label>
                                    </div>
                                ))}
                                {filters.languages.size > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => clearFilterType('languages')}
                                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Clear languages
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Complexity Filter */}
                    <div>
                        <button
                            onClick={() => toggleSection('complexity')}
                            className="flex items-center gap-2 w-full text-left font-semibold text-sm hover:text-foreground transition-colors"
                        >
                            {expandedSections.has('complexity') ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            Complexity
                        </button>

                        {expandedSections.has('complexity') && (
                            <div className="mt-3 space-y-3 pl-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Min: {filters.complexityRange[0]}</span>
                                        <span>Max: {filters.complexityRange[1]}</span>
                                    </div>
                                    <Slider
                                        value={filters.complexityRange}
                                        onValueChange={updateComplexityRange}
                                        max={filterOptions.maxComplexity}
                                        step={1}
                                        className="w-full"
                                    />
                                </div>
                                {(filters.complexityRange[0] > 0 || filters.complexityRange[1] < filterOptions.maxComplexity) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => clearFilterType('complexityRange')}
                                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Reset range
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Line Count Filter */}
                    <div>
                        <button
                            onClick={() => toggleSection('lineCount')}
                            className="flex items-center gap-2 w-full text-left font-semibold text-sm hover:text-foreground transition-colors"
                        >
                            {expandedSections.has('lineCount') ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            Lines of Code
                        </button>

                        {expandedSections.has('lineCount') && (
                            <div className="mt-3 space-y-3 pl-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-muted-foreground">
                                        <span>Min: {filters.lineCountRange[0]}</span>
                                        <span>Max: {filters.lineCountRange[1]}</span>
                                    </div>
                                    <Slider
                                        value={filters.lineCountRange}
                                        onValueChange={updateLineCountRange}
                                        max={filterOptions.maxLineCount}
                                        step={10}
                                        className="w-full"
                                    />
                                </div>
                                {(filters.lineCountRange[0] > 0 || filters.lineCountRange[1] < filterOptions.maxLineCount) && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => clearFilterType('lineCountRange')}
                                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                        Reset range
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* View Options */}
                    <div>
                        <button
                            onClick={() => toggleSection('viewOptions')}
                            className="flex items-center gap-2 w-full text-left font-semibold text-sm hover:text-foreground transition-colors"
                        >
                            {expandedSections.has('viewOptions') ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
                            View Options
                        </button>

                        {expandedSections.has('viewOptions') && (
                            <div className="mt-3 space-y-3 pl-6">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="showOnlySelected"
                                        checked={filters.showOnlySelected}
                                        onCheckedChange={(checked) =>
                                            updateFilters({ showOnlySelected: checked as boolean })
                                        }
                                    />
                                    <label
                                        htmlFor="showOnlySelected"
                                        className="text-sm cursor-pointer hover:text-foreground"
                                    >
                                        Show only selected nodes
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="showOnlyConnected"
                                        checked={filters.showOnlyConnected}
                                        onCheckedChange={(checked) =>
                                            updateFilters({ showOnlyConnected: checked as boolean })
                                        }
                                    />
                                    <label
                                        htmlFor="showOnlyConnected"
                                        className="text-sm cursor-pointer hover:text-foreground"
                                    >
                                        Show only connected nodes
                                    </label>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="excludeExternal"
                                        checked={filters.excludeExternal}
                                        onCheckedChange={(checked) =>
                                            updateFilters({ excludeExternal: checked as boolean })
                                        }
                                    />
                                    <label
                                        htmlFor="excludeExternal"
                                        className="text-sm cursor-pointer hover:text-foreground"
                                    >
                                        Exclude external dependencies
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Active Filters Summary */}
                    {activeFilterCount > 0 && (
                        <>
                            <Separator />
                            <div className="pl-6">
                                <div className="text-xs font-medium text-muted-foreground mb-2">
                                    Active Filters
                                </div>
                                <div className="space-y-1">
                                    {filters.nodeTypes.size > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                            {filters.nodeTypes.size} types
                                        </Badge>
                                    )}
                                    {filters.languages.size > 0 && (
                                        <Badge variant="outline" className="text-xs">
                                            {filters.languages.size} languages
                                        </Badge>
                                    )}
                                    {(filters.complexityRange[0] > 0 || filters.complexityRange[1] < filterOptions.maxComplexity) && (
                                        <Badge variant="outline" className="text-xs">
                                            Complexity: {filters.complexityRange[0]}-{filters.complexityRange[1]}
                                        </Badge>
                                    )}
                                    {(filters.lineCountRange[0] > 0 || filters.lineCountRange[1] < filterOptions.maxLineCount) && (
                                        <Badge variant="outline" className="text-xs">
                                            Lines: {filters.lineCountRange[0]}-{filters.lineCountRange[1]}
                                        </Badge>
                                    )}
                                    {filters.showOnlySelected && (
                                        <Badge variant="outline" className="text-xs">
                                            Selected only
                                        </Badge>
                                    )}
                                    {filters.showOnlyConnected && (
                                        <Badge variant="outline" className="text-xs">
                                            Connected only
                                        </Badge>
                                    )}
                                    {filters.excludeExternal && (
                                        <Badge variant="outline" className="text-xs">
                                            No external
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </ScrollArea>
        </Card>
    );
}
