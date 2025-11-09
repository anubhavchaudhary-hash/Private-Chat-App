import { db, storage } from './firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, Timestamp, doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Message } from '../types';

// Helper to create a consistent conversation ID between two users
export const getConversationId = (userId1: string, userId2: string): string => {
    return [userId1, userId2].sort().join('_');
};

// Ensures the parent conversation document exists
export const ensureConversationExists = async (conversationId: string, user1Id: string, user2Id: string): Promise<void> => {
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists()) {
        try {
            await setDoc(conversationRef, {
                participants: [user1Id, user2Id].sort(),
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error creating conversation document:", error);
            throw error;
        }
    }
};


// Subscribe to real-time messages for a given chat
export const subscribeToMessages = (conversationId: string, callback: (messages: Message[]) => void): (() => void) => {
    const messagesCollection = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            messages.push({
                id: doc.id,
                ...data,
                // Firestore timestamp needs to be converted to a number
                createdAt: (data.createdAt as Timestamp)?.toMillis() || Date.now(), 
            } as Message);
        });
        callback(messages);
    }, (error) => {
        console.error("Error fetching messages:", error);
        alert("Error fetching messages: " + error.message);
    });

    return unsubscribe; // Return the unsubscribe function
};

// Send a text message
export const sendTextMessage = async (conversationId: string, senderId: string, receiverId: string, text: string): Promise<void> => {
    const messagesCollection = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesCollection, {
        senderId: senderId,
        receiverId: receiverId,
        text: text,
        media_url: null,
        createdAt: serverTimestamp(),
    });
};

// Upload an image and then send a message with its URL
export const uploadImageAndSendMessage = async (conversationId: string, file: File, senderId: string, receiverId: string): Promise<void> => {
    if (!file) return;

    // 1. Upload file to Firebase Storage
    const storageRef = ref(storage, `chat_images/${conversationId}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);

    // 2. Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 3. Save message to Firestore
    const messagesCollection = collection(db, 'conversations', conversationId, 'messages');
    await addDoc(messagesCollection, {
        senderId: senderId,
        receiverId: receiverId,
        text: '', // Required by security rules to be a string
        media_url: downloadURL,
        media_type: 'image',
        createdAt: serverTimestamp(),
    });
};