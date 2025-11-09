import React from 'react';
import { Message, User } from '../types';
import { formatTimestamp } from '../utils/helpers';
import { Avatar } from './Icons';

interface MessageBubbleProps {
    message: Message;
    isCurrentUser: boolean;
    otherUser?: User;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isCurrentUser, otherUser }) => {
    const isGemini = message.senderId === 'gemini';
    
    const bubbleAlignment = isCurrentUser ? 'self-end' : 'self-start';
    const bubbleColor = isCurrentUser ? 'bg-teal-500 text-white' : isGemini ? 'bg-purple-500 text-white' : 'bg-white text-gray-800';

    return (
        <div className={`flex flex-col mb-2 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
            <div className={`flex ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}> 
                {/* Avatar for non-current users */}
                {!isCurrentUser && (
                    <div className="flex-shrink-0">
                        <Avatar
                            userId={message.senderId}
                            src={otherUser && otherUser.id === message.senderId ? otherUser.profileImageUrl : undefined}
                            size={36}
                            alt={message.senderId}
                        />
                    </div>
                )}

                <div className={`rounded-xl px-3 py-2 max-w-md ${bubbleAlignment} ${bubbleColor}`}>
                    {isGemini && <p className="font-bold text-sm mb-1 text-purple-200">Gemini AI</p>}

                    <div className="min-w-[50px]">
                        {message.text && <p className="text-sm break-words">{message.text}</p>}
                        {message.media_url && (
                            <div className="my-1">
                                {message.media_type === 'uploading' ? (
                                    <div className="relative w-48 h-32 bg-gray-500/50 rounded-lg flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                    </div>
                                ) : (
                                     <img 
                                        src={message.media_url} 
                                        alt="User media"
                                        className="rounded-lg max-w-xs md:max-w-sm cursor-pointer block"
                                        onLoad={(e) => e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'end' })}
                                        onClick={() => window.open(message.media_url, '_blank')}
                                    />
                                )}
                            </div>
                        )}

                        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-teal-100' : 'text-gray-400'} ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                            {formatTimestamp(message.createdAt)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;