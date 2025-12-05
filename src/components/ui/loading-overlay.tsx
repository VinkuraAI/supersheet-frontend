import React from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoadingOverlayProps {
    isVisible: boolean;
    message?: string;
    subMessage?: string;
}

export function LoadingOverlay({ isVisible, message = "Loading...", subMessage }: LoadingOverlayProps) {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-sm w-full text-center"
            >
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-800">{message}</h3>
                    {subMessage && (
                        <p className="text-sm text-slate-500">{subMessage}</p>
                    )}
                </div>

                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 4.5, ease: "easeInOut" }}
                        className="h-full bg-blue-600 rounded-full"
                    />
                </div>
            </motion.div>
        </div>
    );
}
