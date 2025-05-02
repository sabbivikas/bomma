
import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

interface ShortUrlRedirectProps {
  type: 'story' | 'doodle';
}

const ShortUrlRedirect: React.FC<ShortUrlRedirectProps> = ({ type }) => {
  const { shortId } = useParams<{ shortId: string }>();
  
  // If no shortId was found in the URL params, redirect to homepage
  if (!shortId) {
    return <Navigate to="/" replace />;
  }
  
  // In a real implementation, we would look up the full ID from a database
  // For this demo, we'll simply redirect to the appropriate page
  // assuming the shortId is just the first part of the full ID
  const redirectPath = type === 'story' 
    ? `/stories/${shortId}` 
    : `/doodles/${shortId}`;
    
  return <Navigate to={redirectPath} replace />;
};

export default ShortUrlRedirect;
