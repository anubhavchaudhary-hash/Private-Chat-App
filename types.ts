export interface User {
  id: string;
  name: string;
  profileImageUrl?: string;
}

export interface Message {
  id: string;
  senderId: User['id'];
  receiverId: User['id'];
  text: string | null;
  media_url: string | null;
  media_type?: 'image' | 'uploading'; // UI state helper
  createdAt: number;
}