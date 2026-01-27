
import { auth } from "@/lib/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DebugPage() {
  const session = await auth()

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Debug Info</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Session Details</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Build Info</CardTitle>
        </CardHeader>
        <CardContent>
            <p>Version: 1.0.1 (Build Fixes Applied)</p>
            <p>Environment: {process.env.NODE_ENV}</p>
        </CardContent>
      </Card>
    </div>
  )
}
