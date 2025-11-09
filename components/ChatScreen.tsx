import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message } from '../types';
import Header from './Header';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import CameraModal from './CameraModal';
import { getAiResponse } from '../services/geminiService';
import { dataUrlToFile } from '../utils/helpers';
import { getConversationId, subscribeToMessages, sendTextMessage, uploadImageAndSendMessage, ensureConversationExists } from '../services/chatService';

interface ChatScreenProps {
    currentUser: User;
    otherUser: User;
    onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ currentUser, otherUser, onLogout }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const conversationId = getConversationId(currentUser.id, otherUser.id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Ensure conversation exists and set up real-time listener for messages
    useEffect(() => {
        setIsLoading(true);
        let unsubscribe: (() => void) | undefined;

        const setupListener = async () => {
            try {
                await ensureConversationExists(conversationId, currentUser.id, otherUser.id);
                
                unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
                    setMessages(newMessages);
                    setIsLoading(false);
                });
            } catch (error) {
                console.error("Failed to set up chat listener:", error);
                setIsLoading(false); // Stop loading on error
            }
        };

        setupListener();
        
        // Cleanup subscription on component unmount
        return () => {
            if (unsubscribe) {
                unsubscribe();
            }
        };
    }, [conversationId, currentUser.id, otherUser.id]);


    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    const handleSendMessage = useCallback(async (messageData: { text?: string; file?: File }) => {
        if (messageData.text) {
            const trimmedText = messageData.text.trim();
            if (trimmedText.startsWith('/ai ')) {
                const prompt = trimmedText.substring(4);
                
                const userPromptMessage: Message = {
                    id: `temp-prompt-${Date.now()}`,
                    senderId: currentUser.id,
                    receiverId: 'gemini',
                    text: `Me to AI: ${prompt}`,
                    media_url: null,
                    createdAt: Date.now(),
                };
                setMessages(prev => [...prev, userPromptMessage]);

                const aiResponseText = await getAiResponse(prompt);
                
                const aiResponseMessage: Message = {
                    id: `ai-resp-${Date.now()}`,
                    senderId: 'gemini',
                    receiverId: currentUser.id,
                    text: aiResponseText,
                    media_url: null,
                    createdAt: Date.now(),
                };
                setMessages(prev => [...prev, aiResponseMessage]);
                return;
            }

            await sendTextMessage(conversationId, currentUser.id, otherUser.id, trimmedText);

        } else if (messageData.file) {
            const tempId = `temp-img-${Date.now()}`;
            const uploadingMessage: Message = {
                id: tempId,
                senderId: currentUser.id,
                receiverId: otherUser.id,
                text: null,
                media_url: URL.createObjectURL(messageData.file),
                media_type: 'uploading',
                createdAt: Date.now(),
            };
            setMessages(prev => [...prev, uploadingMessage]);

            await uploadImageAndSendMessage(conversationId, messageData.file, currentUser.id, otherUser.id);
        }
    }, [conversationId, currentUser.id, otherUser.id]);

    const handleCapture = async (dataUrl: string) => {
        const file = await dataUrlToFile(dataUrl, `capture-${Date.now()}.jpg`);
        handleSendMessage({ file });
    };
    
    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl">
            <Header otherUser={otherUser} onLogout={onLogout} />
            <main 
                className="flex-1 overflow-y-auto p-4"
                style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
                    </div>
                ) : (
                    messages.map(msg => (
                        <MessageBubble 
                            key={msg.id}
                            message={msg}
                            isCurrentUser={msg.senderId === currentUser.id}
                            otherUser={otherUser}
                        />
                    )) 
                )}
                <div ref={messagesEndRef} />
            </main>
            <ChatInput onSendMessage={handleSendMessage} onOpenCamera={() => setIsCameraOpen(true)} />
            {isCameraOpen && <CameraModal onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />}
        </div>
    );
};

export default ChatScreen;