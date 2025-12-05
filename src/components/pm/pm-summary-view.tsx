"use client";

import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Share2, CheckCircle2, Clock, Plus, MoreHorizontal, UserPlus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface PMSummaryViewProps {
  workspaceName: string;
  onCreateClick: () => void;
  tasks: any[];
  onDeleteTask?: (taskId: string) => void;
}

export function PMSummaryView({ workspaceName, onCreateClick, tasks = [], onDeleteTask }: PMSummaryViewProps) {
  const { user } = useUser();
  const greeting = getGreeting();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

  // Calculate Metrics
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const doneLast7Days = tasks.filter(t => 
    (t.data?.status === 'done' || t.data?.Status === 'Done' || t.data?.Status === 'Completed') && 
    new Date(t.updatedAt) > sevenDaysAgo
  ).length;

  const updatedLast7Days = tasks.filter(t => 
    new Date(t.updatedAt) > sevenDaysAgo
  ).length;

  const createdLast7Days = tasks.filter(t => 
    new Date(t.createdAt) > sevenDaysAgo
  ).length;

  const dueNext7Days = tasks.filter(t => {
    if (!t.data?.Due) return false;
    const dueDate = new Date(t.data.Due);
    return dueDate > now && dueDate < sevenDaysFromNow;
  }).length;

  // Status Overview
  const statusCounts = tasks.reduce((acc, t) => {
    const status = t.data?.status || t.data?.Status || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Priority Breakdown
  const priorityCounts = tasks.reduce((acc, t) => {
    const priority = t.data?.priority || t.data?.Priority || 'Medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const priorities = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
  const totalTasks = tasks.length;

  // Types of Work
  const typeCounts = tasks.reduce((acc, t) => {
    const type = t.data?.issueType || t.data?.Type || 'Task';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const workTypes = ['Task', 'Sub-task', 'Bug', 'Story', 'Epic'];

  // Recent Activity (Sort by updatedAt desc)
  const recentActivity = [...tasks].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 5);

  return (
    <div className="h-full overflow-y-auto bg-slate-50/50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                {greeting}, {(user as any)?.name || "User"} <span className="text-2xl">👋</span>
              </h1>
              <p className="text-sm text-slate-500">
                Here&apos;s where you&apos;ll view a summary of {workspaceName}&apos;s status, priorities, workload, and more.
              </p>
            </div>
            <Button variant="outline" className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              icon={<CheckCircle2 className="w-5 h-5 text-slate-400" />}
              value={doneLast7Days.toString()}
              label="done"
              subtext="in the last 7 days"
            />
            <StatCard 
              icon={<div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center"><div className="w-2 h-2 bg-slate-400 rounded-full" /></div>}
              value={updatedLast7Days.toString()}
              label="updated"
              subtext="in the last 7 days"
            />
            <StatCard 
              icon={<Plus className="w-5 h-5 text-slate-400" />}
              value={createdLast7Days.toString()}
              label="created"
              subtext="in the last 7 days"
            />
            <StatCard 
              icon={<Clock className="w-5 h-5 text-slate-400" />}
              value={dueNext7Days.toString()}
              label="due"
              subtext="in the next 7 days"
            />
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Status Overview */}
          <DashboardCard title="Status overview">
            <div className="p-6 flex flex-col items-center justify-center min-h-[240px] text-center">
              {totalTasks > 0 ? (
                 <div className="w-full max-w-xs space-y-4">
                    <div className="flex justify-center">
                       <div className="w-32 h-32 rounded-full border-[16px] border-blue-100 relative flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-700">{totalTasks}</div>
                            <div className="text-xs text-slate-400 font-medium uppercase">Total</div>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                       {Object.entries(statusCounts).map(([status, count]) => (
                         <div key={status} className="flex justify-between px-2 py-1 bg-slate-50 rounded">
                           <span className="text-slate-600 truncate">{status}</span>
                           <span className="font-semibold text-slate-800">{count as number}</span>
                         </div>
                       ))}
                    </div>
                 </div>
              ) : (
                <>
                  <div className="w-32 h-32 rounded-full border-[16px] border-slate-100 mb-6 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-700">0</div>
                        <div className="text-xs text-slate-400 font-medium uppercase">Total</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 max-w-xs">
                    You&apos;ll need to create a few items for your project to get a status overview on the team&apos;s progress.
                  </p>
                  <Button variant="link" onClick={onCreateClick} className="text-blue-600 h-auto p-0">Create an item</Button>
                </>
              )}
            </div>
          </DashboardCard>

          {/* Recent Activity */}
          <DashboardCard title="Recent activity">
             <div className="p-6 flex flex-col items-center justify-center min-h-[240px] text-center">
              {recentActivity.length > 0 ? (
                <div className="w-full space-y-3 text-left">
                   {recentActivity.map(task => (
                     <div key={task._id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md transition-colors">
                        <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                           {task.data?.Type?.[0] || 'T'}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="text-sm font-medium text-slate-800 truncate">{task.data?.Summary || 'Untitled Task'}</div>
                           <div className="text-xs text-slate-500">Updated {new Date(task.updatedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-600">
                           {task.data?.Status}
                        </div>
                     </div>
                   ))}
                </div>
              ) : (
                <>
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                     <div className="w-12 h-12 bg-blue-100 rounded-full" />
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    Create a few items and invite teammates to your project to see your project activity.
                  </p>
                  <Button variant="link" onClick={onCreateClick} className="text-blue-600 h-auto p-0">Create an item</Button>
                </>
              )}
            </div>
          </DashboardCard>

          {/* Priority Breakdown */}
          <DashboardCard title="Priority breakdown">
            <div className="p-6 min-h-[240px]">
               <div className="space-y-6">
                 {totalTasks === 0 && (
                   <p className="text-sm text-slate-600">
                      You&apos;ll need to create a few items before you can start prioritizing work. <span onClick={onCreateClick} className="text-blue-600 cursor-pointer">Create an item</span>
                   </p>
                 )}
                 <div className="space-y-4">
                   {priorities.map((priority) => {
                     const count = priorityCounts[priority] || 0;
                     const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                     return (
                       <div key={priority} className="flex items-center gap-4">
                         <div className="w-20 text-xs text-slate-500 text-right">{priority}</div>
                         <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-blue-500 transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                           />
                         </div>
                         <div className="text-xs text-slate-400 w-8 text-right">{count}</div>
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>
          </DashboardCard>

          {/* Types of Work */}
          <DashboardCard title="Types of work">
            <div className="p-6 min-h-[240px]">
               <div className="space-y-6">
                 {totalTasks === 0 && (
                   <p className="text-sm text-slate-600">
                      You&apos;ll need to create a few items for your project to get started. <span onClick={onCreateClick} className="text-blue-600 cursor-pointer">Create an item</span>
                   </p>
                 )}
                 <div className="space-y-4">
                   {workTypes.map((type) => {
                     const count = typeCounts[type] || 0;
                     const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                     return (
                       <div key={type} className="flex items-center justify-between gap-4">
                         <div className="flex items-center gap-2 w-24">
                           <div className={cn("w-4 h-4 rounded-sm", 
                              type === 'Bug' ? 'bg-red-500' : 
                              type === 'Story' ? 'bg-green-500' : 
                              type === 'Epic' ? 'bg-purple-500' : 
                              'bg-blue-500'
                           )} />
                           <span className="text-sm text-slate-600">{type}</span>
                         </div>
                         <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                           <div 
                              className="h-full bg-blue-500 transition-all duration-500" 
                              style={{ width: `${percentage}%` }}
                           />
                         </div>
                         <div className="text-sm text-slate-500 w-8 text-right">{Math.round(percentage)}%</div>
                         <div className="text-sm text-slate-500 w-8 text-right">{count}</div>
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>
          </DashboardCard>

          {/* Team Workload */}
          <DashboardCard title="Team workload">
            <div className="p-6 min-h-[240px]">
               <div className="space-y-6">
                 <p className="text-sm text-slate-600">
                    You&apos;ll need to create a few items to assign work to the right people in your team. <span onClick={onCreateClick} className="text-blue-600 cursor-pointer">Create an item</span>
                 </p>
                 <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-md cursor-pointer transition-colors">
                   <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                     <UserPlus className="w-4 h-4 text-slate-500" />
                   </div>
                   <span className="text-sm font-medium text-slate-600">Invite teammate</span>
                 </div>
               </div>
            </div>
          </DashboardCard>

        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, subtext }: { icon: React.ReactNode, value: string, label: string, subtext: string }) {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="mt-1">{icon}</div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-slate-800">{value}</span>
          <span className="text-sm font-medium text-slate-600">{label}</span>
        </div>
        <div className="text-xs text-slate-400">{subtext}</div>
      </div>
    </div>
  );
}

function DashboardCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
