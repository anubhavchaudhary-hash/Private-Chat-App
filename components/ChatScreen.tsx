import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Message } from '../types';
import Header from './Header';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import CameraModal from './CameraModal';
import { getAiResponse } from '../services/geminiService';
import { dataUrlToFile } from '../utils/helpers';
import { getConversationId, subscribeToMessages, sendTextMessage, uploadImageAndSendMessage, ensureConversationExists } from '../services/chatService';
import { formatDate, isSameDay, formatRelativeDate } from '../utils/helpers';
import { getCustomName, setCustomName } from '../services/customNameService';

interface ChatScreenProps {
    currentUser: User;
    otherUser: User;
    onLogout: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ currentUser, otherUser, onLogout }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [displayName, setDisplayName] = useState<string>(otherUser.name);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const messageNodesRef = useRef<Map<string, HTMLDivElement>>(new Map());
    const [stickyDate, setStickyDate] = useState<string | null>(null);
    const conversationId = getConversationId(currentUser.id, otherUser.id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load custom display name for the other user
    useEffect(() => {
        const loadCustomName = async () => {
            const customName = await getCustomName(currentUser.id, otherUser.id);
            if (customName) {
                setDisplayName(customName);
            } else {
                setDisplayName(otherUser.name);
            }
        };
        loadCustomName();
    }, [currentUser.id, otherUser.id, otherUser.name]);

    // Handle name change
    const handleNameChange = async (newName: string) => {
        try {
            await setCustomName(currentUser.id, otherUser.id, newName);
            setDisplayName(newName);
        } catch (error) {
            console.error('Failed to update custom name:', error);
            alert('Failed to update name. Please try again.');
        }
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

    // Compute and update sticky date based on visible messages in the scroll container
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let raf = 0;
        const computeSticky = () => {
            const map = messageNodesRef.current;
            if (!map || map.size === 0) {
                setStickyDate(null);
                return;
            }

            // iterate messages in DOM order (messages array order)
            for (const msg of messages) {
                const el = map.get(msg.id);
                if (!el) continue;
                const offsetTop = el.offsetTop;
                if (offsetTop - container.scrollTop >= 0) {
                    setStickyDate(formatRelativeDate(msg.createdAt));
                    return;
                }
            }

            // Fallback: use last message date
            const last = messages[messages.length - 1];
            if (last) setStickyDate(formatRelativeDate(last.createdAt));
        };

        const onScroll = () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(computeSticky);
        };

        // initial compute
        computeSticky();
        container.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', computeSticky);

        return () => {
            if (raf) cancelAnimationFrame(raf);
            container.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', computeSticky);
        };
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
            <Header 
                otherUser={otherUser} 
                displayName={displayName}
                onLogout={onLogout} 
                onNameChange={handleNameChange}
            />
            <main 
                ref={containerRef}
                className="flex-1 overflow-y-auto p-4 relative"
                style={{ backgroundImage: "url('https://i.pinimg.com/736x/8c/98/99/8c98994518b575bfd8c949e91d20548b.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
                {/* Sticky date header inside the scroll container */}
                <div className="sticky top-0 z-20 pointer-events-none">
                    {stickyDate && (
                        <div className="flex justify-center mt-2">
                            <div className="px-3 py-1 bg-white/80 backdrop-blur text-gray-700 text-xs rounded-full pointer-events-auto">{stickyDate}</div>
                        </div>
                    )}
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
                    </div>
                ) : (
                    // Render messages with date separators when the day changes
                    (() => {
                        const nodes: React.ReactNode[] = [];
                        let prevTimestamp: number | null = null;
                        for (const msg of messages) {
                            if (prevTimestamp == null || !isSameDay(prevTimestamp, msg.createdAt)) {
                                nodes.push(
                                    <div key={`date-${msg.id}`} className="flex justify-center my-3">
                                        <div className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">{formatRelativeDate(msg.createdAt)}</div>
                                    </div>
                                );
                            }
                            nodes.push(
                                <div
                                    key={`wrap-${msg.id}`}
                                    ref={(el) => {
                                        if (el) messageNodesRef.current.set(msg.id, el);
                                        else messageNodesRef.current.delete(msg.id);
                                    }}
                                >
                                    <MessageBubble 
                                        key={msg.id}
                                        message={msg}
                                        isCurrentUser={msg.senderId === currentUser.id}
                                        otherUser={otherUser}
                                    />
                                </div>
                            );
                            prevTimestamp = msg.createdAt;
                        }
                        return nodes;
                    })()
                )}
                <div ref={messagesEndRef} />
            </main>
            <ChatInput onSendMessage={handleSendMessage} onOpenCamera={() => setIsCameraOpen(true)} />
            {isCameraOpen && <CameraModal onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />}
        </div>
    );
};

export default ChatScreen;