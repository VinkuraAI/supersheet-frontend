"use client";

import { useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Grid3x3,
  Settings,
  Package,
  Megaphone,
  Palette,
  Clock,
  Database,
  Headphones,
  Scale,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Plus,
  ArrowRight,
  Briefcase,
  FolderOpen,
  Sparkles
} from "lucide-react";
import {
  UsersIcon,
  CodeIcon
} from "../../components/icons/3d-icons";
import { useWorkspace } from "../../lib/workspace-context";
import { Skeleton } from "@/components/ui/skeleton";

interface Workspace {
  _id: string;
  name: string;
  mainFocus?: string;
}

const workTypes = [
  {
    id: 'human-resources',
    name: 'Human resources',
    icon: UsersIcon,
    bgGradient: 'from-emerald-400 to-emerald-500',
    lightBg: 'from-emerald-50 to-green-50'
  },
  {
    id: 'software-development',
    name: 'Software development',
    icon: CodeIcon,
    bgGradient: 'from-purple-400 to-purple-500',
    lightBg: 'from-purple-50 to-violet-50'
  },
  {
    id: 'product-management',
    name: 'Product management',
    icon: Package,
    bgGradient: 'from-orange-400 to-orange-500',
    lightBg: 'from-orange-50 to-amber-50'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Megaphone,
    bgGradient: 'from-pink-400 to-pink-500',
    lightBg: 'from-pink-50 to-rose-50'
  },
  {
    id: 'design',
    name: 'Design',
    icon: Palette,
    bgGradient: 'from-violet-400 to-violet-500',
    lightBg: 'from-violet-50 to-purple-50'
  },
  {
    id: 'project-management',
    name: 'Project management',
    icon: Clock,
    bgGradient: 'from-indigo-400 to-indigo-500',
    lightBg: 'from-indigo-50 to-blue-50'
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: Settings,
    bgGradient: 'from-slate-400 to-slate-500',
    lightBg: 'from-slate-50 to-gray-50'
  },
  {
    id: 'it-support',
    name: 'IT support',
    icon: Database,
    bgGradient: 'from-cyan-400 to-cyan-500',
    lightBg: 'from-cyan-50 to-sky-50'
  },
  {
    id: 'customer-service',
    name: 'Customer service',
    icon: Headphones,
    bgGradient: 'from-teal-400 to-teal-500',
    lightBg: 'from-teal-50 to-emerald-50'
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: Scale,
    bgGradient: 'from-gray-400 to-gray-500',
    lightBg: 'from-gray-50 to-slate-50'
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: DollarSign,
    bgGradient: 'from-green-400 to-green-500',
    lightBg: 'from-green-50 to-lime-50'
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: ShoppingCart,
    bgGradient: 'from-red-400 to-red-500',
    lightBg: 'from-red-50 to-orange-50'
  },
  {
    id: 'data-science',
    name: 'Data science',
    icon: TrendingUp,
    bgGradient: 'from-sky-400 to-sky-500',
    lightBg: 'from-sky-50 to-cyan-50'
  }
];

const WorkspaceCard = ({ workspace, index }: { workspace: Workspace; index: number }) => {
  const router = useRouter();

  const handleWorkspaceClick = () => {
    const routePrefix = (workspace.mainFocus === 'product-management' || workspace.mainFocus === 'project-management') ? 'pm' : 'hr';
    router.push(`/${routePrefix}/workspace/${workspace._id}`);
  };

  const workType = workTypes.find(w => w.id === workspace.mainFocus);
  const Icon = workType?.icon || Grid3x3;
  const bgGradient = workType?.bgGradient || 'from-blue-400 to-blue-500';
  const lightBg = workType?.lightBg || 'from-blue-50 to-indigo-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={handleWorkspaceClick}
      className="group relative bg-white border-2 border-slate-200 rounded-2xl p-6 cursor-pointer
                 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 hover:scale-[1.02]
                 transition-all duration-300 overflow-hidden"
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${lightBg} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      <div className="relative z-10 flex flex-col h-full">
        {/* Icon */}
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${bgGradient} 
                      flex items-center justify-center mb-4 shadow-lg 
                      group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={28} className="text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-800 mb-1 group-hover:text-blue-700 transition-colors">
            {workspace.name}
          </h3>
          <p className="text-sm text-slate-500 capitalize">
            {workspace.mainFocus?.replace('-', ' ') || 'General'}
          </p>
        </div>

        {/* Arrow indicator */}
        <div className="flex justify-end items-center mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <span className="text-sm font-semibold text-blue-600 mr-2">Open workspace</span>
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center
                        group-hover:translate-x-1 transition-transform duration-300">
            <ArrowRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CreateWorkspaceCard = ({ canCreate }: { canCreate: boolean }) => {
  const router = useRouter();

  const handleCreateClick = () => {
    if (canCreate) {
      router.push('/welcome?create=true');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      onClick={handleCreateClick}
      className={`group relative border-2 border-dashed rounded-2xl p-6 flex flex-col justify-center items-center
                 transition-all duration-300 overflow-hidden min-h-[220px]
                 ${canCreate
          ? 'border-slate-300 bg-slate-50 cursor-pointer hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-xl hover:shadow-blue-100/50 hover:scale-[1.02]'
          : 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
        }`}
    >
      {/* Animated background */}
      {canCreate && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      <div className="relative z-10 text-center">
        {/* Plus icon */}
        <motion.div
          className={`w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center
                     transition-all duration-300 ${canCreate
              ? 'bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-500 group-hover:to-blue-600 group-hover:shadow-lg group-hover:scale-110'
              : 'bg-slate-200'
            }`}
          whileHover={canCreate ? { rotate: 90 } : {}}
          transition={{ duration: 0.3 }}
        >
          <Plus className={`w-7 h-7 ${canCreate ? 'text-blue-600 group-hover:text-white' : 'text-slate-400'}`} />
        </motion.div>

        {/* Text */}
        <h3 className={`font-bold text-lg mb-2 ${canCreate ? 'text-slate-700 group-hover:text-blue-700' : 'text-slate-400'}`}>
          Create new workspace
        </h3>
        <p className={`text-sm ${canCreate ? 'text-slate-500' : 'text-slate-400'}`}>
          {canCreate ? 'Start organizing your work' : 'Maximum workspaces reached'}
        </p>
      </div>
    </motion.div>
  );
};

function DashboardPage() {
  const router = useRouter();
  const { workspaces, ownedWorkspaces, sharedWorkspaces, isLoading, canCreateWorkspace, workspaceCount, maxWorkspaces } = useWorkspace();

  useEffect(() => {
  }, [isLoading, ownedWorkspaces.length, sharedWorkspaces.length]);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {/* Total Workspaces */}
        <div className="relative group overflow-hidden bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Briefcase className="w-24 h-24 text-blue-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Workspaces</p>
            <h3 className="text-3xl font-bold text-slate-800">{workspaceCount}</h3>
          </div>
        </div>

        {/* Active Projects */}
        <div className="relative group overflow-hidden bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <FolderOpen className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <FolderOpen className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Active Projects</p>
            <h3 className="text-3xl font-bold text-slate-800">{workspaceCount}</h3>
          </div>
        </div>

        {/* Available Slots */}
        <div className="relative group overflow-hidden bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="w-24 h-24 text-purple-600" />
          </div>
          <div className="relative z-10">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-slate-500 text-sm font-medium mb-1">Available Slots</p>
            <h3 className="text-3xl font-bold text-slate-800">{maxWorkspaces - workspaceCount}</h3>
          </div>
        </div>
      </motion.div>

      {/* Your Workspaces Section */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Your Workspaces</h2>
          <p className="text-slate-600">Workspaces created by you</p>
        </motion.div>

        {ownedWorkspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-lg font-medium mb-2">You don&apos;t have your own workspace</p>
            <p className="text-slate-500 text-sm">Create your first workspace to get started</p>
          </motion.div>
        ) : (
          <>
            {workspaces.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200 border-dashed">
                <h3 className="text-lg font-medium text-slate-900 mb-2">No workspaces found</h3>
                <p className="text-slate-500 mb-6">Get started by creating your first workspace.</p>
                <button
                  onClick={() => router.push('/welcome?create=true')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/30"
                >
                  Create Workspace
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedWorkspaces.map((workspace, index) => (
                  <WorkspaceCard key={workspace._id} workspace={workspace} index={index} />
                ))}
                {sharedWorkspaces.map((workspace, index) => (
                  <WorkspaceCard key={workspace._id} workspace={workspace} index={ownedWorkspaces.length + index} />
                ))}

                <CreateWorkspaceCard canCreate={canCreateWorkspace} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Shared Workspaces Section */}
      <div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Shared Workspaces to You</h2>
          <p className="text-slate-600">Workspaces shared with you by others</p>
        </motion.div>

        {sharedWorkspaces.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 text-lg font-medium mb-2">No shared workspaces yet</p>
            <p className="text-slate-500 text-sm">Till now no one has shared workspaces to you</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedWorkspaces.map((ws, index) => (
              <WorkspaceCard key={ws._id} workspace={ws} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SuspendedDashboardPage() {
  return (
    <Suspense fallback={
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
      </div>
    }>
      <DashboardPage />
    </Suspense>
  )
}