"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MailConsentProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSend: () => void;
    onDontSend: () => void;
}

export function MailConsent({
    open,
    onOpenChange,
    onSend,
    onDontSend,
}: MailConsentProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Send Mail?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Do you want to send an email to the candidate?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onDontSend}>Don&apos;t Send</AlertDialogCancel>
                    <AlertDialogAction onClick={onSend}>Send Mail</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
