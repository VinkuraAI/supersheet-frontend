'use client'

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/utils/api.client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle } from 'lucide-react';

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (submitSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-lg text-center p-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl mb-2">Submission Successful!</CardTitle>
            <CardDescription>Your application has been submitted. Thank you for your interest.</CardDescription>
            <p className="text-sm text-muted-foreground mt-4">Redirecting to home page in {countdown} seconds...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">{form?.title}</CardTitle>
            <CardDescription className="text-base">{form?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {form?.fields.map(field => (
                <div key={field.id} className="space-y-2">
                  <Label className="text-lg font-medium">{field.question}</Label>
                  {field.type === 'text' && (
                    <Input
                      type="text"
                      placeholder={field.placeholder}
                      onChange={e => handleAnswerChange(field.id, e.target.value)}
                      required
                    />
                  )}
                  {field.type === 'multiple-choice' && field.options && (
                    <RadioGroup onValueChange={value => handleAnswerChange(field.id, value)} required>
                      <div className="space-y-2">
                        {field.options.map((option, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                            <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  )}
                </div>
              ))}

              <div className="space-y-2">
                <Label htmlFor="resume" className="text-lg font-medium">Resume (PDF only)</Label>
                <Input id="resume" type="file" accept=".pdf" onChange={handleFileChange} required />
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
