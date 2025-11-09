import React, { useState, useRef } from 'react';
import { AttachmentIcon, CameraIcon, PhotoIcon, SendIcon } from './Icons';

interface ChatInputProps {
    onSendMessage: (message: { text?: string; file?: File }) => void;
    onOpenCamera: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, onOpenCamera }) => {
    const [text, setText] = useState('');
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        if (text.trim()) {
            onSendMessage({ text: text.trim() });
            setText('');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onSendMessage({ file: event.target.files[0] });
        }
        setShowAttachmentMenu(false);
    };

    const handleAttachmentClick = () => {
        setShowAttachmentMenu(!showAttachmentMenu);
    };

    const handlePhotoLibraryClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleCameraClick = () => {
        onOpenCamera();
        setShowAttachmentMenu(false);
    };

    return (
        <div className="p-3 bg-gray-100 border-t border-gray-200 flex-shrink-0">
            <div className="flex items-center bg-white rounded-full px-2 py-1 shadow-sm">
                <div className="relative">
                    <button onClick={handleAttachmentClick} className="p-2 text-gray-500 hover:text-teal-500">
                        <AttachmentIcon className="w-6 h-6" />
                    </button>
                    {showAttachmentMenu && (
                        <div className="absolute bottom-12 left-0 w-48 bg-white rounded-lg shadow-xl py-2 z-20">
                           <button onClick={handlePhotoLibraryClick} className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                               <PhotoIcon className="w-5 h-5 mr-3" /> Photo Library
                           </button>
                           <button onClick={handleCameraClick} className="w-full flex items-center px-4 py-2 text-left text-gray-700 hover:bg-gray-100">
                               <CameraIcon className="w-5 h-5 mr-3" /> Camera
                           </button>
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message or /ai for help..."
                    className="flex-grow bg-transparent outline-none px-3 text-gray-700"
                />
                <button onClick={handleSend} className="p-2 text-white bg-teal-500 rounded-full hover:bg-teal-600 disabled:bg-gray-300" disabled={!text.trim()}>
                    <SendIcon className="w-6 h-6" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>
        </div>
    );
};

export default ChatInput;
