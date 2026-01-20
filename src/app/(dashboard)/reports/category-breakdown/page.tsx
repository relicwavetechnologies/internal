"use client";

import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { ArrowLeft, TrendingDown, TrendingUp, PieChart as PieChartIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { ExportButton } from "@/components/reports/export-button";
import { ReportChart } from "@/components/reports/report-chart";
import { getCategoryBreakdownReport } from "@/actions/reports";
import * as LucideIcons from "lucide-react";

export default function CategoryBreakdownReportPage() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
    });
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadReport();
    }, [dateRange]);

    const loadReport = async () => {
        if (!dateRange?.from || !dateRange?.to) return;

        setLoading(true);
        try {
            const data = await getCategoryBreakdownReport(dateRange.from, dateRange.to);
            setReportData(data);
        } catch (error) {
            console.error("Error loading report:", error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (iconName?: string) => {
        if (!iconName) return null;
        const Icon = (LucideIcons as any)[iconName];
        return Icon ? <Icon className="h-4 w-4" /> : null;
    };

    const exportExpenseData = reportData?.expenses.categories.map((cat: any) => ({
        Category: cat.name,
        Amount: cat.total,
        Transactions: cat.count,
        Percentage: ((cat.total / reportData.expenses.total) * 100).toFixed(2) + "%",
    })) || [];

    const exportIncomeData = reportData?.income.categories.map((cat: any) => ({
        Category: cat.name,
        Amount: cat.total,
        Transactions: cat.count,
        Percentage: ((cat.total / reportData.income.total) * 100).toFixed(2) + "%",
    })) || [];

    const expenseChartData = reportData?.expenses.categories.map((cat: any) => ({
        name: cat.name,
        value: cat.total,
        color: cat.color,
    })) || [];

    const incomeChartData = reportData?.income.categories.map((cat: any) => ({
        name: cat.name,
        value: cat.total,
        color: cat.color,
    })) || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Link href="/reports">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Category Breakdown Report
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Analyze income and expenses by category
                    </p>
                </div>
            </div>

            {/* Date Range Picker */}
            <Card>
                <CardHeader>
                    <CardTitle>Select Date Range</CardTitle>
                </CardHeader>
                <CardContent>
                    <DateRangePicker value={dateRange} onChange={setDateRange} />
                </CardContent>
            </Card>

            {/* Summary Cards */}
            {reportData && (
                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                            <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ${reportData.income.total.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {reportData.income.categories.length} categories
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Expenses
                            </CardTitle>
                            <TrendingDown className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                ${reportData.expenses.total.toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {reportData.expenses.categories.length} categories
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div
                                className={`text-2xl font-bold ${reportData.netIncome >= 0 ? "text-green-600" : "text-red-600"
                                    }`}
                            >
                                ${Math.abs(reportData.netIncome).toLocaleString()}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {reportData.netIncome >= 0 ? "Profit" : "Loss"}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {loading && (
                <div className="flex h-48 items-center justify-center">
                    <div className="text-muted-foreground">Loading report...</div>
                </div>
            )}

            {/* Charts */}
            {reportData && !loading && (
                <div className="grid gap-6 md:grid-cols-2">
                    <ReportChart title="Expense Breakdown" data={expenseChartData} />
                    <ReportChart title="Income Breakdown" data={incomeChartData} />
                </div>
            )}

            {/* Expense Categories Table */}
            {reportData && !loading && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Expense Categories</CardTitle>
                            <CardDescription>
                                Detailed breakdown of expenses by category
                            </CardDescription>
                        </div>
                        <ExportButton data={exportExpenseData} filename="expense-categories" />
                    </CardHeader>
                    <CardContent>
                        {reportData.expenses.categories.length === 0 ? (
                            <div className="flex h-32 items-center justify-center text-muted-foreground">
                                No expense data available
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Transactions</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Percentage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.expenses.categories.map((category: any) => {
                                            const percentage = (
                                                (category.total / reportData.expenses.total) *
                                                100
                                            ).toFixed(1);
                                            return (
                                                <TableRow
                                                    key={category.id}
                                                    className="hover:bg-muted/50 transition-colors"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {category.icon && (
                                                                <div
                                                                    className="rounded p-1"
                                                                    style={{
                                                                        backgroundColor: category.color
                                                                            ? `${category.color}15`
                                                                            : undefined,
                                                                        color: category.color || undefined,
                                                                    }}
                                                                >
                                                                    {getIcon(category.icon)}
                                                                </div>
                                                            )}
                                                            <span className="font-medium">{category.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {category.count}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-semibold">
                                                        ${category.total.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className="h-full bg-red-600"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {reportData.expenses.uncategorized.total > 0 && (
                                            <TableRow className="bg-muted/30">
                                                <TableCell className="font-medium text-muted-foreground">
                                                    Uncategorized
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {reportData.expenses.uncategorized.count}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ${reportData.expenses.uncategorized.total.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(
                                                        (reportData.expenses.uncategorized.total /
                                                            reportData.expenses.total) *
                                                        100
                                                    ).toFixed(1)}
                                                    %
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Income Categories Table */}
            {reportData && !loading && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Income Categories</CardTitle>
                            <CardDescription>
                                Detailed breakdown of income by category
                            </CardDescription>
                        </div>
                        <ExportButton data={exportIncomeData} filename="income-categories" />
                    </CardHeader>
                    <CardContent>
                        {reportData.income.categories.length === 0 ? (
                            <div className="flex h-32 items-center justify-center text-muted-foreground">
                                No income data available
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-right">Transactions</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead className="text-right">Percentage</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reportData.income.categories.map((category: any) => {
                                            const percentage = (
                                                (category.total / reportData.income.total) *
                                                100
                                            ).toFixed(1);
                                            return (
                                                <TableRow
                                                    key={category.id}
                                                    className="hover:bg-muted/50 transition-colors"
                                                >
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {category.icon && (
                                                                <div
                                                                    className="rounded p-1"
                                                                    style={{
                                                                        backgroundColor: category.color
                                                                            ? `${category.color}15`
                                                                            : undefined,
                                                                        color: category.color || undefined,
                                                                    }}
                                                                >
                                                                    {getIcon(category.icon)}
                                                                </div>
                                                            )}
                                                            <span className="font-medium">{category.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {category.count}
                                                    </TableCell>
                                                    <TableCell className="text-right font-mono font-semibold">
                                                        ${category.total.toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
                                                                <div
                                                                    className="h-full bg-green-600"
                                                                    style={{ width: `${percentage}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm font-medium">
                                                                {percentage}%
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                        {reportData.income.uncategorized.total > 0 && (
                                            <TableRow className="bg-muted/30">
                                                <TableCell className="font-medium text-muted-foreground">
                                                    Uncategorized
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {reportData.income.uncategorized.count}
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    ${reportData.income.uncategorized.total.toLocaleString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {(
                                                        (reportData.income.uncategorized.total /
                                                            reportData.income.total) *
                                                        100
                                                    ).toFixed(1)}
                                                    %
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
