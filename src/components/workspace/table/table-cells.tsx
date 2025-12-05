"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { MailConsent } from "./mail-consent";

// Status options with colors - matches backend email system
export const STATUS_OPTIONS = [
    { value: "New", color: "bg-blue-100 text-blue-700 border-blue-200" },
    { value: "Shortlisted", color: "bg-purple-100 text-purple-700 border-purple-200" },
    { value: "Interviewed", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
    { value: "Rejected", color: "bg-red-100 text-red-700 border-red-200" },
    { value: "Hired", color: "bg-green-100 text-green-700 border-green-200" },
    { value: "Archived", color: "bg-gray-100 text-gray-700 border-gray-200" },
];

// Get feedback based on AI score
export function getFeedbackFromScore(score: number): { text: string; color: string } {
    if (score >= 90) {
        return {
            text: "Excellent match, highly recommended",
            color: "bg-green-100 text-green-800 border-green-300"
        };
    } else if (score >= 75) {
        return {
            text: "Good match, recommended",
            color: "bg-blue-100 text-blue-800 border-blue-300"
        };
    } else if (score >= 60) {
        return {
            text: "Moderate match, consider",
            color: "bg-yellow-100 text-yellow-800 border-yellow-300"
        };
    } else if (score >= 40) {
        return {
            text: "Weak match, gaps in requirements",
            color: "bg-orange-100 text-orange-800 border-orange-300"
        };
    } else {
        return {
            text: "Poor match, not recommended",
            color: "bg-red-100 text-red-800 border-red-300"
        };
    }
}

// Feedback Cell Component
export function FeedbackCell({ aiScore }: { aiScore: number }) {
    const feedback = getFeedbackFromScore(aiScore || 0);

    return (
        <div className={`px-2 py-1 rounded border text-xs font-medium whitespace-normal break-words ${feedback.color}`}>
            {feedback.text}
        </div>
    );
}

export function InformedCell({
    value,
    onChange,
    rowData,
}: {
    value: string;
    onChange: (newValue: string) => void;
    rowData: any;
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    if (value === 'Informed') {
        return <Badge variant="secondary">Informed</Badge>;
    }

    const handleInform = () => {
        if (!rowData.Name || !rowData.Email) {
            alert("Please fill in the candidate's Name and Email before sending a mail.");
            return;
        }
        setIsDialogOpen(true);
    };

    const handleSendMail = () => {
        onChange('Informed');
        setIsDialogOpen(false);
    };

    return (
        <>
            <Select onValueChange={handleInform}>
                <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Not Informed" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="inform" className="text-xs text-green-600">
                        Informed
                    </SelectItem>
                </SelectContent>
            </Select>
            <MailConsent
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onSend={handleSendMail}
                onDontSend={() => setIsDialogOpen(false)}
            />
        </>
    );
}

// Status Cell Component
export function StatusCell({
    value,
    onChange,
    disabled,
}: {
    value: string;
    onChange: (newValue: string) => void;
    disabled?: boolean;
}) {
    const currentStatus = STATUS_OPTIONS.find(opt => opt.value === value) || STATUS_OPTIONS[0];

    return (
        <Select value={value || "New"} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger
                className={`h-7 text-xs border ${currentStatus.color} font-medium`}
            >
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                    <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-xs"
                    >
                        <div className={`px-2 py-1 rounded ${option.color}`}>
                            {option.value}
                        </div>
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

// Helper function to format cell content with proper spacing
export function formatCellContent(content: any): string {
    // Handle null, undefined, or empty values
    if (content === null || content === undefined || content === "") return "";

    // Convert to string if it's not already
    const contentStr = String(content);

    // Handle arrays stored as strings (e.g., "skill1,skill2,skill3")
    if (contentStr.includes(",")) {
        return contentStr.split(",").map(item => item.trim()).join(", ");
    }

    // Handle JSON arrays
    try {
        const parsed = JSON.parse(contentStr);
        if (Array.isArray(parsed)) {
            return parsed.join(", ");
        }
    } catch (e) {
        // Not JSON, continue with string
    }

    return contentStr;
}

// Truncated Cell Component with Popover
export function TruncatedCell({
    content,
    onDoubleClick,
}: {
    content: any;
    onDoubleClick?: () => void;
}) {
    const formattedContent = formatCellContent(content);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div
                    className="cursor-pointer hover:text-primary hover:underline truncate w-full text-left"
                    onDoubleClick={onDoubleClick}
                    title={formattedContent}
                >
                    {formattedContent}
                </div>
            </PopoverTrigger>
            <PopoverContent className="max-w-md p-4" side="top">
                <div className="text-sm whitespace-pre-wrap break-words">{formattedContent}</div>
            </PopoverContent>
        </Popover>
    );
}
