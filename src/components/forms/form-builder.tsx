import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Trash2, GripVertical, FileUp } from "lucide-react"
import { FormField, FieldType } from "./types"

interface FormBuilderProps {
    initialTitle?: string;
    initialDescription?: string;
    initialFields?: FormField[];
    onSave: (form: { title: string; description: string; fields: FormField[] }) => void;
}

export function FormBuilder({
    initialTitle = "Job Application Form",
    initialDescription = "Please fill out the form below to apply for the job.",
    initialFields = [],
    onSave
}: FormBuilderProps) {
    const [formTitle, setFormTitle] = useState(initialTitle)
    const [formDescription, setFormDescription] = useState(initialDescription)
    const [fields, setFields] = useState<FormField[]>(initialFields.length > 0 ? initialFields : [
        {
            id: `field-${Date.now()}`,
            type: "text",
            question: "Full Name",
            placeholder: "Enter your full name",
        },
    ])
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const handleAddField = (type: FieldType) => {
        const newField: FormField = {
            id: `field-${Date.now()}`,
            type,
            question: "Untitled Question",
            placeholder: type === "text" ? "Your answer" : undefined,
            options: type === "multiple-choice" ? ["Option 1"] : undefined,
        }
        setFields([...fields, newField])
    }

    const handleUpdateField = (id: string, updates: Partial<FormField>) => {
        setFields(fields.map((field) => (field.id === id ? { ...field, ...updates } : field)))
    }

    const handleDeleteField = (id: string) => {
        setFields(fields.filter((field) => field.id !== id))
    }

    const handleAddOption = (fieldId: string) => {
        setFields(
            fields.map((field) => {
                if (field.id === fieldId && field.options) {
                    return {
                        ...field,
                        options: [...field.options, `Option ${field.options.length + 1}`],
                    }
                }
                return field
            }),
        )
    }

    const handleUpdateOption = (fieldId: string, optionIndex: number, newValue: string) => {
        setFields(
            fields.map((field) => {
                if (field.id === fieldId && field.options) {
                    const newOptions = [...field.options]
                    newOptions[optionIndex] = newValue
                    return { ...field, options: newOptions }
                }
                return field
            }),
        )
    }

    const handleDeleteOption = (fieldId: string, optionIndex: number) => {
        setFields(
            fields.map((field) => {
                if (field.id === fieldId && field.options && field.options.length > 1) {
                    return {
                        ...field,
                        options: field.options.filter((_, index) => index !== optionIndex),
                    }
                }
                return field
            }),
        )
    }

    const handleConfirmForm = () => {
        setShowConfirmDialog(true)
    }

    const handleFinalizeForm = () => {
        onSave({
            title: formTitle,
            description: formDescription,
            fields: fields,
        })
        setShowConfirmDialog(false)
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-3xl">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-lg font-bold">Build Your Job Application Form</h1>
                    <Button onClick={handleConfirmForm} className="bg-primary hover:bg-primary/90 h-7 px-2 text-xs">
                        Confirm Form
                    </Button>
                </div>

                <div className="space-y-3">
                    <Card>
                        <CardContent className="pt-4">
                            <div className="space-y-3">
                                <div>
                                    <Label className="text-[0.65rem] text-muted-foreground">Form Title</Label>
                                    <Input
                                        value={formTitle}
                                        onChange={(e) => setFormTitle(e.target.value)}
                                        className="mt-0.5 font-medium text-sm"
                                        placeholder="Enter form title"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[0.65rem] text-muted-foreground">Form Description</Label>
                                    <Input
                                        value={formDescription}
                                        onChange={(e) => setFormDescription(e.target.value)}
                                        className="mt-0.5 text-xs"
                                        placeholder="Enter form description"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {fields.map((field) => (
                        <Card key={field.id} className="relative">
                            <CardContent className="pt-4">
                                <div className="mb-3 flex items-start gap-3">
                                    <GripVertical className="mt-1.5 h-4 w-4 text-muted-foreground" />
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <Label className="text-[0.65rem] text-muted-foreground">Question</Label>
                                            <Input
                                                value={field.question}
                                                onChange={(e) => handleUpdateField(field.id, { question: e.target.value })}
                                                className="mt-0.5 font-medium text-xs"
                                                placeholder="Enter your question"
                                            />
                                        </div>

                                        {field.type === "text" && (
                                            <div>
                                                <Label className="text-[0.65rem] text-muted-foreground">Placeholder</Label>
                                                <Input
                                                    value={field.placeholder || ""}
                                                    onChange={(e) => handleUpdateField(field.id, { placeholder: e.target.value })}
                                                    className="mt-0.5 text-xs"
                                                    placeholder="Enter placeholder text"
                                                />
                                            </div>
                                        )}

                                        {field.type === "multiple-choice" && (
                                            <div>
                                                <Label className="text-[0.65rem] text-muted-foreground">Options</Label>
                                                <RadioGroup className="mt-1.5 space-y-1.5">
                                                    {field.options?.map((option, optionIndex) => (
                                                        <div key={optionIndex} className="flex items-center gap-1.5">
                                                            <RadioGroupItem value={option} disabled className="h-3 w-3" />
                                                            <Input
                                                                value={option}
                                                                onChange={(e) => handleUpdateOption(field.id, optionIndex, e.target.value)}
                                                                className="flex-1 text-xs h-7"
                                                            />
                                                            {field.options && field.options.length > 1 && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => handleDeleteOption(field.id, optionIndex)}
                                                                    className="h-7 w-7"
                                                                >
                                                                    <Trash2 className="h-3 w-3 text-destructive" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </RadioGroup>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAddOption(field.id)}
                                                    className="mt-1.5 h-7 px-2 text-xs"
                                                >
                                                    <Plus className="mr-1.5 h-3 w-3" />
                                                    Add Option
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteField(field.id)}
                                        className="text-destructive hover:text-destructive h-7 w-7"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    <Card className="border-primary/50 bg-primary/5">
                        <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                                <FileUp className="mt-1.5 h-4 w-4 text-primary" />
                                <div className="flex-1">
                                    <Label className="font-medium text-xs">Resume Upload (Required)</Label>
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                        This field is mandatory and cannot be removed. Candidates will upload their resume here.
                                    </p>
                                </div>
                                <Badge variant="secondary">Fixed</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-1.5">
                        <Button variant="outline" onClick={() => handleAddField("text")} className="flex-1 h-7 px-2 text-xs">
                            <Plus className="mr-1.5 h-3 w-3" />
                            Add Text Field
                        </Button>
                        <Button variant="outline" onClick={() => handleAddField("multiple-choice")} className="flex-1 h-7 px-2 text-xs">
                            <Plus className="mr-1.5 h-3 w-3" />
                            Add Multiple Choice
                        </Button>
                    </div>
                </div>
            </div>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Form Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to confirm? In the free plan, you cannot edit this form after submission.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleFinalizeForm}>Confirm</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
