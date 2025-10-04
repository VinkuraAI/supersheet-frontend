'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/utils/api.client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, FileText, Upload, Calendar, Briefcase, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormField {
  id: string;
  type: 'text' | 'multiple-choice';
  question: string;
  placeholder?: string;
  options?: string[];
}

interface FormData {
  _id: string;
  title: string;
  description: string;
  fields: FormField[];
}

export default function CandidateFormPage() {
  const params = useParams();
  const formId = params.formId as string;
  const router = useRouter();

  const [form, setForm] = useState<FormData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [resume, setResume] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (formId) {
      const fetchForm = async () => {
        setIsLoading(true);
        try {
          const response = await apiClient.get(`/api/forms/${formId}/view`);
          setForm(response.data);
        } catch (err) {
          setError('Failed to load the form. It may no longer be available.');
        }
        setIsLoading(false);
      };
      fetchForm();
    }
  }, [formId]);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      const redirectTimeout = setTimeout(() => {
        router.push('/');
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(redirectTimeout);
      };
    }
  }, [submitSuccess, router]);

  const handleAnswerChange = (fieldId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!resume) {
      alert('A resume is required.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    Object.entries(answers).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('resume', resume);

    try {
      await apiClient.post(`/api/forms/${formId}/submissions`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmitSuccess(true);
    } catch (err) {
      setError('Failed to submit the form. Please try again later.');
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0QjVTNjMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 relative z-10"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto" />
          </motion.div>
          <p className="text-slate-600 font-medium">Loading your application form...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0QjVTNjMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10"
        >
          <Card className="w-full max-w-md border-2 border-red-200 shadow-xl">
            <CardContent className="pt-8 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Oops! Something went wrong</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden p-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0QjVTNjMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        
        {/* Confetti Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 pointer-events-none"
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -100, 
                x: Math.random() * window.innerWidth,
                rotate: 0,
                opacity: 1
              }}
              animate={{ 
                y: window.innerHeight + 100,
                rotate: Math.random() * 720,
                opacity: 0
              }}
              transition={{ 
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: "easeOut"
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)]
              }}
            />
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="relative z-10"
        >
          <Card className="w-full max-w-lg border-2 border-green-200 shadow-2xl">
            <CardContent className="pt-12 pb-8 text-center space-y-6">
              {/* Success Icon with Animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, type: "spring", bounce: 0.5, delay: 0.2 }}
                className="relative"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 bg-green-200 rounded-full blur-xl opacity-50"
                />
                <div className="relative w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <CheckCircle className="h-12 w-12 text-white" strokeWidth={3} />
                </div>
              </motion.div>

              {/* Success Message */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="space-y-3"
              >
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Application Submitted!
                </h2>
                <p className="text-slate-600 text-lg">
                  Thank you for your interest in joining our team.
                </p>
                <p className="text-sm text-slate-500">
                  We've received your application and will review it carefully. 
                  You'll hear from us soon!
                </p>
              </motion.div>

              {/* Countdown Timer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="pt-4 border-t border-slate-200"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <motion.span
                      key={countdown}
                      initial={{ scale: 1.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-blue-600 font-bold text-lg"
                    >
                      {countdown}
                    </motion.span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Redirecting to home page...
                  </p>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM0QjVTNjMiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      
      <div className="relative z-10 p-4 sm:p-8 py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto mb-8 text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4 px-4 py-2 bg-white border border-slate-200 rounded-full shadow-sm">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-slate-700">Job Application</span>
          </div>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="border-2 border-slate-200 shadow-2xl shadow-slate-300/50 overflow-hidden">
            {/* Card Header with Gradient */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00ek0xMiAxNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptMCAyNGMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
              
              <div className="relative z-10">
                <motion.h1
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-3xl sm:text-4xl font-bold mb-3"
                >
                  {form?.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="text-blue-100 text-lg"
                >
                  {form?.description}
                </motion.p>
              </div>
            </div>

            <CardContent className="p-8 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                <AnimatePresence>
                  {form?.fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.5 }}
                      className="space-y-3"
                    >
                      <Label className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <span className="flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                          {index + 1}
                        </span>
                        {field.question}
                        <span className="text-red-500">*</span>
                      </Label>
                      
                      {field.type === 'text' && (
                        <Input
                          type="text"
                          placeholder={field.placeholder}
                          onChange={e => handleAnswerChange(field.id, e.target.value)}
                          required
                          className="text-base py-6 border-2 border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all"
                        />
                      )}
                      
                      {field.type === 'multiple-choice' && field.options && (
                        <RadioGroup 
                          onValueChange={value => handleAnswerChange(field.id, value)} 
                          required
                          className="space-y-3"
                        >
                          {field.options.map((option, optIndex) => (
                            <motion.div
                              key={optIndex}
                              whileHover={{ scale: 1.01, x: 5 }}
                              className="flex items-center space-x-3 p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer group"
                            >
                              <RadioGroupItem 
                                value={option} 
                                id={`${field.id}-${optIndex}`}
                                className="w-5 h-5 border-2"
                              />
                              <Label 
                                htmlFor={`${field.id}-${optIndex}`}
                                className="flex-1 cursor-pointer text-base text-slate-700 group-hover:text-blue-700 transition-colors"
                              >
                                {option}
                              </Label>
                            </motion.div>
                          ))}
                        </RadioGroup>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Resume Upload Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (form?.fields.length || 0), duration: 0.5 }}
                  className="space-y-3 pt-4 border-t-2 border-slate-200"
                >
                  <Label htmlFor="resume" className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Upload Your Resume
                    <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-sm text-slate-500">Please upload your resume in PDF format (max 5MB)</p>
                  
                  <div className="relative">
                    <Input 
                      id="resume" 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange} 
                      required
                      className="hidden"
                    />
                    <label 
                      htmlFor="resume"
                      className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                    >
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      {resume ? (
                        <div className="text-center">
                          <p className="text-green-600 font-semibold flex items-center gap-2 justify-center">
                            <CheckCircle className="w-5 h-5" />
                            {resume.name}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">Click to change file</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-slate-700 font-medium mb-1">Click to upload or drag and drop</p>
                          <p className="text-sm text-slate-500">PDF only (max 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * (form?.fields.length || 0), duration: 0.5 }}
                  className="pt-6"
                >
                  <Button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="w-full py-6 text-lg font-semibold
                             bg-gradient-to-r from-blue-500 to-blue-600
                             hover:from-blue-600 hover:to-blue-700 hover:scale-[1.01]
                             shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-600/40
                             transition-all duration-200
                             disabled:from-slate-400 disabled:to-slate-400 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Submitting Application...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Submit Application
                        <motion.svg
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </motion.svg>
                      </span>
                    )}
                  </Button>
                  
                  <p className="text-center text-sm text-slate-500 mt-4">
                    By submitting this form, you agree to our terms and privacy policy
                  </p>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="max-w-3xl mx-auto mt-8 text-center"
        >
          <p className="text-sm text-slate-500">
            Powered by <span className="font-semibold text-blue-600">Supersheet</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
