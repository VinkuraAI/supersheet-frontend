"use client";

import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Share2, CheckCircle2, Clock, Plus, MoreHorizontal, UserPlus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface PMSummaryViewProps {
  workspaceName: string;
  onCreateClick: () => void;
}

export function PMSummaryView({ workspaceName, onCreateClick }: PMSummaryViewProps) {
  const { user } = useUser();
  const greeting = getGreeting();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }

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
              value="0"
              label="done"
              subtext="in the last 7 days"
            />
            <StatCard 
              icon={<div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center"><div className="w-2 h-2 bg-slate-400 rounded-full" /></div>}
              value="0"
              label="updated"
              subtext="in the last 7 days"
            />
            <StatCard 
              icon={<Plus className="w-5 h-5 text-slate-400" />}
              value="0"
              label="created"
              subtext="in the last 7 days"
            />
            <StatCard 
              icon={<Clock className="w-5 h-5 text-slate-400" />}
              value="0"
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
            </div>
          </DashboardCard>

          {/* Recent Activity */}
          <DashboardCard title="Recent activity">
             <div className="p-6 flex flex-col items-center justify-center min-h-[240px] text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                 <div className="w-12 h-12 bg-blue-100 rounded-full" />
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Create a few items and invite teammates to your project to see your project activity.
              </p>
              <Button variant="link" onClick={onCreateClick} className="text-blue-600 h-auto p-0">Create an item</Button>
            </div>
          </DashboardCard>

          {/* Priority Breakdown */}
          <DashboardCard title="Priority breakdown">
            <div className="p-6 min-h-[240px]">
               <div className="space-y-6">
                 <p className="text-sm text-slate-600">
                    You&apos;ll need to create a few items before you can start prioritizing work. <span onClick={onCreateClick} className="text-blue-600 cursor-pointer">Create an item</span>
                 </p>
                 <div className="space-y-4">
                   {['Highest', 'High', 'Medium', 'Low', 'Lowest'].map((priority) => (
                     <div key={priority} className="flex items-center gap-4">
                       <div className="w-20 text-xs text-slate-500 text-right">{priority}</div>
                       <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                         <div className="h-full bg-slate-200 w-0" />
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          </DashboardCard>

          {/* Types of Work */}
          <DashboardCard title="Types of work">
            <div className="p-6 min-h-[240px]">
               <div className="space-y-6">
                 <p className="text-sm text-slate-600">
                    You&apos;ll need to create a few items for your project to get started. <span onClick={onCreateClick} className="text-blue-600 cursor-pointer">Create an item</span>
                 </p>
                 <div className="space-y-4">
                   {['Task', 'Sub-task'].map((type) => (
                     <div key={type} className="flex items-center justify-between gap-4">
                       <div className="flex items-center gap-2 w-24">
                         <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                         <span className="text-sm text-slate-600">{type}</span>
                       </div>
                       <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                         <div className="h-full bg-slate-200 w-0" />
                       </div>
                       <div className="text-sm text-slate-500 w-8 text-right">0%</div>
                       <div className="text-sm text-slate-500 w-8 text-right">0</div>
                     </div>
                   ))}
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
