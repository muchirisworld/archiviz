import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface PackageInfo {
    name: string;
    version: string;
    path: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    peerDependencies?: Record<string, string>;
    workspaces?: string[];
    private?: boolean;
}

export interface MonorepoConfig {
    type: 'npm' | 'yarn' | 'pnpm' | 'lerna';
    rootPackage: PackageInfo;
    packages: PackageInfo[];
    workspacePatterns: string[];
    packageManager: string;
}

export class MonorepoDetector {
    private rootPath: string;

    constructor(rootPath: string) {
        this.rootPath = rootPath;
    }

    detect(): MonorepoConfig | null {
        try {
            const packageJsonPath = join(this.rootPath, 'package.json');
            if (!existsSync(packageJsonPath)) {
                return null;
            }

            const rootPackage = this.parsePackageJson(packageJsonPath);
            if (!rootPackage) {
                return null;
            }

            const type = this.detectMonorepoType(rootPackage);
            if (!type) {
                return null;
            }

            const workspacePatterns = this.getWorkspacePatterns(rootPackage, type);
            const packages = this.discoverPackages(workspacePatterns);
            const packageManager = this.detectPackageManager();

            return {
                type,
                rootPackage,
                packages,
                workspacePatterns,
                packageManager,
            };
        } catch (error) {
            console.error('Error detecting monorepo:', error);
            return null;
        }
    }

    private parsePackageJson(filePath: string): PackageInfo | null {
        try {
            const content = readFileSync(filePath, 'utf-8');
            const pkg = JSON.parse(content);

            return {
                name: pkg.name || 'unknown',
                version: pkg.version || '0.0.0',
                path: filePath,
                dependencies: pkg.dependencies,
                devDependencies: pkg.devDependencies,
                peerDependencies: pkg.peerDependencies,
                workspaces: pkg.workspaces,
                private: pkg.private,
            };
        } catch (error) {
            console.error(`Error parsing package.json at ${filePath}:`, error);
            return null;
        }
    }

    private detectMonorepoType(rootPackage: PackageInfo): 'npm' | 'yarn' | 'pnpm' | 'lerna' | null {
        // Check for Lerna
        if (existsSync(join(this.rootPath, 'lerna.json'))) {
            return 'lerna';
        }

        // Check for pnpm
        if (existsSync(join(this.rootPath, 'pnpm-workspace.yaml'))) {
            return 'pnpm';
        }

        // Check for Yarn workspaces
        if (rootPackage.workspaces && Array.isArray(rootPackage.workspaces)) {
            return 'yarn';
        }

        // Check for npm workspaces (npm 7+)
        if (rootPackage.workspaces && Array.isArray(rootPackage.workspaces)) {
            return 'npm';
        }

        // Check for Lerna in dependencies
        if (rootPackage.dependencies?.lerna || rootPackage.devDependencies?.lerna) {
            return 'lerna';
        }

        return null;
    }

    private getWorkspacePatterns(rootPackage: PackageInfo, type: string): string[] {
        if (type === 'lerna') {
            return this.getLernaWorkspacePatterns();
        }

        if (rootPackage.workspaces && Array.isArray(rootPackage.workspaces)) {
            return rootPackage.workspaces;
        }

        return [];
    }

    private getLernaWorkspacePatterns(): string[] {
        try {
            const lernaPath = join(this.rootPath, 'lerna.json');
            if (existsSync(lernaPath)) {
                const lernaConfig = JSON.parse(readFileSync(lernaPath, 'utf-8'));
                return lernaConfig.packages || ['packages/*'];
            }
        } catch (error) {
            console.error('Error reading lerna.json:', error);
        }
        return ['packages/*'];
    }

    private discoverPackages(workspacePatterns: string[]): PackageInfo[] {
        const packages: PackageInfo[] = [];

        for (const pattern of workspacePatterns) {
            const matches = this.globPattern(pattern);
            for (const match of matches) {
                const packageJsonPath = join(this.rootPath, match, 'package.json');
                if (existsSync(packageJsonPath)) {
                    const pkg = this.parsePackageJson(packageJsonPath);
                    if (pkg) {
                        packages.push(pkg);
                    }
                }
            }
        }

        return packages;
    }

    private globPattern(pattern: string): string[] {
        // Simple glob pattern matching for common cases
        if (pattern === 'packages/*') {
            return this.listDirectories('packages');
        }

        if (pattern === 'apps/*') {
            return this.listDirectories('apps');
        }

        if (pattern === 'libs/*') {
            return this.listDirectories('libs');
        }

        // Handle more complex patterns
        if (pattern.includes('*')) {
            const [baseDir, wildcard] = pattern.split('*');
            if (baseDir && wildcard) {
                return this.listDirectories(baseDir)
                    .filter(dir => dir.endsWith(wildcard))
                    .map(dir => baseDir + dir);
            }
        }

        return [];
    }

    private listDirectories(dirName: string): string[] {
        try {
            const dirPath = join(this.rootPath, dirName);
            if (!existsSync(dirPath)) {
                return [];
            }

            // This is a simplified version - in a real implementation,
            // you'd use fs.readdirSync or similar
            return [];
        } catch (error) {
            console.error(`Error listing directory ${dirName}:`, error);
            return [];
        }
    }

    private detectPackageManager(): string {
        if (existsSync(join(this.rootPath, 'pnpm-lock.yaml'))) {
            return 'pnpm';
        }

        if (existsSync(join(this.rootPath, 'yarn.lock'))) {
            return 'yarn';
        }

        if (existsSync(join(this.rootPath, 'package-lock.json'))) {
            return 'npm';
        }

        return 'unknown';
    }

    getDependencyGraph(): Map<string, Set<string>> {
        const graph = new Map<string, Set<string>>();
        const config = this.detect();

        if (!config) {
            return graph;
        }

        // Add root package
        graph.set(config.rootPackage.name, new Set());

        // Add all packages
        for (const pkg of config.packages) {
            graph.set(pkg.name, new Set());
        }

        // Build dependency edges
        for (const pkg of [config.rootPackage, ...config.packages]) {
            if (pkg.dependencies) {
                for (const [depName, depVersion] of Object.entries(pkg.dependencies)) {
                    if (graph.has(depName)) {
                        // Internal dependency
                        graph.get(pkg.name)?.add(depName);
                    }
                }
            }
        }

        return graph;
    }

    getExternalDependencies(): Set<string> {
        const external = new Set<string>();
        const config = this.detect();

        if (!config) {
            return external;
        }

        const allPackages = [config.rootPackage, ...config.packages];
        const internalNames = new Set(allPackages.map(p => p.name));

        for (const pkg of allPackages) {
            if (pkg.dependencies) {
                for (const depName of Object.keys(pkg.dependencies)) {
                    if (!internalNames.has(depName)) {
                        external.add(depName);
                    }
                }
            }
        }

        return external;
    }
}
