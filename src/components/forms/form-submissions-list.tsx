import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import { Submission } from "./types"

interface FormSubmissionsListProps {
    submissions: Submission[];
    onSelectSubmission: (submission: Submission) => void;
    onDeleteSubmission: (id: string) => void;
    isViewer?: boolean;
}

export function FormSubmissionsList({ submissions, onSelectSubmission, onDeleteSubmission, isViewer = false }: FormSubmissionsListProps) {
    return (
        <Card>
            <CardHeader className="p-4">
                <CardTitle className="text-sm">Candidate Submissions</CardTitle>
                <CardDescription className="text-xs">Click on a submission to view details</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
                {submissions.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-xs">Candidate</TableHead>
                                <TableHead className="text-xs">Status</TableHead>
                                <TableHead className="text-xs">Submitted At</TableHead>
                                <TableHead className="text-xs">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {submissions.map((submission) => (
                                <TableRow
                                    key={submission._id}
                                    className="cursor-pointer hover:bg-muted/50 text-xs"
                                    onClick={() => onSelectSubmission(submission)}
                                >
                                    <TableCell className="font-medium">
                                        {submission.extractedData ? (submission.extractedData.Name ? submission.extractedData.Name : 'Anonymous') : 'Anonymous'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={submission.status === 'Approved' ? 'default' : submission.status === 'Denied' ? 'destructive' : 'secondary'} className="text-[0.65rem]">
                                            {submission.status || 'Pending'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{new Date(submission.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-6 px-2 text-xs"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onSelectSubmission(submission)
                                                }}
                                            >
                                                View Details
                                            </Button>
                                            {!isViewer && (
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-6 px-2 text-xs"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onDeleteSubmission(submission._id)
                                                    }}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-sm text-muted-foreground">No submissions yet.</p>
                        <p className="mt-1.5 text-xs text-muted-foreground">Share the form link to start receiving applications.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
