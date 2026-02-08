import { ClientLayoutWrapper } from '@/components/layouts/client-layout-wrapper'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProjectStatusBadge } from '@/components/projects/project-status-badge'

export default async function ClientDashboardPage() {
    const session = await auth()

    if (!session || session.user.userType !== 'CLIENT') {
        redirect('/client/login')
    }

    // Get client's projects
    const client = await db.client.findUnique({
        where: { id: session.user.id },
        include: {
            projects: {
                include: {
                    tasks: true,
                    documents: true,
                },
            },
        },
    })

    if (!client) {
        redirect('/client/login')
    }

    return (
        <ClientLayoutWrapper>
            <div className="space-y-8">
                <div className="border-b pb-6">
                    <h1 className="text-4xl font-bold tracking-tight">Welcome back, {client.name}! 👋</h1>
                    <p className="text-muted-foreground mt-2 text-lg">Track progress, view documents, and collaborate on your projects</p>
                </div>

                {client.projects.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-20 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a 2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                            <p className="text-muted-foreground max-w-md mx-auto">
                                Your projects will appear here once they're assigned by your team. Check back soon!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">Your Projects ({client.projects.length})</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {client.projects.map((project) => {
                                const completedTasks = project.tasks.filter(t => t.status === 'COMPLETED').length
                                const totalTasks = project.tasks.length
                                const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

                                return (
                                    <Link key={project.id} href={`/client/${project.id}`}>
                                        <Card className="hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer border-2 hover:border-primary/50 h-full">
                                            <CardHeader className="space-y-3">
                                                <div className="flex items-start justify-between gap-2">
                                                    <CardTitle className="text-xl line-clamp-2">{project.name}</CardTitle>
                                                    <ProjectStatusBadge status={project.status} />
                                                </div>
                                                {project.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                                        {project.description}
                                                    </p>
                                                )}
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                {/* Progress Bar */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="text-muted-foreground">Progress</span>
                                                        <span className="font-medium">{progress}%</span>
                                                    </div>
                                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all duration-500"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Stats Grid */}
                                                <div className="grid grid-cols-2 gap-4 pt-2">
                                                    <div className="space-y-1">
                                                        <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
                                                        <div className="text-xs text-muted-foreground">Tasks Done</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-2xl font-bold">{project.documents.length}</div>
                                                        <div className="text-xs text-muted-foreground">Documents</div>
                                                    </div>
                                                </div>

                                                {/* View Project Button */}
                                                <div className="pt-2">
                                                    <div className="text-sm font-medium text-primary flex items-center gap-1">
                                                        View Project
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>
        </ClientLayoutWrapper>
    )
}
