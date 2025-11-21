"use client";

import * as React from 'react';
import {
  Home,
  Settings,
  PanelLeft,
  LogOut,
  User as UserIcon,
  ArrowLeft,
  Grid3x3,
} from 'lucide-react';
import {
  Sidebar,
  SidebarProvider,
  SidebarTrigger,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

function DashboardHeader() {
  const router = useRouter();
  const { user } = useAuth();

  const handleBackToHome = () => {
    router.push('/');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="lg:hidden" />

          {/* Logo and Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Grid3x3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Supersheet
              </h1>
              <p className="text-xs text-slate-500 font-medium">Dashboard</p>
            </div>
          </motion.div>
        </div>

        {/* Back to Home Button */}
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBackToHome}
          className="group flex items-center gap-2 px-4 py-2 rounded-xl 
                   bg-gradient-to-r from-slate-50 to-slate-100 
                   hover:from-blue-50 hover:to-indigo-50
                   border-2 border-slate-200 hover:border-blue-300
                   transition-all duration-300 hover:shadow-md hover:shadow-blue-100/50"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
          <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700 transition-colors">
            Back to Home
          </span>
        </motion.button>
      </div>

      {/* Welcome Section */}
      <div className="px-6 pb-6 pt-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-slate-600">
            Welcome back to your workspace. Ready to get things done?
          </p>
        </motion.div>
      </div>
    </header>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0QjVTNjMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40 pointer-events-none" />

      <SidebarProvider>
        <Sidebar className="border-r-2 bg-white/80 backdrop-blur-md">
          <SidebarHeader className="p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <PanelLeft className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Supersheet
                </h2>
                <p className="text-xs text-slate-500">Service Management</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-4">
            <SidebarMenu className="space-y-2">
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive
                  className="rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-500 data-[active=true]:to-blue-600 data-[active=true]:text-white transition-all duration-200"
                >
                  <a href="/dashboard">
                    <Home className="w-5 h-5" />
                    <span className="font-semibold">Dashboard</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  className="rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-200"
                >
                  <a href="/user/settings">
                    <Settings className="w-5 h-5" />
                    <span className="font-semibold">Settings</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-100 transition-colors">
                  <Avatar className="w-10 h-10 border-2 border-blue-200">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56 rounded-xl">
                <DropdownMenuLabel className="font-semibold">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="rounded-lg cursor-pointer"
                  onClick={() => router.push('/user/settings')}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="rounded-lg cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="relative">
          <DashboardHeader />
          <main className="p-6 relative z-10">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
