
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ShortUrlRedirect: React.FC = () => {
  const { shortId } = useParams<{ shortId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // This is a placeholder implementation
    // In a real app, you would fetch the target URL from your backend
    console.log(`Redirecting from short URL with ID: ${shortId}`);
    navigate('/');
  }, [shortId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-xl">Redirecting...</p>
      </div>
    </div>
  );
};

export default ShortUrlRedirect;
