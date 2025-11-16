"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  ChevronRight,
  Building2,
  Calendar,
  Menu
} from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { motion } from "framer-motion";
import { TopBar } from "@/components/service-desk/topbar";
import { SideNav } from "@/components/service-desk/sidenav";
import { useIsMobile } from "@/hooks/use-mobile";

export default function ReportsPage() {
  const router = useRouter();
  const { workspaces, isLoading } = useWorkspace();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  // Handle responsive sidebar behavior
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < 1272) {
        setLeftSidebarOpen(false);
      } else {
        setLeftSidebarOpen(true);
      }
    };

    // Run on mount
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWorkspaceSelect = (workspaceId: string) => {
    router.push(`/workspace/${workspaceId}/reports`);
  };

  if (isLoading) {
    return (
      <main className="min-h-dvh flex flex-col text-[0.75rem]">
        <header className="border-b bg-card flex-shrink-0">
          <div className="mx-auto flex w-full items-center gap-2 p-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-4 w-32" />
            <div className="ml-auto" />
            <Skeleton className="h-7 w-16" />
          </div>
        </header>
        <section className="flex flex-1 overflow-hidden relative">
          <aside className="fixed left-0 top-[45px] bottom-0 z-30 w-[195px] border-r bg-card">
            <div className="p-4 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </aside>
          <div className="flex-1 ml-[195px] p-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <Skeleton className="h-8 w-64 mx-auto mb-2" />
                <Skeleton className="h-4 w-96 mx-auto" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh flex flex-col text-[0.75rem]">
      <header className="border-b bg-card flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-2 h-[45px]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="p-1.5 h-auto"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="font-medium">Reports & Analytics</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Workspace Selection
            </Badge>
          </div>
        </div>
      </header>

      <section className="flex flex-1 overflow-hidden relative">
        {/* Left sidebar */}
        <aside
          className={`
            fixed left-0 top-[45px] bottom-0 z-30 w-[195px] 
            border-r bg-card transition-transform duration-200 ease-in-out
            ${leftSidebarOpen && !isMobile ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <SideNav />
        </aside>

        {/* Main content */}
        <div 
          className={`
            flex-1 transition-all duration-200 ease-in-out overflow-auto
            ${leftSidebarOpen && !isMobile ? 'ml-[195px]' : 'ml-0'}
          `}
        >
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg"
                >
                  <BarChart3 className="w-8 h-8 text-white" />
                </motion.div>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-3xl font-bold text-foreground mb-2"
                >
                  Analytics & Reports
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-muted-foreground max-w-2xl mx-auto"
                >
                  Select a workspace to view detailed analytics, hiring metrics, and candidate insights.
                </motion.p>
              </div>

              {/* Workspace Selection */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6"
              >
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Select Workspace
                </h2>
                
                {workspaces.length === 0 ? (
                  <Card className="text-center p-8 border-dashed border-2 border-gray-200">
                    <CardContent className="pt-6">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Workspaces Found</h3>
                        <p className="text-muted-foreground mb-4">
                          Create a workspace to start tracking analytics and generating reports.
                        </p>
                        <Button 
                          onClick={() => router.push('/welcome?create=true')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Create Workspace
                        </Button>
                      </motion.div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map((workspace, index) => (
                      <motion.div
                        key={workspace._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-300 group hover:scale-[1.02] border-gray-200"
                          onClick={() => handleWorkspaceSelect(workspace._id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base font-medium group-hover:text-blue-600 transition-colors flex items-center gap-2">
                                  <Building2 className="w-4 h-4" />
                                  {workspace.name}
                                </CardTitle>
                                <CardDescription className="text-sm mt-1 line-clamp-2">
                                  Workspace ID: {workspace._id.slice(-8)}
                                </CardDescription>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1" />
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>View Analytics</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span>Reports</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100">
                                <Calendar className="w-3 h-3 mr-1" />
                                Analytics Ready
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Quick Stats Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
              >
                <Card className="hover:shadow-md transition-shadow border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-3">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-medium">Hiring Trends</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Track hiring patterns and success rates
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-3">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-medium">Candidate Analytics</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Analyze candidate quality and fit scores
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-md transition-shadow border-gray-200">
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-3">
                      <BarChart3 className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-medium">Performance Metrics</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Monitor recruitment KPIs and goals
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}