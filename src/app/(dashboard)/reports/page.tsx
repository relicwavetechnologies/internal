import { Suspense } from "react";
import Link from "next/link";
import { FileText, Users, PieChart, Repeat } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const reportCards = [
    {
        title: "Employee Payment Report",
        description: "View detailed payment summaries for each employee",
        icon: Users,
        href: "/reports/employee-payments",
        color: "oklch(0.69 0.19 240)",
    },
    {
        title: "Category Breakdown",
        description: "Analyze income and expenses by category",
        icon: PieChart,
        href: "/reports/category-breakdown",
        color: "oklch(0.67 0.21 300)",
    },
    {
        title: "Recurring Transactions",
        description: "Manage and view all recurring transactions",
        icon: Repeat,
        href: "/recurring-transactions",
        color: "oklch(0.72 0.19 142)",
    },
];

export default function ReportsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">
                    Generate and export comprehensive financial reports
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {reportCards.map((report) => {
                    const Icon = report.icon;
                    return (
                        <Link key={report.href} href={report.href}>
                            <Card className="group transition-all duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50">
                                <CardHeader>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="rounded-lg p-2"
                                            style={{
                                                backgroundColor: `${report.color}15`,
                                            }}
                                        >
                                            <Icon
                                                className="h-6 w-6"
                                                style={{
                                                    color: report.color,
                                                }}
                                            />
                                        </div>
                                        <CardTitle className="text-xl">{report.title}</CardTitle>
                                    </div>
                                    <CardDescription className="pt-2">
                                        {report.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        variant="ghost"
                                        className="w-full group-hover:bg-primary/10"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        View Report
                                    </Button>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Report Features</CardTitle>
                    <CardDescription>
                        All reports include the following capabilities
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <span className="text-sm">
                                <strong>Date Range Selection:</strong> Filter data by custom date ranges or use presets (This Month, Last Quarter, etc.)
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <span className="text-sm">
                                <strong>Export Capabilities:</strong> Download reports as CSV or JSON for further analysis
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <span className="text-sm">
                                <strong>Visual Analytics:</strong> Interactive charts and graphs for better insights
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                            <span className="text-sm">
                                <strong>Real-time Data:</strong> All reports pull the latest data from your transactions
                            </span>
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
