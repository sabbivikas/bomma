
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ContentReport } from '@/types/doodle';
import { getReports } from '@/utils/moderationService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navbar from '@/components/Navbar';
import { ShieldAlert, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const AdminModeration: React.FC = () => {
  const [reports, setReports] = useState<ContentReport[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed' | 'resolved'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

  // This is a placeholder for future functionality
  const handleReviewReport = (reportId: string) => {
    toast({
      title: "Feature coming soon",
      description: "The moderation review interface is under development",
    });
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
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold">Content Moderation</h1>
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
                View Content
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default AdminModeration;
