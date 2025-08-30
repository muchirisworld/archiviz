'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
    Home,
    Code,
    BarChart3,
    Settings,
    HelpCircle
} from 'lucide-react';

const navigationItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/visualization', label: 'Visualization', icon: Code },
    { href: '/test', label: 'Test Parser', icon: BarChart3 },
    { href: '/test-enhanced', label: 'Test Enhanced', icon: BarChart3 },
];

export default function Navigation() {
    const pathname = usePathname();

    return (
        <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2">
                            <Code className="h-6 w-6 text-primary" />
                            <span className="font-semibold text-lg">Archiviz</span>
                        </Link>

                        <div className="flex items-center gap-1">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;

                                return (
                                    <Link key={item.href} href={item.href}>
                                        <Button
                                            variant={isActive ? 'default' : 'ghost'}
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Icon className="h-4 w-4" />
                                            {item.label}
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                        <Button variant="ghost" size="sm">
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Help
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
