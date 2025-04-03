
export interface Doodle {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  likes: number;
  sessionId: string; // To track which "user" created it
  reported?: boolean; // New field to track if content has been reported
  reportCount?: number; // New field to track report count
  moderationStatus?: 'pending' | 'approved' | 'rejected'; // Status of moderation
}

export interface Comment {
  id: string;
  doodleId?: string;
  storyId?: string;
  text: string;
  createdAt: string;
  sessionId: string; // To track which "user" created it
}

export type DoodleCreateInput = Omit<Doodle, 'id' | 'createdAt' | 'likes' | 'reported' | 'reportCount' | 'moderationStatus'>;

// New interfaces for stories and animations
export interface StoryFrame {
  id: string;
  storyId: string;
  imageUrl: string;
  order: number;
  duration: number; // Duration in milliseconds
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  frames: StoryFrame[];
  createdAt: string;
  sessionId: string;
  likes: number;
  isAnimation: boolean; // Whether this story should be played as animation
  reported?: boolean; // New field to track if content has been reported
  reportCount?: number; // New field to track report count
  moderationStatus?: 'pending' | 'approved' | 'rejected'; // Status of moderation
}

export type StoryCreateInput = Omit<Story, 'id' | 'createdAt' | 'frames' | 'likes' | 'reported' | 'reportCount' | 'moderationStatus'>;
export type StoryFrameCreateInput = Omit<StoryFrame, 'id' | 'createdAt' | 'storyId'>;

// New interface for content reports
export interface ContentReport {
  id: string;
  contentId: string;
  contentType: 'doodle' | 'story';
  reason: string;
  details?: string;
  sessionId: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export type ContentReportInput = Omit<ContentReport, 'id' | 'createdAt' | 'resolvedAt'>;
