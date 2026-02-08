import { ClientLayoutWrapper } from '@/components/layouts/client-layout-wrapper'
import { auth } from '@/lib/auth'
import { getProjectById } from '@/actions/projects'
import { redirect, notFound } from 'next/navigation'
import { DocumentsTab } from '@/components/projects/documents-tab'
import { ProgressTab } from '@/components/projects/progress-tab'
import { FinancesTab } from '@/components/projects/finances-tab'
import { CommentsTab } from '@/components/projects/comments-tab'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { FileText, BarChart3, DollarSign, MessageSquare, TrendingUp, Workflow } from 'lucide-react'
import { ProjectStatusBadge } from '@/components/projects/project-status-badge'
import { db } from '@/lib/db'

export default async function ClientProjectPage({
    params,
    searchParams,
}: {
    params: Promise<{ projectId: string }>
    searchParams: Promise<{ tab?: string }>
}) {
    const { projectId } = await params
    const { tab } = await searchParams
    const session = await auth()

    if (!session || session.user.userType !== 'CLIENT') {
        redirect('/client/login')
    }

    const project = await getProjectById(projectId)

    if (!project || project.clientId !== session.user.id) {
        notFound()
    }

    // Get finances
    const tagIncomes = project.tag ? await db.income.findMany({
        where: { tags: { some: { tagId: project.tag.id } } },
        orderBy: { date: 'desc' },
    }) : []

    const tagExpenditures = project.tag ? await db.expenditure.findMany({
        where: { tags: { some: { tagId: project.tag.id } } },
        include: { employee: true },
        orderBy: { date: 'desc' },
    }) : []

    return (
        <ClientLayoutWrapper>
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold">{project.name}</h1>
                        <ProjectStatusBadge status={project.status} />
                    </div>
                    {project.description && (
                        <p className="text-muted-foreground">{project.description}</p>
                    )}
                </div>

                <Tabs defaultValue={tab || "progress"} className="w-full">
                    <TabsList className="grid w-full grid-cols-5 h-auto">
                        <TabsTrigger value="overview" className="flex-col h-16 gap-1">
                            <TrendingUp className="h-5 w-5" />
                            <span className="text-xs">Overview</span>
                        </TabsTrigger>
                        <TabsTrigger value="progress" className="flex-col h-16 gap-1 relative">
                            <Workflow className="h-5 w-5" />
                            <span className="text-xs">Pipeline</span>
                            <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full animate-pulse"></span>
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex-col h-16 gap-1">
                            <FileText className="h-5 w-5" />
                            <span className="text-xs">Documents</span>
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="flex-col h-16 gap-1">
                            <DollarSign className="h-5 w-5" />
                            <span className="text-xs">Payments</span>
                        </TabsTrigger>
                        <TabsTrigger value="comments" className="flex-col h-16 gap-1">
                            <MessageSquare className="h-5 w-5" />
                            <span className="text-xs">Comments</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Card className="p-4">
                                <div className="text-sm font-medium text-muted-foreground">Total Tasks</div>
                                <div className="text-2xl font-bold">{project.tasks?.length || 0}</div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-sm font-medium text-muted-foreground">Documents</div>
                                <div className="text-2xl font-bold">{project.documents?.length || 0}</div>
                            </Card>
                            <Card className="p-4">
                                <div className="text-sm font-medium text-muted-foreground">Team Size</div>
                                <div className="text-2xl font-bold">{project.projectEmployees?.length || 0}</div>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-6">
                        <DocumentsTab
                            projectId={projectId}
                            documents={project.documents || []}
                            userId={session.user.id}
                        />
                    </TabsContent>

                    <TabsContent value="progress" className="mt-6">
                        <ProgressTab
                            dailyLogs={project.dailyLogs || []}
                            modules={project.modules || []}
                        />
                    </TabsContent>

                    <TabsContent value="payments" className="mt-6">
                        <FinancesTab
                            tag={project.tag}
                            incomes={tagIncomes}
                            expenditures={[]}
                            accounts={[]}
                            tags={[]}
                            employees={[]}
                            categories={[]}
                        />
                    </TabsContent>

                    <TabsContent value="comments" className="mt-6">
                        <CommentsTab
                            projectId={projectId}
                            comments={project.comments || []}
                            userId={session.user.id}
                            userType="CLIENT"
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </ClientLayoutWrapper>
    )
}
