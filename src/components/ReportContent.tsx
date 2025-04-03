
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Shield, AlertTriangle, Info } from "lucide-react";
import { reportContent } from "@/utils/moderationService";
import { useToast } from "@/hooks/use-toast";

interface ReportContentProps {
  contentId: string;
  contentType: 'doodle' | 'story';
  isOpen: boolean;
  onClose: () => void;
}

const ReportContent: React.FC<ReportContentProps> = ({ contentId, contentType, isOpen, onClose }) => {
  const [reason, setReason] = useState<string>('inappropriate');
  const [details, setDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmittedBefore, setHasSubmittedBefore] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        title: "Please select a reason",
        description: "You need to select a reason for your report",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await reportContent(contentId, contentType, reason, details);
      
      if (success) {
        toast({
          title: "Report submitted",
          description: "Thank you for helping keep our community safe. Our team will review the content promptly.",
          variant: "success",
          duration: 5000,
        });
        onClose();
      } else {
        // Check if failure is due to already reported content
        setHasSubmittedBefore(true);
        toast({
          title: "Already reported",
          description: "You have already reported this content. Thank you for your vigilance.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error submitting report",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" />
            Report {contentType === 'doodle' ? 'Doodle' : 'Story'}
          </DialogTitle>
        </DialogHeader>
        
        {hasSubmittedBefore ? (
          <div className="space-y-4 my-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800 flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">You've already reported this content</p>
                <p className="mt-1">Our moderation team has been notified and will review this content. Thank you for helping keep our community safe.</p>
              </div>
            </div>
            <Button onClick={onClose} className="w-full">Close</Button>
          </div>
        ) : (
          <div className="space-y-4 my-2">
            <div>
              <Label className="text-base font-medium">Reason for reporting</Label>
              <RadioGroup value={reason} onValueChange={setReason} className="mt-2 space-y-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inappropriate" id="inappropriate" />
                  <Label htmlFor="inappropriate">Inappropriate content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="explicit" id="explicit" />
                  <Label htmlFor="explicit">Explicit/sexual content</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="harassment" id="harassment" />
                  <Label htmlFor="harassment">Harassment or bullying</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="violence" id="violence" />
                  <Label htmlFor="violence">Violence or harm</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea 
                id="details" 
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Please provide any additional information that might help us understand the issue"
                className="mt-1"
              />
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Our moderation policy:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>All reports are reviewed by our moderation team</li>
                  <li>Content with 3+ reports is automatically hidden pending review</li>
                  <li>We aim to review all reports within 24 hours</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {!hasSubmittedBefore && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReportContent;
