import { getProjectById } from "@/actions/projects"
import { ProjectStatusBadge } from "@/components/projects/project-status-badge"
import { ProjectDialog } from "@/components/projects/project-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Calendar, Edit, ArrowRight, CheckCircle2, DollarSign, Users, FileText } from "lucide-react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { TaskDistributionChart } from "@/components/projects/charts/task-distribution"
import { FinancialBarChart } from "@/components/projects/charts/financial-bar-chart"

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let project = null
  let loadError = null

  try {
     project = await getProjectById(id)
  } catch (err: any) {
     loadError = err.message || "Unknown error occurred during fetch"
  }

  if (!project) {
     return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold text-red-600">Project Not Found (Debug Mode)</h1>
            <p>ID Attempted: <span className="font-mono bg-muted px-2 py-1 rounded">{id}</span></p>
            {loadError && (
                <div className="bg-red-50 border border-red-200 p-4 rounded text-red-800">
                    <h3 className="font-bold">Error Details:</h3>
                    <pre className="text-xs mt-2 overflow-auto">{loadError}</pre>
                </div>
            )}
            <div className="bg-muted p-4 rounded">
                <h3 className="font-bold">Troubleshooting:</h3>
                <ul className="list-disc pl-5 text-sm space-y-1 mt-2">
                    <li>Verify the ID exists in the database.</li>
                    <li>Check if your user belongs to the company owning this project.</li>
                    <li>If you see this page, the routing IS working, but the data fetch returned null.</li>
                </ul>
            </div>
            <Link href="/admin/projects">
                <Button variant="outline">Back to Projects</Button>
            </Link>
        </div>
     )
  }

  // --- Data Aggregation ---
  const totalTasks = project.tasks?.length || 0
  const completedTasks = project.tasks?.filter(t => t.status === 'COMPLETED').length || 0
  const inProgressTasks = project.tasks?.filter(t => t.status === 'IN_PROGRESS').length || 0
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalIncome = project.tag?.incomes.reduce((acc, curr) => acc + curr.income.amount, 0) || 0
  const totalExpense = project.tag?.expenditures.reduce((acc, curr) => acc + curr.expenditure.amount, 0) || 0
  const netProfit = totalIncome - totalExpense

  const taskDistribution = [
    { name: 'Done', value: completedTasks, fill: '#22c55e' }, // green-500
    { name: 'In Progress', value: inProgressTasks, fill: '#3b82f6' }, // blue-500
    { name: 'To Do', value: totalTasks - completedTasks - inProgressTasks, fill: '#94a3b8' }, // slate-400
  ]

  const financeData = [
    { name: 'Income', amount: totalIncome, fill: '#22c55e' },
    { name: 'Expenses', amount: totalExpense, fill: '#ef4444' },
  ]

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-muted-foreground">{project.description || "No description provided."}</p>
        </div>
        <div className="flex gap-2">
            <ProjectDialog project={project} trigger={
            <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit
            </Button>
            } />
            {project.hasUpworkTimesheet && (
                <Button variant="ghost" asChild>
                <a href={project.upworkContractUrl || '#'} target="_blank" rel="noopener noreferrer">
                    Upwork ↗
                </a>
                </Button>
            )}
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{completionRate}%</div>
                <p className="text-xs text-muted-foreground">{completedTasks} of {totalTasks} tasks done</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Financials</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${netProfit.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">Income - Expenses</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{project.projectEmployees?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Docs & Files</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{project.documents?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Attached resources</p>
            </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Task Analytics */}
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Task Overview</CardTitle>
                    <CardDescription>Distribution by status</CardDescription>
                </div>
                <Link href={`/admin/projects/${project.id}/tasks`}>
                    <Button size="sm" variant="outline">
                        Manage Tasks <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
               {totalTasks > 0 ? (
                 <TaskDistributionChart data={taskDistribution} />
               ) : (
                 <div className="text-center text-muted-foreground">No tasks created yet</div>
               )}
            </CardContent>
        </Card>

        {/* Financial Analytics */}
        <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                     <CardTitle>Financial Overview</CardTitle>
                     <CardDescription>Income vs Expenses</CardDescription>
                </div>
                <Link href={`/admin/projects/${project.id}/finances`}>
                    <Button size="sm" variant="outline">
                        View Finances <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
                <FinancialBarChart data={financeData} />
            </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="col-span-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                 <Link href={`/admin/projects/${project.id}/progress`}>
                    <Button size="sm" variant="outline">
                        View Timeline <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {project.dailyLogs?.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex gap-4 items-start">
                            <div className="h-2 w-2 mt-2 rounded-full bg-primary shrink-0" />
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{log.description}</p>
                                <p className="text-xs text-muted-foreground">
                                    {new Date(log.date).toLocaleDateString()} • {log.employee.name}
                                </p>
                            </div>
                        </div>
                    ))}
                    {!project.dailyLogs?.length && (
                        <p className="text-muted-foreground text-sm">No recent activity found.</p>
                    )}
                </div>
            </CardContent>
        </Card>

        {/* Team & Details */}
        <Card className="col-span-1 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Team & Details</CardTitle>
                 <Link href={`/admin/projects/${project.id}/team`}>
                    <Button size="sm" variant="outline">
                        Manage Team <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <h4 className="text-sm font-semibold mb-3">Project Team</h4>
                    <div className="flex flex-wrap gap-2">
                        {project.projectEmployees?.slice(0, 6).map((pe) => (
                            <div key={pe.id} className="flex items-center gap-2 bg-secondary/50 px-2 py-1 rounded-full border">
                                <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                    {pe.employee.name[0]}
                                </div>
                                <span className="text-xs font-medium pr-1">{pe.employee.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                        <span className="text-xs text-muted-foreground">Start Date</span>
                        <div className="flex items-center gap-2 mt-1">
                             <Calendar className="h-4 w-4 text-muted-foreground" />
                             <span className="text-sm font-medium">
                                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                             </span>
                        </div>
                    </div>
                    <div>
                        <span className="text-xs text-muted-foreground">End Date</span>
                        <div className="flex items-center gap-2 mt-1">
                             <Calendar className="h-4 w-4 text-muted-foreground" />
                             <span className="text-sm font-medium">
                                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Not set'}
                             </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

      </div>
    </div>
  )
}

