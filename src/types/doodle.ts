
export interface Doodle {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  likes: number;
  sessionId: string; // To track which "user" created it
}

export interface Comment {
  id: string;
  doodleId: string;
  text: string;
  createdAt: string;
  sessionId: string; // To track which "user" created it
}

export type DoodleCreateInput = Omit<Doodle, 'id' | 'createdAt' | 'likes'>;

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
}

export type StoryCreateInput = Omit<Story, 'id' | 'createdAt' | 'frames' | 'likes'>;
export type StoryFrameCreateInput = Omit<StoryFrame, 'id' | 'createdAt' | 'storyId'>;
