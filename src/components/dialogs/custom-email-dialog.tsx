"use client";

import React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CustomEmailDialog({
  open,
  onOpenChange,
  children,
}: CustomEmailDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        {/* Overlay */}
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/80",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        
        {/* Content - Full screen with 2rem padding */}
        <DialogPrimitive.Content
          className={cn(
            "fixed z-50",
            "left-8 right-8 top-8 bottom-8",
            "bg-white rounded-lg shadow-2xl",
            "flex flex-col",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          )}
          style={{
            margin: 0,
            width: "calc(100vw - 4rem)",
            height: "calc(100vh - 4rem)",
          }}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

interface CustomEmailDialogHeaderProps {
  children: React.ReactNode;
  onClose: () => void;
}

export function CustomEmailDialogHeader({
  children,
  onClose,
}: CustomEmailDialogHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-white rounded-t-lg">
      <DialogPrimitive.Title className="text-xl font-semibold text-slate-900">
        {children}
      </DialogPrimitive.Title>
      <button
        onClick={onClose}
        className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      >
        <X className="h-5 w-5" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  );
}

interface CustomEmailDialogBodyProps {
  children: React.ReactNode;
}

export function CustomEmailDialogBody({ children }: CustomEmailDialogBodyProps) {
  return (
    <div className="flex-1 overflow-hidden">
      {children}
    </div>
  );
}
