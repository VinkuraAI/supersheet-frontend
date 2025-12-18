"use client";

import { useMemo } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    CheckCircle,
    Clock,
    AlertCircle,
    Briefcase
} from "lucide-react";

interface PMReportViewProps {
    tasks: any[];
    workspaceName: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];
const PRIORITY_COLORS = {
    Highest: "#dc2626",
    High: "#ea580c",
    Medium: "#eab308",
    Low: "#22c55e",
    Lowest: "#3b82f6",
};

export function PMReportView({ tasks, workspaceName }: PMReportViewProps) {
    // --- Data Processing ---

    const kpiData = useMemo(() => {
        const total = tasks.length;
        const completed = tasks.filter((t) => t.data?.status === "done").length;
        const inProgress = tasks.filter((t) => t.data?.status === "in_progress").length;

        // Simple overdue check: endDate < now and status != done
        const overdue = tasks.filter((t) => {
            if (t.data?.status === "done") return false;
            if (!t.data?.endDate) return false;
            return new Date(t.data.endDate) < new Date();
        }).length;

        return { total, completed, inProgress, overdue };
    }, [tasks]);

    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        tasks.forEach(t => {
            const s = t.data?.status || "Unknown";
            // Convert to readable label if needed, or stick to keys
            const label = s.replace("_", " ").toUpperCase();
            counts[label] = (counts[label] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [tasks]);

    const priorityData = useMemo(() => {
        const counts: Record<string, number> = {};
        const priorities = ["Highest", "High", "Medium", "Low", "Lowest"];

        // Initialize to ensure order
        priorities.forEach(p => counts[p] = 0);

        tasks.forEach(t => {
            const p = t.data?.priority || "Medium";
            if (counts.hasOwnProperty(p)) {
                counts[p]++;
            } else {
                counts[p] = (counts[p] || 0) + 1;
            }
        });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [tasks]);

    const typeData = useMemo(() => {
        const counts: Record<string, number> = {};
        tasks.forEach(t => {
            const type = t.data?.issueType || "Task";
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
    }, [tasks]);

    const assigneeData = useMemo(() => {
        const counts: Record<string, number> = {};
        tasks.forEach(t => {
            const assignee = t.data?.assignee || "Unassigned";
            counts[assignee] = (counts[assignee] || 0) + 1;
        });
        // Sort by count desc and take top 10
        return Object.keys(counts)
            .map(key => ({ name: key, value: counts[key] }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [tasks]);

    return (
        <div className="h-full overflow-y-auto p-2 space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Project Analytics: {workspaceName}</h2>
                <p className="text-slate-500">Real-time insights and performance metrics</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Total Tasks"
                    value={kpiData.total}
                    icon={<Briefcase className="w-5 h-5 text-blue-600" />}
                    subtext="All active tasks"
                    bg="bg-blue-50"
                />
                <KPICard
                    title="Completed"
                    value={kpiData.completed}
                    icon={<CheckCircle className="w-5 h-5 text-emerald-600" />}
                    subtext={`${((kpiData.completed / (kpiData.total || 1)) * 100).toFixed(0)}% completion rate`}
                    bg="bg-emerald-50"
                />
                <KPICard
                    title="In Progress"
                    value={kpiData.inProgress}
                    icon={<Clock className="w-5 h-5 text-amber-600" />}
                    subtext="Active work"
                    bg="bg-amber-50"
                />
                <KPICard
                    title="Overdue"
                    value={kpiData.overdue}
                    icon={<AlertCircle className="w-5 h-5 text-red-600" />}
                    subtext="Needs attention"
                    bg="bg-red-50"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Status Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Status Distribution</CardTitle>
                        <CardDescription>Breakdown of tasks by their current status</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Priority Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Priority Breakdown</CardTitle>
                        <CardDescription>Tasks grouped by priority level</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priorityData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" allowDecimals={false} />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="value" name="Tasks" radius={[0, 4, 4, 0]}>
                                    {priorityData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS] || "#8884d8"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Task Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Task Types</CardTitle>
                        <CardDescription>Distribution of work types (Story, Bug, Task)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={typeData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {typeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Assignee Workload */}
                <Card>
                    <CardHeader>
                        <CardTitle>Team Workload</CardTitle>
                        <CardDescription>Tasks assigned per team member (Top 10)</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={assigneeData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={60} />
                                <YAxis allowDecimals={false} />
                                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}

function KPICard({ title, value, icon, subtext, bg }: any) {
    return (
        <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <div className={`p-2 rounded-full ${bg}`}>
                        {icon}
                    </div>
                </div>
                <div className="flex flex-col">
                    <div className="text-2xl font-bold text-slate-900">{value}</div>
                    <p className="text-xs text-slate-500 mt-1">{subtext}</p>
                </div>
            </CardContent>
        </Card>
    )
}
