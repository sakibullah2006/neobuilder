
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, MessageSquare, Mic, Sparkles, Zap } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <div className="flex items-center space-x-2">
                    {/* Add date range picker or buttons here if needed */}
                </div>
            </div>
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Total Messages
                                </CardTitle>
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1,234</div>
                                <p className="text-xs text-muted-foreground">
                                    +20.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    AI Interactions
                                </CardTitle>
                                <Bot className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+573</div>
                                <p className="text-xs text-muted-foreground">
                                    +180.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Safe Mode</CardTitle>
                                <Zap className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Active</div>
                                <p className="text-xs text-muted-foreground">
                                    Security protocols enabled
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Voice Commands
                                </CardTitle>
                                <Mic className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+12</div>
                                <p className="text-xs text-muted-foreground">
                                    +5 since last hour
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    You made 265 interactions this month.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[200px] w-full rounded-md bg-muted/50 p-4 border border-dashed flex items-center justify-center text-muted-foreground">
                                    Activity Chart Placeholder
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="col-span-3">
                            <CardHeader>
                                <CardTitle>AI Suggestions</CardTitle>
                                <CardDescription>
                                    Recent recommendations from your assistant.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                                        <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Update Security Policy</p>
                                            <p className="text-xs text-muted-foreground">Review recent access logs for unusual activity.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                                        <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Optimize Database</p>
                                            <p className="text-xs text-muted-foreground">Suggested indexing for user queries.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/50">
                                        <Sparkles className="h-5 w-5 text-yellow-500 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">New Feature: Voice</p>
                                            <p className="text-xs text-muted-foreground">Try out the new voice command interactions.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {/* AI Playground Section Dummy */}
            <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                    <Bot className="h-6 w-6 text-primary" />
                    <h3 className="text-xl font-semibold">AI Playground</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Text Generation</CardTitle>
                            <CardDescription>Draft content with AI</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-32 rounded-md bg-background/50 border border-dashed flex items-center justify-center">
                                <span className="text-sm text-muted-foreground">Editor Interface</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Image Analysis</CardTitle>
                            <CardDescription>Extract insights from images</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-32 rounded-md bg-background/50 border border-dashed flex items-center justify-center">
                                <span className="text-sm text-muted-foreground">Upload Area</span>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                        <CardHeader>
                            <CardTitle className="text-lg">Code Assistant</CardTitle>
                            <CardDescription>Generate and debug code</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-32 rounded-md bg-background/50 border border-dashed flex items-center justify-center">
                                <span className="text-sm text-muted-foreground">Code Editor</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
