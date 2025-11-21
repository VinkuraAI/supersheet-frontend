import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"

interface FormEmptyStateProps {
    onCreateForm: () => void;
    isViewer?: boolean;
}

export function FormEmptyState({ onCreateForm, isViewer = false }: FormEmptyStateProps) {
    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-3xl">
                <div className="mb-4">
                    {!isViewer && (
                        <Button onClick={onCreateForm} className="bg-primary hover:bg-primary/90 h-7 px-2 text-xs">
                            <Plus className="mr-1.5 h-3 w-3" />
                            Create Form
                        </Button>
                    )}
                </div>
                <Card className="border-2 border-dashed">
                    <CardContent className="flex min-h-[300px] items-center justify-center">
                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">You haven&apos;t created a form for this workspace yet.</p>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                                Click the &quot;Create Form&quot; button above to get started.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
