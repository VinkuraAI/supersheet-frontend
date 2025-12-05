import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, FileUp } from "lucide-react"
import { Submission, FormField } from "./types"

interface SubmissionDetailsDialogProps {
    submission: Submission | null;
    isOpen: boolean;
    onClose: () => void;
    fields: FormField[];
    onApprove: (id: string) => void;
    onDeny: (id: string) => void;
    isViewer?: boolean;
}

const formatExperience = (yearsDecimal: number) => {
    if (!yearsDecimal || yearsDecimal <= 0) return "No experience listed";
    const totalMonths = Math.round(yearsDecimal * 12);
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) result += `${months} month${months > 1 ? 's' : ''}`;
    return result.trim() || "Less than a month";
};

export function SubmissionDetailsDialog({
    submission,
    isOpen,
    onClose,
    fields,
    onApprove,
    onDeny,
    isViewer = false
}: SubmissionDetailsDialogProps) {
    if (!submission) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle className="text-sm">Submission Details</DialogTitle>
                    <DialogDescription className="text-xs">Review the candidate&apos;s application</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-3">
                    {submission.extractedData ? (
                        <>
                            <div>
                                <h2 className="text-lg font-bold text-primary">{submission.extractedData.Name}</h2>
                                <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground mt-1.5">
                                    <div className="flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        <a href={`mailto:${submission.extractedData.Email}`} className="hover:underline">{submission.extractedData.Email}</a>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        <span>{submission.extractedData.Phone}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-2 text-xs">Skills</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {submission.extractedData.Skills.split(',').map((skill) => (
                                        <Badge key={skill.trim()} variant="secondary" className="font-normal text-[0.65rem]"> {skill.trim()}</Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
                                <div>
                                    <h3 className="font-semibold mb-1.5 text-xs">Experience</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {formatExperience(submission.extractedData.Experience)}
                                    </p>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-1.5 text-xs">Education</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {submission.extractedData.Education}
                                    </p>
                                </div>
                            </div>

                            <details className="pt-1.5">
                                <summary className="cursor-pointer text-xs font-medium">View Original Form Answers</summary>
                                <div className="space-y-3 mt-3">
                                    {Object.entries(submission.candidateData).map(([fieldId, answer]) => (
                                        <div key={fieldId} className="rounded-lg border bg-muted/50 p-2">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                {fields.find((f) => f.id === fieldId)?.question || "Question"}
                                            </p>
                                            <p className="mt-0.5 text-xs">{answer as string}</p>
                                        </div>
                                    ))}
                                </div>
                            </details>
                        </>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground text-xs">No AI-extracted data available for this submission.</p>
                        </div>
                    )}

                    {submission.resumeUrl && (
                        <div className="flex justify-end pt-3">
                            <Button variant="outline" size="sm" className="h-6 px-2 text-xs" asChild>
                                <a href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/${submission.resumeUrl}`} target="_blank" rel="noopener noreferrer">
                                    <FileUp className="mr-1.5 h-3 w-3" />
                                    View Original Resume
                                </a>
                            </Button>
                        </div>
                    )}

                    <DialogFooter>
                        {(!submission.status || submission.status === 'Pending') ? (
                            !isViewer && (
                                <>
                                    <Button variant="outline" className="h-7 px-2 text-xs" onClick={() => onDeny(submission._id)}>Deny</Button>
                                    <Button className="h-7 px-2 text-xs" onClick={() => onApprove(submission._id)}>Approve</Button>
                                </>
                            )
                        ) : (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Status:</span>
                                <Badge variant={submission.status === 'Approved' ? 'default' : 'destructive'}>
                                    {submission.status}
                                </Badge>
                            </div>
                        )}
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
