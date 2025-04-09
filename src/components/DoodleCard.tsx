
import React, { useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Doodle } from '@/types/doodle';
import { useDoodleCard } from '@/hooks/use-doodle-card';
import ReportContent from './ReportContent';
import DoodleViewer3D from './DoodleViewer3D';
import DoodleCardHeader from './doodle/DoodleCardHeader';
import DoodleCardImage from './doodle/DoodleCardImage';
import DoodleCardActions from './doodle/DoodleCardActions';
import DoodleCardComments from './doodle/DoodleCardComments';

interface DoodleCardProps {
  doodle: Doodle;
  onLike?: (doodle: Doodle) => void;
  highlight?: boolean;
}

const DoodleCard: React.FC<DoodleCardProps> = ({ doodle, onLike, highlight = false }) => {
  // Reference to the card element for scrolling into view
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Use the custom hook to manage doodle card state and logic
  const {
    isHovered,
    setIsHovered,
    showComments,
    commentText,
    setCommentText,
    comments,
    isLoading,
    commentCount,
    showReportDialog,
    setShowReportDialog,
    show3DViewer,
    setShow3DViewer,
    handleLike,
    handleCommentToggle,
    handleCommentSubmit,
    handleShare,
    handleReportDoodle,
    handle3DView
  } = useDoodleCard(doodle, onLike);
  
  // Scroll highlighted card into view
  React.useEffect(() => {
    if (highlight && cardRef.current) {
      // Scroll the highlighted card into view with smooth behavior
      setTimeout(() => {
        cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlight]);
  
  return (
    <Card 
      ref={cardRef}
      className={`w-full overflow-hidden rounded-lg border shadow-sm transition-all duration-300 hover:shadow-md bg-white ${
        highlight ? 'ring-4 ring-blue-400 animate-pulse-once shadow-lg' : 'border-gray-200'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Card Header */}
      <DoodleCardHeader 
        doodle={doodle} 
        onShare={handleShare} 
        onReport={handleReportDoodle} 
        on3DView={handle3DView} 
      />
      
      {/* Image Content */}
      <DoodleCardImage 
        imageUrl={doodle.imageUrl} 
        prompt={doodle.prompt} 
        is3D={doodle.is3D} 
        isHovered={isHovered} 
        on3DView={handle3DView} 
      />
      
      {/* Caption */}
      <div className="pt-3 pb-1 px-4">
        <p className="font-medium text-sm">{doodle.prompt}</p>
      </div>
      
      {/* Interaction Footer */}
      <DoodleCardActions 
        likes={doodle.likes} 
        is3D={doodle.is3D} 
        commentCount={commentCount} 
        onLike={handleLike} 
        onCommentToggle={handleCommentToggle} 
        onShare={handleShare} 
        on3DView={handle3DView} 
      />

      {/* Comment Section */}
      {showComments && (
        <DoodleCardComments 
          comments={comments} 
          commentCount={commentCount} 
          isLoading={isLoading}
          commentText={commentText}
          setCommentText={setCommentText}
          onToggleComments={handleCommentToggle} 
          onSubmitComment={handleCommentSubmit} 
        />
      )}
      
      {/* Report Dialog */}
      {showReportDialog && (
        <ReportContent
          contentId={doodle.id}
          contentType="doodle"
          isOpen={showReportDialog}
          onClose={() => setShowReportDialog(false)}
        />
      )}
      
      {/* 3D Viewer */}
      <DoodleViewer3D 
        imageUrl={doodle.imageUrl}
        isOpen={show3DViewer}
        onClose={() => setShow3DViewer(false)}
      />
    </Card>
  );
};

export default React.memo(DoodleCard);
