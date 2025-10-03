"use client";

import { useState, Suspense } from "react";
import { motion } from "framer-motion";
import { Grid3x3, Upload, FileText, ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "@/utils/api.client";

function WorkspaceSetup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState<'workspace-name' | 'job-description'>('workspace-name');
  const [workspaceName, setWorkspaceName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleWorkspaceSubmit = () => {
    if (workspaceName.trim() && workspaceName.length >= 3) {
      setCurrentStep('job-description');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/plain' || file.type === 'application/pdf' || file.name.endsWith('.docx')) {
        setUploadedFile(file);
        // Read file content if it's a text file
        if (file.type === 'text/plain') {
          const reader = new FileReader();
          reader.onload = (e) => {
            setJobDescription(e.target?.result as string);
          };
          reader.readAsText(file);
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      // Read file content if it's a text file
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (e) => {
          setJobDescription(e.target?.result as string);
        };
        reader.readAsText(file);
      }
    }
  };

  const handleFinalSubmit = async () => {
    const workType = searchParams.get('workType');
    const hrOption = searchParams.get('hrOption');

    const payload = {
      name: workspaceName,
      mainFocus: workType,
      primaryHRNeed: hrOption,
      jd: jobDescription,
      requirements: [], // Sending empty array as per instruction
      table: {}, // Sending empty object as per instruction
    };

    try {
      const response = await apiClient.post('/api/workspaces', payload);
      const newWorkspace = response.data;
      router.push(`/workspace/${newWorkspace._id}`);
    } catch (error) {
      console.error('Error creating workspace:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Background Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0QjVTNjMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      
      <div className="relative max-w-3xl mx-auto px-4 py-12 sm:py-16">
        {/* Header with Enhanced Branding */}
        <div className="text-center mb-10">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center gap-3 mb-6"
          >
            {/* Logo Container: Gradient background #2563EB to #1D4ED8 */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              {/* Icon: White #FFFFFF */}
              <Grid3x3 className="w-5 h-5 text-white" />
            </div>
            {/* Brand Text: Primary #1E293B, Font weight 700 */}
            <span className="text-xl font-bold text-slate-800 tracking-tight">
              Supersheet <span className="text-blue-600">Hiring</span>
            </span>
          </motion.div>
          
          {/* Progress Indicator */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center justify-center gap-3"
          >
            {/* Step 1 Indicator */}
            <div className="flex flex-col items-center gap-2">
              {/* Active Step Circle: Gradient #3B82F6 to #2563EB, Shadow with 25% opacity */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep === 'workspace-name' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 ring-4 ring-blue-100' 
                  : 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/25'
              }`}>
                {/* Step Number/Checkmark: White #FFFFFF */}
                <span className="text-white text-sm font-semibold">
                  {currentStep === 'workspace-name' ? '1' : '✓'}
                </span>
              </div>
              {/* Step Label: Gray #64748B for inactive, Blue #3B82F6 for active */}
              <span className={`text-xs font-medium ${currentStep === 'workspace-name' ? 'text-blue-600' : 'text-slate-500'}`}>
                Workspace
              </span>
            </div>
            
            {/* Progress Connector Bar */}
            {/* Active: Gradient #3B82F6 to #2563EB, Inactive: #E2E8F0 */}
            <div className={`h-1 w-16 sm:w-24 rounded-full transition-all duration-500 ${currentStep === 'job-description' 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                : 'bg-slate-200'
            }`} />
            
            {/* Step 2 Indicator */}
            <div className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${currentStep === 'job-description' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25 ring-4 ring-blue-100' 
                  : 'bg-slate-200'
              }`}>
                <span className={`text-sm font-semibold ${currentStep === 'job-description' ? 'text-white' : 'text-slate-400'}`}>
                  2
                </span>
              </div>
              <span className={`text-xs font-medium ${currentStep === 'job-description' ? 'text-blue-600' : 'text-slate-500'}`}>
                Job Description
              </span>
            </div>
          </motion.div>
        </div>

        {/* Workspace Name Step */}
        {currentStep === 'workspace-name' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Title Section */}
            <div className="text-center space-y-3">
              {/* Primary Heading: Gradient text from #1E293B to #334155 */}
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                What's your workspace name?
              </h2>
              {/* Subtitle: Medium gray #64748B */}
              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
                This will be the name of your hiring workspace in Supersheet
              </p>
            </div>

            {/* Card Container */}
            {/* Background: White #FFFFFF, Border: Light gray #E2E8F0, Shadow: Black with 5% opacity + Blue accent with 5% opacity */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 backdrop-blur-sm">
              <div className="space-y-6">
                {/* Input Field Section */}
                <div>
                  {/* Label: Dark gray #334155, Font weight 600 */}
                  <label htmlFor="workspace-name" className="block text-sm font-semibold text-slate-700 mb-3">
                    Workspace Name *
                  </label>
                  
                  {/* Input Container with Icon */}
                  <div className="relative">
                    {/* Icon Container: Absolute positioned, Light gray #94A3B8 */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    
                    {/* Input Field */}
                    {/* Default: White #FFFFFF background, Border #CBD5E1, Text #1E293B */}
                    {/* Focus: Border #3B82F6, Ring #3B82F6 with 20% opacity, 4px ring */}
                    {/* Hover: Border #94A3B8 */}
                    <input
                      type="text"
                      id="workspace-name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="e.g., Tech Recruitment, HR Department, Hiring Team"
                      className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl 
                               focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 
                               hover:border-slate-400
                               transition-all duration-200 text-slate-800 text-base
                               placeholder:text-slate-400 bg-white"
                      autoFocus
                    />
                  </div>
                  
                  {/* Helper Text: Light gray #64748B */}
                  <p className="mt-2 text-sm text-slate-500">
                    Choose a descriptive name that reflects your team's purpose
                  </p>
                </div>

                {/* Character Counter */}
                {workspaceName && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg"
                  >
                    <span className="text-sm text-blue-700 font-medium">
                      {workspaceName.length} characters
                    </span>
                    {workspaceName.length < 3 && (
                      <span className="text-xs text-amber-600">
                        Minimum 3 characters recommended
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Action Buttons Row */}
                <div className="flex justify-between items-center pt-4">
                  {/* Back Button */}
                  {/* Default: Text #64748B, Background transparent */}
                  {/* Hover: Text #334155, Background #F1F5F9 */}
                  <button
                    onClick={() => router.push('/welcome')}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-lg
                             text-slate-600 hover:text-slate-800 hover:bg-slate-100
                             transition-all duration-200 font-medium"
                  >
                    {/* Icon transitions with parent */}
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back
                  </button>
                  
                  {/* Continue Button */}
                  {/* Enabled: Gradient #3B82F6 to #2563EB, Text white, Shadow blue with 30% opacity */}
                  {/* Hover: Gradient #2563EB to #1D4ED8, Shadow increases, Scale 1.02 */}
                  {/* Disabled: Background #E2E8F0, Text #94A3B8, No shadow, Cursor not-allowed */}
                  <button
                    onClick={handleWorkspaceSubmit}
                    disabled={!workspaceName.trim() || workspaceName.length < 3}
                    className="px-8 py-3.5 rounded-xl font-semibold text-white text-base
                             bg-gradient-to-r from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02]
                             disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500
                             disabled:cursor-not-allowed disabled:hover:scale-100
                             shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40
                             disabled:shadow-none
                             transition-all duration-200"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
            
            {/* Tips Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6"
            >
              <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Workspace Naming Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Use a clear, descriptive name (e.g., "Engineering Hiring 2025")</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Include the department or team if applicable</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>Keep it concise but meaningful for easy identification</span>
                </li>
              </ul>
            </motion.div>
          </motion.div>
        )}

        {/* Job Description Step */}
        {currentStep === 'job-description' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Title Section */}
            <div className="text-center space-y-3">
              {/* Primary Heading: Gradient text */}
              <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                Add your job description
              </h2>
              {/* Subtitle */}
              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto">
                Paste the job description or upload a file to get started
              </p>
            </div>

            {/* Main Card Container */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 backdrop-blur-sm">
              {/* Tab Navigation */}
              {/* Tab Container: Background white, Border bottom #E2E8F0 */}
              <div className="flex border-b border-slate-200 bg-slate-50">
                {/* Paste Text Tab */}
                {/* Active: Background white, Border bottom #3B82F6 (3px), Text #3B82F6 */}
                {/* Inactive: Background transparent, Text #64748B */}
                {/* Hover Inactive: Background #F8FAFC, Text #334155 */}
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setJobDescription('');
                  }}
                  className={`flex-1 py-4 px-6 text-sm font-semibold border-b-3 transition-all duration-200 ${!uploadedFile 
                      ? 'border-blue-500 text-blue-600 bg-white shadow-sm' 
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {/* Tab Icon: Inherits text color */}
                    <FileText className="w-5 h-5" />
                    <span>Paste Text</span>
                    {!uploadedFile && jobDescription && (
                      /* Active Indicator: Background #3B82F6, Text white */
                      <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </button>
                
                {/* Upload File Tab */}
                <button
                  className={`flex-1 py-4 px-6 text-sm font-semibold border-b-3 transition-all duration-200 ${uploadedFile 
                      ? 'border-blue-500 text-blue-600 bg-white shadow-sm' 
                      : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    <span>Upload File</span>
                    {uploadedFile && (
                      <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6 sm:p-8">
                {/* Text Area Section */}
                {!uploadedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    {/* Label */}
                    <div className="flex items-center justify-between">
                      <label htmlFor="job-description" className="block text-sm font-semibold text-slate-700">
                        Job Description *
                      </label>
                      {/* Character Counter: Gray #64748B */}
                      {jobDescription && (
                        <span className="text-xs text-slate-500 font-medium">
                          {jobDescription.length} characters
                        </span>
                      )}
                    </div>
                    
                    {/* Textarea */}
                    {/* Default: Background white, Border #CBD5E1, Text #1E293B */}
                    {/* Focus: Border #3B82F6, Ring #3B82F6 with 20% opacity */}
                    {/* Hover: Border #94A3B8 */}
                    <textarea
                      id="job-description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste your job description here...\n\nExample:\nWe are looking for a Senior Software Engineer to join our growing team. You will be responsible for developing scalable web applications, mentoring junior developers, and contributing to architectural decisions.\n\nRequirements:\n• 5+ years of experience in software development\n• Proficiency in React, Node.js, and TypeScript\n• Experience with cloud platforms (AWS, Azure, or GCP)\n• Strong communication skills\n\nBenefits:\n• Competitive salary and equity package\n• Remote-first culture\n• Health insurance and wellness programs"
                      rows={14}
                      className="w-full px-4 py-4 border-2 border-slate-300 rounded-xl 
                               focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 
                               hover:border-slate-400
                               transition-all duration-200 text-slate-800 text-sm leading-relaxed
                               placeholder:text-slate-400 bg-white resize-none
                               font-mono"
                    />
                    
                    {/* Format Tips */}
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-slate-500">Tip:</span>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                          Use bullet points •
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                          Clear sections
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200">
                          Include requirements
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* File Upload Section */}
                {!jobDescription && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Drop Zone Container */}
                    {/* Default: Border dashed #CBD5E1 (2px), Background white */}
                    {/* Drag Active: Border #3B82F6 (3px), Background #EFF6FF */}
                    {/* Hover: Border #94A3B8, Background #F8FAFC */}
                    <div
                      className={`relative border-2 border-dashed rounded-xl p-8 sm:p-12 text-center transition-all duration-300 ${dragActive 
                          ? 'border-blue-500 bg-blue-50 border-3' 
                          : 'border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      {uploadedFile ? (
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="space-y-4"
                        >
                          {/* Success Icon Container: Background gradient green */}
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          
                          {/* Success Message: Green #059669 */}
                          <p className="text-green-600 font-semibold text-lg">File uploaded successfully!</p>
                          
                          {/* File Info Card: Background #F0FDF4, Border #BBF7D0 */}
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                            <div className="flex items-center gap-3">
                              {/* File Icon: Green #059669 */}
                              <FileText className="w-6 h-6 text-green-600 flex-shrink-0" />
                              <div className="flex-1 text-left">
                                {/* Filename: Dark green #065F46 */}
                                <p className="text-sm font-medium text-green-800 truncate">{uploadedFile?.name}</p>
                                {/* File Size: Medium green #059669 */}
                                <p className="text-xs text-green-600">
                                  {uploadedFile ? (uploadedFile.size / 1024).toFixed(2) : '0'} KB
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          {/* Default: Text #DC2626, Background transparent */}
                          {/* Hover: Background #FEE2E2, Text #B91C1C */}
                          <button
                            onClick={() => {
                              setUploadedFile(null);
                              setJobDescription('');
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                          >
                            Remove file
                          </button>
                        </motion.div>
                      ) : (
                        /* Upload Prompt State */
                        <div className="space-y-4">
                          {/* Upload Icon Container */}
                          {/* Default: Background #F1F5F9, Icon #64748B */}
                          {/* Drag Active: Background #DBEAFE, Icon #3B82F6 */}
                          <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-300 ${dragActive 
                              ? 'bg-blue-100 scale-110' 
                              : 'bg-slate-200'
                          }`}>
                            <Upload className={`w-8 h-8 transition-colors duration-300 ${dragActive ? 'text-blue-600' : 'text-slate-500'}`} />
                          </div>
                          
                          {/* Upload Instructions */}
                          <div className="space-y-2">
                            {/* Primary Text: Slate #334155 */}
                            <p className="text-slate-700 font-medium">
                              <strong className="text-slate-800">Drag and drop</strong> your job description file here
                            </p>
                            
                            {/* Divider Text: Slate #64748B */}
                            <p className="text-slate-600 text-sm">or</p>
                            
                            {/* Browse Button */}
                            {/* Default: Text #3B82F6, Underline */}
                            {/* Hover: Text #2563EB, Background #EFF6FF */}
                            <label className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 font-semibold">
                              <Upload className="w-4 h-4" />
                              Browse files
                              <input
                                type="file"
                                accept=".txt,.pdf,.docx"
                                onChange={handleFileUpload}
                                className="hidden"
                              />
                            </label>
                          </div>
                          
                          {/* Supported Formats: Light gray #94A3B8 */}
                          <div className="pt-4 border-t border-slate-200">
                            <p className="text-xs text-slate-500 font-medium">
                              Supported formats
                            </p>
                            <div className="flex items-center justify-center gap-3 mt-2">
                              <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-full font-medium">
                                .TXT
                              </span>
                              <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-full font-medium">
                                .PDF
                              </span>
                              <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-full font-medium">
                                .DOCX
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-8 border-t border-slate-200 mt-8">
                  {/* Back Button */}
                  <button
                    onClick={() => setCurrentStep('workspace-name')}
                    className="group flex items-center gap-2 px-4 py-2.5 rounded-lg
                             text-slate-600 hover:text-slate-800 hover:bg-slate-100
                             transition-all duration-200 font-medium"
                  >
                    <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                    Back
                  </button>
                  
                  {/* Create Workspace Button */}
                  <button
                    onClick={handleFinalSubmit}
                    disabled={!jobDescription.trim() && !uploadedFile}
                    className="px-8 py-3.5 rounded-xl font-semibold text-white text-base
                             bg-gradient-to-r from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700 hover:scale-[1.02]
                             disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500
                             disabled:cursor-not-allowed disabled:hover:scale-100
                             shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40
                             disabled:shadow-none
                             transition-all duration-200"
                  >
                    Create Workspace →
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function WorkspaceSetupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WorkspaceSetup />
        </Suspense>
    )
}
