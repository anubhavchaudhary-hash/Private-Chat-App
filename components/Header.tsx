import React, { useState } from 'react';
import { User } from '../types';
import { LogoutIcon } from './Icons';

interface HeaderProps {
  otherUser: User;
  displayName: string; // Custom display name if set, otherwise default name
  onLogout: () => void;
  onNameChange: (newName: string) => void;
}

const Header: React.FC<HeaderProps> = ({ otherUser, displayName, onLogout, onNameChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(displayName);

  const handleSave = () => {
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== displayName) {
      onNameChange(trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedName(displayName);
    setIsEditing(false);
  };

  return (
    <header className="flex items-center p-3 bg-teal-600 text-white shadow-md z-10 flex-shrink-0">
      <img
        src={otherUser.profileImageUrl || `https://i.pravatar.cc/40?u=${otherUser.id}`}
        alt={displayName}
        className="w-10 h-10 rounded-full mr-3 object-cover"
      />
      <div className="flex-grow">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              className="px-2 py-1 text-sm text-gray-900 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-white"
              maxLength={50}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') handleCancel();
              }}
            />
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-white text-teal-600 rounded hover:bg-teal-50"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs bg-teal-700 rounded hover:bg-teal-800"
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold">{displayName}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 rounded hover:bg-teal-700 focus:outline-none"
                aria-label="Edit name"
                title="Edit display name"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-teal-100">online</p>
          </>
        )}
      </div>
       <button 
        onClick={onLogout} 
        className="p-2 rounded-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Logout"
      >
        <LogoutIcon className="w-6 h-6" />
      </button>
    </header>
  );
};

export default Header;