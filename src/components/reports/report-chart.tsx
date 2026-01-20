"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReportChartProps {
    title: string;
    data: {
        name: string;
        value: number;
        color?: string;
    }[];
}

const DEFAULT_COLORS = [
    "oklch(0.72 0.19 142)", // Green
    "oklch(0.63 0.24 25)",  // Red
    "oklch(0.69 0.19 240)", // Blue
    "oklch(0.73 0.19 60)",  // Yellow
    "oklch(0.67 0.21 300)", // Purple
    "oklch(0.71 0.18 30)",  // Orange
    "oklch(0.65 0.17 200)", // Cyan
    "oklch(0.70 0.16 330)", // Pink
];

export function ReportChart({ title, data }: ReportChartProps) {
    // Filter out zero values
    const chartData = data.filter((item) => item.value > 0);

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        No data available for the selected period
                    </div>
                </CardContent>
            </Card>
        );
    }

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-medium">{data.name}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">Amount:</span>
                            <span className="font-mono text-sm font-semibold">
                                ${data.value.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-sm text-muted-foreground">Percentage:</span>
                            <span className="text-sm font-semibold">{percentage}%</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({
        cx,
        cy,
        midAngle,
        innerRadius,
        outerRadius,
        percent,
    }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label if less than 5%

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                className="text-xs font-semibold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value, entry: any) => {
                                    const percentage = ((entry.payload.value / total) * 100).toFixed(1);
                                    return `${value} (${percentage}%)`;
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
