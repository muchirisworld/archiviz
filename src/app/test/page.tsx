'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TestPage() {
  const [code, setCode] = useState(`function hello(name: string) {
  console.log("Hello, " + name);
  return "Hello, " + name;
}

class Greeter {
  constructor(private name: string) {}
  
  greet() {
    return hello(this.name);
  }
}

interface Person {
  name: string;
  age: number;
}

export { hello, Greeter, Person };`);

  const [parsedResult, setParsedResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testParsing = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language: 'typescript' }),
      });

      const result = await response.json();
      setParsedResult(result);
    } catch (error) {
      console.error('Error testing parsing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const result = await response.json();
      console.log('Health check result:', result);
      alert('Health check successful! Check console for details.');
    } catch (error) {
      console.error('Error testing health:', error);
      alert('Health check failed! Check console for details.');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Archiviz Test Page</h1>
        <p className="text-muted-foreground">
          Test tree-sitter parsing and API endpoints
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Input Code</CardTitle>
            <CardDescription>
              Enter TypeScript/JavaScript code to test parsing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter your code here..."
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex gap-2">
              <Button onClick={testParsing} disabled={isLoading}>
                {isLoading ? 'Parsing...' : 'Test Parsing'}
              </Button>
              <Button onClick={testHealth} variant="outline">
                Test Health
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parsing Results</CardTitle>
            <CardDescription>
              Symbols and dependencies extracted from the code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {parsedResult ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Symbols ({parsedResult.data.symbols.length})</h4>
                  <div className="space-y-2">
                    {parsedResult.data.symbols.map((symbol: any, index: number) => (
                      <div key={index} className="p-2 border rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{symbol.type}</Badge>
                      <span className="font-mono font-semibold">{symbol.name}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Lines {symbol.startLine}-{symbol.endLine}, Columns {symbol.startColumn}-{symbol.endColumn}
                    </div>
                    {symbol.signature && (
                      <div className="text-sm font-mono">{symbol.signature}</div>
                    )}
                  </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Dependencies ({parsedResult.data.dependencies.length})</h4>
                  <div className="space-y-2">
                    {parsedResult.data.dependencies.map((dep: any, index: number) => (
                      <div key={index} className="p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{dep.type}</Badge>
                          <span className="font-mono">{dep.sourceName}</span>
                          <span>→</span>
                          <span className="font-mono">{dep.targetName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Click "Test Parsing" to see results
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
