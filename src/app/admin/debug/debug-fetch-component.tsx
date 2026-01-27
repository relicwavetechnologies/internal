'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { debugFetchProject } from "@/actions/debug-actions"

export function DebugFetchComponent({ projectId }: { projectId: string }) {
    const [result, setResult] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    const runDebug = async () => {
        setLoading(true)
        try {
            const data = await debugFetchProject(projectId)
            setResult(data)
        } catch (e) {
            setResult(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Test Project Fetch: {projectId}</CardTitle>
            </CardHeader>
            <CardContent>
                <Button onClick={runDebug} disabled={loading}>
                    {loading ? "Running..." : "Run Server Action Fetch"}
                </Button>
                {result && (
                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Result:</h4>
                        <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-auto text-xs h-64">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
