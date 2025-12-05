import { Button } from "@/components/ui/button"
import { CheckCircle, Link as LinkIcon, Check } from "lucide-react"
import { useState } from "react"

interface FormSuccessStateProps {
    shareableLink: string;
    onViewSubmissions: () => void;
}

export function FormSuccessState({ shareableLink, onViewSubmissions }: FormSuccessStateProps) {
    const [isCopied, setIsCopied] = useState(false);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareableLink);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-background p-6 flex items-center justify-center">
            <div className="text-center max-w-xl">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h1 className="text-2xl font-bold mb-1.5">Form Created Successfully!</h1>
                <p className="text-muted-foreground mb-4 text-xs">Your form is now live and ready to be shared with candidates.</p>
                <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-3">
                    <LinkIcon className="h-4 w-4 text-gray-500" />
                    <input type="text" readOnly value={shareableLink} className="bg-transparent outline-none w-full text-gray-800 text-xs" />
                    <Button onClick={handleCopyLink} className="h-7 px-2 text-xs">
                        {isCopied ? <Check className="h-3 w-3" /> : "Copy Link"}
                    </Button>
                </div>
                <Button variant="outline" className="mt-6 h-7 px-2 text-xs" onClick={onViewSubmissions}>View Submissions</Button>
            </div>
        </div>
    )
}
