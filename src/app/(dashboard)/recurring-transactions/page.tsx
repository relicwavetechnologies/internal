"use client";

import { useState, useEffect } from "react";
import { Plus, Play, Pause, Edit, Trash2, RefreshCw, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RecurringTransactionForm } from "@/components/recurring-transactions/recurring-transaction-form";
import {
    getRecurringTransactions,
    deleteRecurringTransaction,
    toggleRecurringTransaction,
    processRecurringTransactions,
} from "@/actions/recurring-transactions";
import { EmptyState } from "@/components/ui/empty-state";

// Fetch accounts, employees, and categories
import { getAccounts } from "@/actions/accounts";
import { getEmployees } from "@/actions/employees";
import { getCategories } from "@/actions/categories";

export default function RecurringTransactionsPage() {
    const [transactions, setTransactions] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<any>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [txs, accs, emps, cats] = await Promise.all([
                getRecurringTransactions(),
                getAccounts(),
                getEmployees(),
                getCategories(),
            ]);
            setTransactions(txs);
            setAccounts(accs);
            setEmployees(emps);
            setCategories(cats);
        } catch (error) {
            console.error("Error loading data:", error);
            toast.error("Failed to load recurring transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingTransaction(null);
        setFormOpen(true);
    };

    const handleEdit = (transaction: any) => {
        setEditingTransaction(transaction);
        setFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteRecurringTransaction(id);
            toast.success("Recurring transaction deleted");
            loadData();
            setDeletingId(null);
        } catch (error: any) {
            toast.error(error.message || "Failed to delete recurring transaction");
        }
    };

    const handleToggle = async (id: string) => {
        try {
            await toggleRecurringTransaction(id);
            toast.success("Recurring transaction updated");
            loadData();
        } catch (error: any) {
            toast.error(error.message || "Failed to update recurring transaction");
        }
    };

    const handleProcess = async () => {
        setProcessing(true);
        try {
            const result = await processRecurringTransactions();
            if (result.processed > 0) {
                toast.success(`Processed ${result.processed} recurring transaction(s)`);
                loadData();
            } else {
                toast.info("No recurring transactions are due at this time");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to process recurring transactions");
        } finally {
            setProcessing(false);
        }
    };

    const getFrequencyBadge = (frequency: string) => {
        const colors: Record<string, string> = {
            DAILY: "destructive",
            WEEKLY: "default",
            BIWEEKLY: "secondary",
            MONTHLY: "outline",
            QUARTERLY: "default",
            YEARLY: "secondary",
        };
        return colors[frequency] || "default";
    };

    const formatFrequency = (frequency: string) => {
        return frequency.charAt(0) + frequency.slice(1).toLowerCase();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Recurring Transactions
                    </h1>
                    <p className="text-muted-foreground">
                        Manage automated recurring income and expenses
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleProcess}
                        disabled={processing || loading}
                    >
                        <RefreshCw className={`mr-2 h-4 w-4 ${processing ? "animate-spin" : ""}`} />
                        Process Due
                    </Button>
                    <Button onClick={handleCreate} disabled={loading}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Recurring Transaction
                    </Button>
                </div>
            </div>

            {/* Stats */}
            {!loading && transactions.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Active</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {transactions.filter((t) => t.isActive).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
                            <div className="h-4 w-4 rounded-full bg-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                $
                                {transactions
                                    .filter((t) => t.isActive && t.type === "INCOME" && t.frequency === "MONTHLY")
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
                            <div className="h-4 w-4 rounded-full bg-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                $
                                {transactions
                                    .filter((t) => t.isActive && t.type === "EXPENSE" && t.frequency === "MONTHLY")
                                    .reduce((sum, t) => sum + t.amount, 0)
                                    .toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
                            <Play className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {
                                    transactions.filter(
                                        (t) =>
                                            t.isActive &&
                                            new Date(t.nextRun) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                    ).length
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">Next 7 days</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Transactions Table */}
            <Card>
                <CardHeader>
                    <CardTitle>All Recurring Transactions</CardTitle>
                    <CardDescription>
                        View and manage your automated transactions
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex h-48 items-center justify-center">
                            <div className="text-muted-foreground">Loading...</div>
                        </div>
                    ) : transactions.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No recurring transactions"
                            description="Create your first recurring transaction to automate your finances"
                        />
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Frequency</TableHead>
                                        <TableHead>Next Run</TableHead>
                                        <TableHead>Account</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((transaction) => (
                                        <TableRow
                                            key={transaction.id}
                                            className={`hover:bg-muted/50 transition-colors ${!transaction.isActive ? "opacity-60" : ""
                                                }`}
                                        >
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleToggle(transaction.id)}
                                                    title={transaction.isActive ? "Pause" : "Resume"}
                                                >
                                                    {transaction.isActive ? (
                                                        <Play className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <Pause className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {transaction.name}
                                                {transaction.employee && (
                                                    <div className="text-xs text-muted-foreground">
                                                        → {transaction.employee.name}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={transaction.type === "INCOME" ? "default" : "destructive"}
                                                >
                                                    {transaction.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono font-semibold">
                                                ${transaction.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={getFrequencyBadge(transaction.frequency) as any}>
                                                    {formatFrequency(transaction.frequency)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{format(new Date(transaction.nextRun), "MMM dd, yyyy")}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(transaction.nextRun), "h:mm a")}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{transaction.account.name}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(transaction)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setDeletingId(transaction.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Form Dialog */}
            <RecurringTransactionForm
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) {
                        loadData();
                    }
                }}
                accounts={accounts}
                employees={employees}
                categories={categories}
                transaction={editingTransaction}
            />

            {/* Delete Confirmation */}
            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this recurring transaction. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletingId && handleDelete(deletingId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
