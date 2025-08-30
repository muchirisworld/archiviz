'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type SupportedLanguage = 'typescript' | 'javascript' | 'python' | 'java' | 'go' | 'rust';

const sampleCode: Record<SupportedLanguage, string> = {
    typescript: `interface Person {
  name: string;
  age: number;
}

class Employee implements Person {
  constructor(
    public name: string,
    public age: number,
    private salary: number
  ) {}

  getInfo(): string {
    return \`\${this.name} (\${this.age})\`;
  }
}

function calculateBonus(employee: Employee): number {
  return employee.salary * 0.1;
}

export { Person, Employee, calculateBonus };`,

    javascript: `class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  getInfo() {
    return \`\${this.name} (\${this.age})\`;
  }
}

class Employee extends Person {
  constructor(name, age, salary) {
    super(name, age);
    this.salary = salary;
  }

  calculateBonus() {
    return this.salary * 0.1;
  }
}

function calculateBonus(employee) {
  return employee.salary * 0.1;
}

export { Person, Employee, calculateBonus };`,

    python: `class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age
    
    def get_info(self) -> str:
        return f"{self.name} ({self.age})"

class Employee(Person):
    def __init__(self, name: str, age: int, salary: float):
        super().__init__(name, age)
        self.salary = salary
    
    def calculate_bonus(self) -> float:
        return self.salary * 0.1

def main():
    emp = Employee("John", 30, 50000)
    print(emp.get_info())
    print(f"Bonus: {emp.calculate_bonus()}")

if __name__ == "__main__":
    main()`,

    java: `public class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String getInfo() {
        return name + " (" + age + ")";
    }
}

public class Employee extends Person {
    private double salary;
    
    public Employee(String name, int age, double salary) {
        super(name, age);
        this.salary = salary;
    }
    
    public double calculateBonus() {
        return salary * 0.1;
    }
}

public class Main {
    public static void main(String[] args) {
        Employee emp = new Employee("John", 30, 50000.0);
        System.out.println(emp.getInfo());
        System.out.println("Bonus: " + emp.calculateBonus());
    }
}`,

    go: `package main

import "fmt"

type Person struct {
    Name string
    Age  int
}

func (p Person) GetInfo() string {
    return fmt.Sprintf("%s (%d)", p.Name, p.Age)
}

type Employee struct {
    Person
    Salary float64
}

func (e Employee) CalculateBonus() float64 {
    return e.Salary * 0.1
}

func main() {
    emp := Employee{
        Person: Person{Name: "John", Age: 30},
        Salary: 50000.0,
    }
    
    fmt.Println(emp.GetInfo())
    fmt.Printf("Bonus: %.2f\\n", emp.CalculateBonus())
}`,

    rust: `pub struct Person {
    pub name: String,
    pub age: u32,
}

impl Person {
    pub fn new(name: String, age: u32) -> Self {
        Person { name, age }
    }
    
    pub fn get_info(&self) -> String {
        format!("{} ({})", self.name, self.age)
    }
}

pub struct Employee {
    pub person: Person,
    pub salary: f64,
}

impl Employee {
    pub fn new(name: String, age: u32, salary: f64) -> Self {
        Employee {
            person: Person::new(name, age),
            salary,
        }
    }
    
    pub fn calculate_bonus(&self) -> f64 {
        self.salary * 0.1
    }
}

fn main() {
    let emp = Employee::new("John".to_string(), 30, 50000.0);
    println!("{}", emp.person.get_info());
    println!("Bonus: {:.2}", emp.calculate_bonus());
}`,
};

export default function EnhancedTestPage() {
    const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('typescript');
    const [code, setCode] = useState(sampleCode.typescript);
    const [parseResult, setParseResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('parsing');

    const handleLanguageChange = (language: SupportedLanguage) => {
        setSelectedLanguage(language);
        setCode(sampleCode[language]);
        setParseResult(null);
    };

    const testEnhancedParsing = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/parse-enhanced', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code,
                    language: selectedLanguage,
                    filePath: `test.${getFileExtension(selectedLanguage)}`
                }),
            });

            const result = await response.json();
            setParseResult(result);
        } catch (error) {
            console.error('Error testing enhanced parsing:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getFileExtension = (language: SupportedLanguage): string => {
        const extensions = {
            typescript: 'ts',
            javascript: 'js',
            python: 'py',
            java: 'java',
            go: 'go',
            rust: 'rs',
        };
        return extensions[language];
    };

    const getLanguageColor = (language: SupportedLanguage): string => {
        const colors = {
            typescript: 'bg-blue-500',
            javascript: 'bg-yellow-500',
            python: 'bg-green-500',
            java: 'bg-orange-500',
            go: 'bg-cyan-500',
            rust: 'bg-red-500',
        };
        return colors[language];
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">Enhanced Multi-Language Parser Test</h1>
                <p className="text-muted-foreground">
                    Test multi-language parsing, monorepo detection, and graph generation
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Input Code</CardTitle>
                        <CardDescription>
                            Select language and enter code to test parsing
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Select value={selectedLanguage} onValueChange={(value: SupportedLanguage) => handleLanguageChange(value)}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="typescript">TypeScript</SelectItem>
                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                    <SelectItem value="python">Python</SelectItem>
                                    <SelectItem value="java">Java</SelectItem>
                                    <SelectItem value="go">Go</SelectItem>
                                    <SelectItem value="rust">Rust</SelectItem>
                                </SelectContent>
                            </Select>
                            <Badge className={getLanguageColor(selectedLanguage)}>
                                {selectedLanguage.toUpperCase()}
                            </Badge>
                        </div>

                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter your code here..."
                            className="min-h-[400px] font-mono text-sm"
                        />

                        <Button onClick={testEnhancedParsing} disabled={isLoading} className="w-full">
                            {isLoading ? 'Parsing...' : 'Test Enhanced Parsing'}
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Results</CardTitle>
                        <CardDescription>
                            Parsing results, graph data, and metrics
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {parseResult ? (
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="parsing">Parsing</TabsTrigger>
                                    <TabsTrigger value="graph">Graph</TabsTrigger>
                                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                                    <TabsTrigger value="raw">Raw</TabsTrigger>
                                </TabsList>

                                <TabsContent value="parsing" className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            Symbols ({parseResult.data.parseResult.symbols.length})
                                        </h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {parseResult.data.parseResult.symbols.map((symbol: any, index: number) => (
                                                <div key={index} className="p-2 border rounded text-sm">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="secondary">{symbol.type}</Badge>
                                                        <span className="font-mono font-semibold">{symbol.name}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Lines {symbol.startLine}-{symbol.endLine}
                                                    </div>
                                                    {symbol.signature && (
                                                        <div className="text-xs font-mono">{symbol.signature}</div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            Dependencies ({parseResult.data.parseResult.dependencies.length})
                                        </h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {parseResult.data.parseResult.dependencies.map((dep: any, index: number) => (
                                                <div key={index} className="p-2 border rounded text-sm">
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
                                </TabsContent>

                                <TabsContent value="graph" className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            Graph Nodes ({parseResult.data.graph.nodes.length})
                                        </h4>
                                        <div className="text-sm space-y-1">
                                            <div>Repository: {parseResult.data.graph.nodes.find((n: any) => n[1].type === 'repository')?.[1].name}</div>
                                            <div>Package: {parseResult.data.graph.nodes.find((n: any) => n[1].type === 'package')?.[1].name}</div>
                                            <div>File: {parseResult.data.graph.nodes.find((n: any) => n[1].type === 'file')?.[1].name}</div>
                                            <div>Symbols: {parseResult.data.graph.nodes.filter((n: any) => !['repository', 'package', 'file'].includes(n[1].type)).length}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2">
                                            Graph Edges ({parseResult.data.graph.edges.length})
                                        </h4>
                                        <div className="text-sm">
                                            <div>Total connections: {parseResult.data.graph.edges.length}</div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="metrics" className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold mb-2">Complexity Metrics</h4>
                                        <div className="text-sm space-y-1">
                                            {parseResult.data.metrics.complexity.slice(0, 5).map(([id, value]: [string, number]) => (
                                                <div key={id} className="flex justify-between">
                                                    <span className="truncate">{id}</span>
                                                    <span className="font-mono">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="raw">
                                    <div className="text-xs bg-muted p-2 rounded max-h-60 overflow-y-auto">
                                        <pre>{JSON.stringify(parseResult, null, 2)}</pre>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                Click "Test Enhanced Parsing" to see results
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
