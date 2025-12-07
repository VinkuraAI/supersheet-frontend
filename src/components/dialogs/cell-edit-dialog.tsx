import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CellEditDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialValue: string;
    columnName: string;
    onSave: (value: string) => void;
}

export function CellEditDialog({
    open,
    onOpenChange,
    initialValue,
    columnName,
    onSave,
}: CellEditDialogProps) {
    const [value, setValue] = useState(initialValue);

    // Update local state when dialog opens or initialValue changes
    useEffect(() => {
        if (open) {
            setValue(initialValue || "");
        }
    }, [open, initialValue]);

    const handleSave = () => {
        onSave(value);
        onOpenChange(false);
    };

    const isLongText = value.length > 50 || value.includes("\n");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit {columnName}</DialogTitle>
                    <DialogDescription>
                        Make changes to the cell content here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="cell-value" className="text-sm font-medium">
                            Content
                        </Label>
                        {isLongText || columnName === "Notes" || columnName === "Feedback" ? (
                            <Textarea
                                id="cell-value"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="min-h-[100px]"
                            />
                        ) : (
                            <Input
                                id="cell-value"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSave();
                                    }
                                }}
                            />
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
