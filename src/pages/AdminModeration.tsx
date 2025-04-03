
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ContentReport } from '@/types/doodle';
import { 
  getReports, 
  updateReportStatus, 
  updateContentModerationStatus,
  getModerationGuide 
} from '@/utils/moderationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { 
  ShieldAlert, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  Check, 
  X,
  HelpCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const AdminModeration: React.FC = () => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed' | 'resolved'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const moderationGuide = getModerationGuide();

  useEffect(() => {
    // Update the page title when this component mounts
    document.title = "Bomma | Content Moderation";
    
    // Restore the original title when component unmounts
    return () => {
      document.title = "Bomma";
    };
  }, []);

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const reportData = await getReports(activeTab);
      setReports(reportData);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error loading reports",
        description: "Could not load moderation reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewReport = (reportId: string) => {
    toast({
      title: "Feature coming soon",
      description: "The full moderation review interface is under development",
    });
  };
  
  const handleMarkAsReviewed = async (report: ContentReport) => {
    try {
      const success = await updateReportStatus(report.id, 'reviewed');
      if (success) {
        toast({
          title: "Report marked as reviewed",
          description: "The report has been moved to the Under Review tab",
          variant: "success",
        });
        loadReports();
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Error updating report",
        description: "Could not update report status",
        variant: "destructive",
      });
    }
  };
  
  const handleApproveContent = async (report: ContentReport) => {
    try {
      // Update the content moderation status
      const contentSuccess = await updateContentModerationStatus(
        report.contentId, 
        report.contentType, 
        'approved'
      );
      
      // Mark the report as resolved
      const reportSuccess = await updateReportStatus(report.id, 'resolved');
      
      if (contentSuccess && reportSuccess) {
        toast({
          title: "Content approved",
          description: "The content has been approved and the report resolved",
          variant: "success",
        });
        loadReports();
      }
    } catch (error) {
      console.error('Error approving content:', error);
      toast({
        title: "Error approving content",
        description: "Could not approve the content",
        variant: "destructive",
      });
    }
  };
  
  const handleRejectContent = async (report: ContentReport) => {
    try {
      // Update the content moderation status
      const contentSuccess = await updateContentModerationStatus(
        report.contentId, 
        report.contentType, 
        'rejected'
      );
      
      // Mark the report as resolved
      const reportSuccess = await updateReportStatus(report.id, 'resolved');
      
      if (contentSuccess && reportSuccess) {
        toast({
          title: "Content rejected",
          description: "The content has been rejected and the report resolved",
          variant: "success",
        });
        loadReports();
      }
    } catch (error) {
      console.error('Error rejecting content:', error);
      toast({
        title: "Error rejecting content",
        description: "Could not reject the content",
        variant: "destructive",
      });
    }
  };

  // Render the status badge based on report status
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending Review
          </span>
        );
      case 'reviewed':
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Under Review
          </span>
        );
      case 'resolved':
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold">Content Moderation</h1>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  How to Moderate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Moderation Guide</DialogTitle>
                  <DialogDescription>
                    Follow these steps to effectively moderate content
                  </DialogDescription>
                </DialogHeader>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Moderation Steps:</h3>
                  <ol className="list-decimal pl-5 space-y-2 mb-4">
                    {moderationGuide.steps.map((step, index) => (
                      <li key={index} className="text-gray-700">{step}</li>
                    ))}
                  </ol>
                  
                  <h3 className="font-medium mb-2 mt-4">Report Statuses:</h3>
                  <div className="space-y-2">
                    {Object.entries(moderationGuide.statuses).map(([status, description]) => (
                      <div key={status} className="flex items-start gap-2">
                        <div className="rounded-full w-2 h-2 mt-2 bg-gray-400 flex-shrink-0" 
                             style={{ backgroundColor: 
                              status === 'pending' ? '#FCD34D' : 
                              status === 'reviewed' ? '#60A5FA' : 
                              status === 'resolved' ? '#34D399' :
                              status === 'approved' ? '#34D399' :
                              status === 'rejected' ? '#F87171' : '#9CA3AF'
                             }} />
                        <div>
                          <span className="font-medium capitalize">{status}</span>: {description}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-3 bg-blue-50 rounded-md border border-blue-100">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Rejected content will not be completely deleted from the database but will no longer appear in public feeds or searches.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <p className="text-gray-600 mb-6">
            Review and respond to reported content to maintain community safety standards.
          </p>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="reviewed">Under Review</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending" className="mt-6">
              {renderReportsList()}
            </TabsContent>
            
            <TabsContent value="reviewed" className="mt-6">
              {renderReportsList()}
            </TabsContent>
            
            <TabsContent value="resolved" className="mt-6">
              {renderReportsList()}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );

  // Helper function to render the reports list
  function renderReportsList() {
    if (isLoading) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading reports...</p>
        </div>
      );
    }

    if (reports.length === 0) {
      return (
        <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
          <ShieldAlert className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">No {activeTab} reports found.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {reports.map(report => (
          <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium">
                Report #{report.id.substring(0, 8)} - {report.contentType === 'doodle' ? 'Doodle' : 'Story'}
              </h3>
              {renderStatusBadge(report.status)}
            </div>
            
            <div className="mb-2 text-sm text-gray-600">
              <p><strong>Reason:</strong> {report.reason}</p>
              {report.details && (
                <p><strong>Details:</strong> {report.details}</p>
              )}
              <p><strong>Reported:</strong> {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</p>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" onClick={() => handleReviewReport(report.id)}>
                <Eye className="mr-2 h-4 w-4" />
                View Content
              </Button>
              
              {report.status === 'pending' && (
                <Button variant="secondary" size="sm" onClick={() => handleMarkAsReviewed(report)}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Mark as Reviewed
                </Button>
              )}
              
              {report.status === 'reviewed' && (
                <>
                  <Button variant="destructive" size="sm" onClick={() => handleRejectContent(report)}>
                    <X className="mr-2 h-4 w-4" />
                    Reject Content
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleApproveContent(report)}>
                    <Check className="mr-2 h-4 w-4" />
                    Approve Content
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default AdminModeration;
