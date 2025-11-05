"use client";

import { useState, useEffect } from "react";
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
  TrendingUp
} from "lucide-react";
import { 
  HiringIcon, 
  EmployeeManagementIcon, 
  ProjectManagementIcon,
  UsersIcon,
  CodeIcon
} from "../../components/icons/3d-icons";

// Skeleton Loading Component with refined design
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm flex items-center gap-3">
      <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg"></div>
      <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-32"></div>
    </div>
  </div>
);

const workTypes = [
  {
    id: 'human-resources',
    name: 'Human resources',
    icon: UsersIcon,
    bgGradient: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-emerald-500 group-hover:to-emerald-600'
  },
  {
    id: 'software-development',
    name: 'Software development',
    icon: CodeIcon,
    bgGradient: 'bg-gradient-to-br from-purple-400 to-purple-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-purple-500 group-hover:to-purple-600'
  },
  {
    id: 'product-management',
    name: 'Product management',
    icon: Package,
    bgGradient: 'bg-gradient-to-br from-orange-400 to-orange-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-orange-500 group-hover:to-orange-600'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    icon: Megaphone,
    bgGradient: 'bg-gradient-to-br from-pink-400 to-pink-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-pink-500 group-hover:to-pink-600'
  },
  {
    id: 'design',
    name: 'Design',
    icon: Palette,
    bgGradient: 'bg-gradient-to-br from-violet-400 to-violet-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-violet-500 group-hover:to-violet-600'
  },
  {
    id: 'project-management',
    name: 'Project management',
    icon: Clock,
    bgGradient: 'bg-gradient-to-br from-indigo-400 to-indigo-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-indigo-500 group-hover:to-indigo-600'
  },
  {
    id: 'operations',
    name: 'Operations',
    icon: Settings,
    bgGradient: 'bg-gradient-to-br from-slate-400 to-slate-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-slate-500 group-hover:to-slate-600'
  },
  {
    id: 'it-support',
    name: 'IT support',
    icon: Database,
    bgGradient: 'bg-gradient-to-br from-cyan-400 to-cyan-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-cyan-500 group-hover:to-cyan-600'
  },
  {
    id: 'customer-service',
    name: 'Customer service',
    icon: Headphones,
    bgGradient: 'bg-gradient-to-br from-teal-400 to-teal-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-teal-500 group-hover:to-teal-600'
  },
  {
    id: 'legal',
    name: 'Legal',
    icon: Scale,
    bgGradient: 'bg-gradient-to-br from-gray-400 to-gray-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-gray-500 group-hover:to-gray-600'
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: DollarSign,
    bgGradient: 'bg-gradient-to-br from-green-400 to-green-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-green-500 group-hover:to-green-600'
  },
  {
    id: 'sales',
    name: 'Sales',
    icon: ShoppingCart,
    bgGradient: 'bg-gradient-to-br from-red-400 to-red-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-red-500 group-hover:to-red-600'
  },
  {
    id: 'data-science',
    name: 'Data science',
    icon: TrendingUp,
    bgGradient: 'bg-gradient-to-br from-sky-400 to-sky-500',
    iconColor: 'text-white',
    hoverGradient: 'group-hover:from-sky-500 group-hover:to-sky-600'
  }
];

const hrOptions = [
  {
    id: 'Hiring',
    name: "We're Hiring",
    icon: HiringIcon,
    bgColor: 'bg-green-50',
    hoverColor: 'hover:bg-green-500',
    textColor: 'text-green-700'
  },
  {
    id: 'Employee Management', 
    name: 'Employee Management',
    icon: EmployeeManagementIcon,
    bgColor: 'bg-blue-50',
    hoverColor: 'hover:bg-blue-500',
    textColor: 'text-blue-700'
  },
  {
    id: 'Project Management',
    name: 'Project Management',
    icon: ProjectManagementIcon,
    bgColor: 'bg-purple-50',
    hoverColor: 'hover:bg-purple-500',
    textColor: 'text-purple-700'
  }
];

import { useAuth } from "../../lib/auth-context";
import { useSearchParams } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'welcome' | 'loading' | 'selection' | 'hr-options'>('welcome');
  const [selectedWorkType, setSelectedWorkType] = useState<string | null>(null);
  const [selectedHrOption, setSelectedHrOption] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('create') === 'true') {
      setCurrentStep('selection');
    }
  }, [searchParams]);

  const handleGetStarted = () => {
    setCurrentStep('selection');
  };

  const handleSkip = () => {
    router.push('/workspace-setup');
  };

  const handleWorkTypeSelect = (workTypeId: string) => {
    setSelectedWorkType(workTypeId);
    if (workTypeId === 'human-resources') {
      setCurrentStep('hr-options');
    } else {
      router.push(`/workspace-setup?workType=${workTypeId}`);
    }
  };

  const handleHrOptionSelect = (optionId: string) => {
    setSelectedHrOption(optionId);
    router.push(`/workspace-setup?workType=human-resources&hrOption=${optionId}`);
  };

  const handleContinue = () => {
    if (selectedWorkType) {
      if (selectedWorkType === 'human-resources' && selectedHrOption) {
        router.push(`/workspace-setup?workType=${selectedWorkType}&hrOption=${selectedHrOption}`);
      } else {
        router.push(`/workspace-setup?workType=${selectedWorkType}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0QjVTNjMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      
      <div className="relative max-w-2xl mx-auto px-4 py-16">
        {/* Welcome Screen */}
        {currentStep === 'welcome' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            {/* Enhanced Logo Section with Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className="flex items-center justify-center gap-4 mb-10"
            >
              {/* Animated Logo Container with Pulse Effect */}
              <motion.div
                animate={{ 
                  boxShadow: [
                    "0 10px 30px rgba(59, 130, 246, 0.3)",
                    "0 10px 40px rgba(59, 130, 246, 0.5)",
                    "0 10px 30px rgba(59, 130, 246, 0.3)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Grid3x3 className="w-9 h-9 text-white" />
                </motion.div>
                
                {/* Decorative glow ring */}
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-2xl border-2 border-blue-400"
                />
              </motion.div>
              
              <div>
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-5xl font-bold"
                >
                  <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent">
                    Supersheet
                  </span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-sm text-slate-500 font-medium tracking-wide"
                >
                  Your workspace, simplified
                </motion.p>
              </div>
            </motion.div>
            
            {/* Enhanced Welcome Card with Better Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-2xl mx-auto mb-10"
            >
              <div className="bg-white border-2 border-slate-200 rounded-3xl p-10 shadow-2xl shadow-slate-300/50 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30 translate-y-24 -translate-x-24" />
                
                <div className="relative z-10">
                  {/* Welcome Badge */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.4, type: "spring" }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-full mb-6"
                  >
                    <span className="text-2xl">👋</span>
                    <span className="text-sm font-semibold text-blue-700">Welcome aboard!</span>
                  </motion.div>
                  
                  {/* Main Heading */}
                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent mb-3 leading-tight"
                  >
                    Let&apos;s build something amazing together
                  </motion.h2>
                  
                  {/* Description */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-slate-600 text-base leading-relaxed mb-6 max-w-xl mx-auto"
                  >
                    Transform the way you work with powerful tools designed to streamline your workflow, 
                    boost team collaboration, and accelerate productivity. Your journey to better work starts here.
                  </motion.p>
                  
                  {/* Feature Pills */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                    className="flex flex-wrap items-center justify-center gap-3 mb-8"
                  >
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-full">
                      <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-emerald-700">Easy Setup</span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-full">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                      </svg>
                      <span className="text-sm font-medium text-purple-700">Team Ready</span>
                    </div>
                    
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-blue-700">Lightning Fast</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Enhanced Get Started Button with Icon */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              className="space-y-4"
            >
              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="group relative px-12 py-5 rounded-2xl font-bold text-white text-lg
                         bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
                         hover:from-blue-600 hover:via-blue-700 hover:to-blue-800
                         shadow-xl shadow-blue-500/40 hover:shadow-2xl hover:shadow-blue-600/50
                         transition-all duration-300 overflow-hidden"
              >
                {/* Animated shine effect */}
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                />
                
                <span className="relative flex items-center gap-3">
                  Get Started
                  <motion.svg 
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    className="w-5 h-5" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </motion.svg>
                </span>
              </motion.button>
              
              {/* Subtle helper text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.5 }}
                className="text-sm text-slate-500"
              >
                Takes less than 2 minutes ⏱️
              </motion.p>
            </motion.div>
          </motion.div>
        )}

        {/* Loading State */}
        {currentStep === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Enhanced Loading Header */}
            <div className="text-center mb-8">
              <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-64 mx-auto mb-3 animate-pulse shadow-sm"></div>
              <div className="h-5 bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg w-48 mx-auto animate-pulse"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 14 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Work Type Selection Screen */}
        {currentStep === 'selection' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Enhanced Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Grid3x3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-800">Supersheet <span className="text-blue-600">Service Management</span></span>
              </motion.div>
            </div>

            {/* Enhanced Question Section */}
            <div className="text-center mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3"
              >
                What kind of work do you do?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-slate-600 text-base"
              >
                This helps us personalize your experience
              </motion.p>
            </div>

            {/* Work Type Selection with Enhanced Cards */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {workTypes.map((workType, index) => (
                  <motion.button
                    key={workType.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    onClick={() => handleWorkTypeSelect(workType.id)}
                    className={`group relative border-2 rounded-xl p-5 text-left transition-all duration-200 flex items-center gap-4 ${
                      selectedWorkType === workType.id
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/50'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:scale-[1.01]'
                    }`}
                  >
                    {/* Icon Container with enhanced gradient styling */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
                      selectedWorkType === workType.id
                        ? 'bg-white shadow-xl shadow-blue-300/40 scale-110'
                        : `${workType.bgGradient} ${workType.hoverGradient} group-hover:shadow-xl group-hover:scale-105`
                    }`}>
                      <workType.icon 
                        size={28}
                        className={`transition-all duration-200 ${
                          selectedWorkType === workType.id ? 'text-blue-600' : workType.iconColor
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold text-base ${
                        selectedWorkType === workType.id ? 'text-blue-700' : 'text-slate-800'
                      }`}>
                        {workType.name}
                      </h3>
                    </div>
                    
                    {/* Enhanced selection indicator */}
                    {selectedWorkType === workType.id && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
                
                {/* Enhanced Other option */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: workTypes.length * 0.05 }}
                  onClick={() => handleWorkTypeSelect('other')}
                  className={`group relative border-2 rounded-xl p-5 text-left transition-all duration-200 flex items-center gap-4 ${
                    selectedWorkType === 'other'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-200/50'
                      : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-lg hover:shadow-slate-200/50 hover:scale-[1.01]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    selectedWorkType === 'other'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30 scale-110'
                      : 'bg-purple-100 group-hover:bg-purple-500 group-hover:shadow-lg'
                  }`}>
                    <Settings className={`w-6 h-6 transition-colors duration-200 ${
                      selectedWorkType === 'other' ? 'text-white' : 'text-purple-700 group-hover:text-white'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold text-base ${
                      selectedWorkType === 'other' ? 'text-blue-700' : 'text-slate-800'
                    }`}>
                      Other
                    </h3>
                  </div>
                  
                  {selectedWorkType === 'other' && (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              </div>

              {/* Enhanced Continue Button */}
              {selectedWorkType && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={handleContinue}
                    className="px-8 py-3.5 rounded-xl font-semibold text-white text-base
                             bg-gradient-to-r from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02]
                             shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40
                             transition-all duration-200"
                  >
                    Continue →
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* HR Options Flow */}
        {currentStep === 'hr-options' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Enhanced HR Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-center justify-center gap-2 mb-6"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <Grid3x3 className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-800">Supersheet <span className="text-blue-600">Service Management</span></span>
              </motion.div>
            </div>

            {/* Enhanced HR Question Section */}
            <div className="text-center mb-10">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3"
              >
                What&apos;s your HR focus?
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-slate-600 text-base"
              >
                This helps us customize your HR experience
              </motion.p>
            </div>

            {/* Enhanced HR Options */}
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {hrOptions.map((option, index) => (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => handleHrOptionSelect(option.id)}
                    className={`group relative border-2 rounded-xl p-6 text-center transition-all duration-200 flex flex-col items-center gap-4 ${
                      selectedHrOption === option.id
                        ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl shadow-blue-200/50 scale-[1.02]'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:scale-[1.02]'
                    }`}
                  >
                    {/* Enhanced 3D Icon Container */}
                    <div className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      selectedHrOption === option.id
                        ? 'bg-white shadow-xl shadow-blue-200/50 scale-110'
                        : `${option.bgColor} group-hover:shadow-xl group-hover:scale-105`
                    }`}>
                      <option.icon 
                        size={40}
                        className="transition-all duration-200"
                      />
                    </div>
                    
                    {/* Option Name */}
                    <h3 className={`font-semibold text-base ${
                      selectedHrOption === option.id ? 'text-blue-700' : 'text-slate-800'
                    }`}>
                      {option.name}
                    </h3>
                    
                    {/* Enhanced selection indicator */}
                    {selectedHrOption === option.id && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute top-3 right-3 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30"
                      >
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>

              {/* Enhanced Continue Button */}
              {selectedHrOption && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-center"
                >
                  <button
                    onClick={() => {
                      if (selectedHrOption) {
                        router.push(`/workspace-setup?workType=${selectedWorkType}&hrOption=${selectedHrOption}`);
                      } else {
                        console.log('HR Selection:', { 
                          workType: 'human-resources', 
                          selectedOption: selectedHrOption
                        });
                        // Handle other HR options here
                      }
                    }}
                    className="px-8 py-3.5 rounded-xl font-semibold text-white text-base
                             bg-gradient-to-r from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02]
                             shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40
                             transition-all duration-200"
                  >
                    Continue →
                  </button>
                </motion.div>
              )}
            </div>

            {/* Enhanced Back Button */}
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  setCurrentStep('selection');
                  setSelectedWorkType(null);
                  setSelectedHrOption(null);
                }}
                className="group flex items-center gap-2 px-4 py-2.5 rounded-lg
                         text-slate-600 hover:text-slate-800 hover:bg-slate-100
                         transition-all duration-200 font-medium"
              >
                <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to work type selection
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}