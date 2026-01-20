"use client";

import { useState, useEffect } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { ArrowLeft, Users, DollarSign, TrendingUp, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/reports/date-range-picker";
import { ExportButton } from "@/components/reports/export-button";
import { getEmployeePaymentReport } from "@/actions/reports";
import { format } from "date-fns";

export default function EmployeePaymentReportPage() {
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
            const data = await getEmployeePaymentReport(dateRange.from, dateRange.to);
            setReportData(data);
        } catch (error) {
            console.error("Error loading report:", error);
        } finally {
            setLoading(false);
        }
    };

    const getEmployeeTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            EMPLOYEE: "default",
            CONTRACTOR: "secondary",
            VENDOR: "outline",
            FREELANCER: "destructive",
        };
        return colors[type] || "default";
    };

    const exportData = reportData?.employees.map((emp: any) => ({
        Name: emp.name,
        Email: emp.email || "N/A",
        Role: emp.role || "N/A",
        Department: emp.department || "N/A",
        Type: emp.employeeType,
        "Total Paid": emp.totalPaid,
        "Payment Count": emp.paymentCount,
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
                            Employee Payment Report
                        </h1>
                    </div>
                    <p className="text-muted-foreground">
                        Detailed payment summaries for each employee
                    </p>
                </div>
                <ExportButton data={exportData} filename="employee-payments" />
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
                            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${reportData.grandTotal.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Employees
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {reportData.employees.length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Employees Paid
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {reportData.employees.filter((e: any) => e.paymentCount > 0).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Employee Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Employee Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-48 items-center justify-center">
                            <div className="text-muted-foreground">Loading report...</div>
                        </div>
                    ) : reportData?.employees.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center gap-2">
                            <FileText className="h-12 w-12 text-muted-foreground" />
                            <p className="text-muted-foreground">No employees found</p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Payments</TableHead>
                                        <TableHead className="text-right">Total Paid</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {reportData?.employees.map((employee: any) => (
                                        <TableRow
                                            key={employee.id}
                                            className="hover:bg-muted/50 transition-colors"
                                        >
                                            <TableCell className="font-medium">
                                                {employee.name}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {employee.email || "—"}
                                            </TableCell>
                                            <TableCell>{employee.role || "—"}</TableCell>
                                            <TableCell>{employee.department || "—"}</TableCell>
                                            <TableCell>
                                                <Badge variant={getEmployeeTypeColor(employee.employeeType) as any}>
                                                    {employee.employeeType}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {employee.paymentCount}
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold">
                                                ${employee.totalPaid.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
