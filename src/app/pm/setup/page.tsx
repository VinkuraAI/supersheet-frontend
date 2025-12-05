"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid3x3, Upload, FileText, ArrowLeft, Users, CheckCircle, Plus, Trash2, Crown } from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "@/utils/api.client";
import { useAuth } from "@/lib/auth-context";
import { useWorkspace } from "@/lib/workspace-context";

interface TeamMember {
  name: string;
  email: string;
  role: string;
  isLeader: boolean;
}

import { useQueryClient } from "@tanstack/react-query";
import { workspaceKeys } from "@/features/workspace/hooks/use-workspaces";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

const loadingStates = [
  { text: "Validating workspace details" },
  { text: "Creating secure environment" },
  { text: "Configuring database schemas" },
  { text: "Initializing team permissions" },
  { text: "Preparing your dashboard" },
];

export default function PMSetupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canCreateWorkspace, maxWorkspaces, refreshLocalWorkspaces } = useWorkspace();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 1: Workspace Basics
  const [workspaceName, setWorkspaceName] = useState("");
  const [projectDetails, setProjectDetails] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Step 2: Team Setup
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([
    { name: "", email: "", role: "Editor", isLeader: false },
    { name: "", email: "", role: "Editor", isLeader: false }
  ]);

  // Check workspace limit
  // useEffect(() => {
  //   if (!canCreateWorkspace) {
  //     alert(`Workspace limit reached! You can only create up to ${maxWorkspaces} workspaces.`);
  //     router.push('/workspace');
  //   }
  // }, [canCreateWorkspace, maxWorkspaces, router]);

  if (!canCreateWorkspace && !isCreating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center space-y-6 border border-slate-200"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <Grid3x3 className="w-8 h-8 text-blue-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-800">Limit Reached</h2>
            <p className="text-slate-600">
              You already have created {maxWorkspaces} workspaces. Please go to the dashboard page.
            </p>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-blue-500/30"
          >
            Go to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (file.type === 'text/plain' || file.type === 'application/pdf' || file.name.endsWith('.docx')) {
      setUploadedFile(file);
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => setProjectDetails(e.target?.result as string);
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        await extractTextFromPDF(file);
      }
    }
  };

  const extractTextFromPDF = async (file: File) => {
    setIsExtracting(true);
    try {
      const formData = new FormData();
      formData.append('jd', file);
      const response = await apiClient.post('/workspaces/parse-jd', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data?.success && response.data?.jd) {
        setProjectDetails(response.data.jd);
      }
    } catch (error) {
      console.error('Error extracting PDF:', error);
      alert('Failed to extract text from PDF.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddMember = () => {
    setMembers([...members, { name: "", email: "", role: "Editor", isLeader: false }]);
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 2) {
      const newMembers = [...members];
      newMembers.splice(index, 1);
      setMembers(newMembers);
    }
  };

  const updateMember = (index: number, field: keyof TeamMember, value: any) => {
    const newMembers = [...members];
    // @ts-ignore
    newMembers[index][field] = value;

    if (field === 'isLeader' && value === true) {
      // Uncheck others
      newMembers.forEach((m, i) => {
        if (i !== index) m.isLeader = false;
      });
    }
    setMembers(newMembers);
  };

  const handleCreateWorkspace = async () => {
    if (!user) return;

    setIsCreating(true);

    // 1. Create Workspace
    const payload = {
      name: workspaceName,
      userId: user.id,
      mainFocus: 'project-management',
      primaryHRNeed: 'Project Management', // Default for PM
      jd: projectDetails,
      requirements: [],
      table: {},
    };

    try {
      // Start minimum 5s timer
      const minDelayPromise = new Promise(resolve => setTimeout(resolve, 5000));

      const response = await apiClient.post('/workspaces', payload);
      const newWorkspace = response.data;

      // 2. Invite Members (if any)
      // Filter out empty members and the creator (if they added themselves)
      const membersToInvite = members.filter(m => m.email && m.email !== user.email);

      if (membersToInvite.length > 0) {
        // We do this sequentially or in parallel. Parallel is faster.
        await Promise.all(membersToInvite.map(async (member) => {
          if (!member.email) return;
          try {
            await apiClient.post(`/workspaces/${newWorkspace._id}/invite`, {
              email: member.email,
              role: member.role.toLowerCase(), // Ensure lowercase for API enum
              origin: window.location.origin
            });
          } catch (inviteError) {
            console.error(`Failed to invite ${member.email}:`, inviteError);
            // We continue even if one invite fails, but maybe show a toast?
          }
        }));
      }

      // 3. Refresh Context (React Query should handle this if we invalidate queries)
      await queryClient.invalidateQueries({ queryKey: workspaceKeys.lists() });

      // Wait for the remaining time of the 5s delay
      await minDelayPromise;

      // 4. Redirect
      router.push(`/pm/workspace/${newWorkspace._id}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
      setIsCreating(false);
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create workspace. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Grid3x3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">
              Supersheet <span className="text-blue-600">PM Setup</span>
            </span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold transition-colors ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                  {step}
                </div>
                <span className={`text-sm font-medium ${currentStep >= step ? 'text-blue-600' : 'text-slate-500'}`}>
                  {step === 1 ? 'Basics' : step === 2 ? 'Team' : 'Confirm'}
                </span>
                {step < 3 && <div className="w-12 h-0.5 bg-slate-200 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Workspace Basics */}
        {currentStep === 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Workspace Basics</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Workspace Name *</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Q4 Product Launch"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Project Details (PDF/Text)</label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-slate-400'
                    }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {isExtracting ? (
                    <p className="text-blue-600">Extracting text...</p>
                  ) : uploadedFile ? (
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="w-5 h-5" />
                      <span>{uploadedFile.name} uploaded</span>
                      <button onClick={() => { setUploadedFile(null); setProjectDetails(""); }} className="text-red-500 ml-2 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-slate-400" />
                      <p className="text-slate-600">Drag & drop or <label className="text-blue-600 cursor-pointer hover:underline">browse<input type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.docx" /></label></p>
                    </div>
                  )}
                </div>
                <textarea
                  value={projectDetails}
                  onChange={(e) => setProjectDetails(e.target.value)}
                  className="w-full mt-4 p-3 border border-slate-300 rounded-xl h-32 focus:ring-2 focus:ring-blue-500"
                  placeholder="Or paste details here..."
                />
              </div>
            </div>

            <div className="flex justify-end mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={!workspaceName.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Team Setup
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Team Setup */}
        {currentStep === 2 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Team Setup</h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Alpha Squad"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Team Members (Min 2)</label>
                <div className="space-y-4">
                  {members.map((member, index) => (
                    <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex-1 space-y-3">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => updateMember(index, 'name', e.target.value)}
                          placeholder="Name"
                          className="w-full p-2 border rounded-lg text-sm"
                        />
                        <input
                          type="email"
                          value={member.email}
                          onChange={(e) => updateMember(index, 'email', e.target.value)}
                          placeholder="Email"
                          className="w-full p-2 border rounded-lg text-sm"
                        />
                        <select
                          value={member.role}
                          onChange={(e) => updateMember(index, 'role', e.target.value)}
                          className="w-full p-2 border rounded-lg text-sm"
                        >
                          <option value="Editor">Editor</option>
                          <option value="Admin">Admin</option>
                          <option value="Viewer">Viewer</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-2 items-center pt-1">
                        <button
                          onClick={() => updateMember(index, 'isLeader', !member.isLeader)}
                          className={`p-2 rounded-full transition-colors ${member.isLeader ? 'bg-yellow-100 text-yellow-600' : 'text-slate-400 hover:bg-slate-200'}`}
                          title="Toggle Team Leader"
                        >
                          <Crown className="w-5 h-5" />
                        </button>
                        {members.length > 2 && (
                          <button
                            onClick={() => handleRemoveMember(index)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleAddMember}
                  className="mt-4 flex items-center gap-2 text-blue-600 font-medium hover:text-blue-700"
                >
                  <Plus className="w-4 h-4" /> Add Member
                </button>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentStep(1)} className="text-slate-600 font-medium hover:text-slate-800">Back</button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={!teamName || members.length < 2 || !members.some(m => m.isLeader)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Confirmation
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Confirm Details</h2>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase">Workspace</h3>
                  <p className="text-lg font-medium text-slate-800">{workspaceName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase">Team</h3>
                  <p className="text-lg font-medium text-slate-800">{teamName}</p>
                  <p className="text-sm text-slate-600">{members.length} members</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-500 uppercase">Leader</h3>
                  <p className="text-lg font-medium text-slate-800">{members.find(m => m.isLeader)?.name || "None"}</p>
                </div>
                {uploadedFile && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 uppercase">Project File</h3>
                    <p className="text-sm text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> {uploadedFile.name}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button onClick={() => setCurrentStep(2)} className="text-slate-600 font-medium hover:text-slate-800">Back</button>
              <button
                onClick={handleCreateWorkspace}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                Create Workspace
              </button>
            </div>
          </motion.div>
        )}
      </div>
      <MultiStepLoader loadingStates={loadingStates} loading={isCreating} duration={1000} />
    </div>
  );
}
