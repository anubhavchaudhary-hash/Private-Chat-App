import { Message } from '../types';

const initialMessages: Message[] = [
    {
        id: 'msg-1',
        // FIX: Corrected property names to match the Message interface (sender_id -> senderId, receiver_id -> receiverId, message_text -> text, timestamp -> createdAt).
        senderId: 'user-a',
        receiverId: 'user-b',
        text: 'Hey, how are you?',
        media_url: null,
        createdAt: new Date().getTime() - 1000 * 60 * 5,
    },
    {
        id: 'msg-2',
        // FIX: Corrected property names to match the Message interface (sender_id -> senderId, receiver_id -> receiverId, message_text -> text, timestamp -> createdAt).
        senderId: 'user-b',
        receiverId: 'user-a',
        text: 'I am good, thanks! How about you?',
        media_url: null,
        createdAt: new Date().getTime() - 1000 * 60 * 4,
    },
    {
        id: 'msg-3',
        // FIX: Corrected property names to match the Message interface (sender_id -> senderId, receiver_id -> receiverId, message_text -> text, timestamp -> createdAt).
        senderId: 'user-a',
        receiverId: 'user-b',
        text: 'Doing great! Check out this picture I took.',
        media_url: null,
        createdAt: new Date().getTime() - 1000 * 60 * 3,
    },
    {
        id: 'msg-4',
        // FIX: Corrected property names to match the Message interface (sender_id -> senderId, receiver_id -> receiverId, message_text -> text, timestamp -> createdAt).
        senderId: 'user-a',
        receiverId: 'user-b',
        text: null,
        media_url: `https://picsum.photos/seed/picsum1/400/300`,
        media_type: 'image',
        createdAt: new Date().getTime() - 1000 * 60 * 2,
    }
];

// In a real app, this would be a call to Firebase Firestore
export const fetchChatHistory = (): Promise<Message[]> => {
    console.log("Mock API: Fetching chat history...");
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log("Mock API: Fetched chat history.");
            resolve([...initialMessages]);
        }, 500);
    });
};

// In a real app, this would be a call to Firebase Firestore to add a document
export const saveMessage = (message: Omit<Message, 'id'>): Promise<Message> => {
    console.log("Mock API: Saving message...");
    return new Promise((resolve) => {
        setTimeout(() => {
            const newMessage: Message = {
                ...message,
                id: `msg-${new Date().getTime()}`,
            };
            console.log("Mock API: Message saved.", newMessage);
            resolve(newMessage);
        }, 300);
    });
};

// In a real app, this would use the Google Drive API
export const uploadToDrive = (file: File): Promise<string> => {
    console.log(`Mock API: Uploading ${file.name} to Google Drive...`);
    return new Promise((resolve) => {
        setTimeout(() => {
            // Simulate a successful upload and return a fake Drive URL
            const fakeDriveUrl = `https://picsum.photos/seed/${Math.random()}/400/300`;
            console.log("Mock API: Upload complete. URL:", fakeDriveUrl);
            resolve(fakeDriveUrl);
        }, 1500);
    });
};
