
export interface Doodle {
  id: string;
  imageUrl: string;
  prompt: string;
  createdAt: string;
  likes: number;
  sessionId: string; // To track which "user" created it
}

export type DoodleCreateInput = Omit<Doodle, 'id' | 'createdAt' | 'likes'>;
