export type FieldType = "text" | "multiple-choice"

export interface FormField {
    id: string
    type: FieldType
    question: string
    placeholder?: string
    options?: string[]
}

export interface Submission {
    _id: string
    candidateData: Record<string, string>
    resumeUrl: string;
    createdAt: string;
    status?: 'Pending' | 'Approved' | 'Denied';
    extractedData?: {
        Name: string;
        Email: string;
        Phone: string;
        Skills: string;
        Experience: number;
        Education: string;
    }
}
