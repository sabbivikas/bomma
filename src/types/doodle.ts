
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
