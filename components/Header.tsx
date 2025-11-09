import React from 'react';
import { User } from '../types';
import { LogoutIcon } from './Icons';

interface HeaderProps {
  otherUser: User;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ otherUser, onLogout }) => {
  return (
    <header className="flex items-center p-3 bg-teal-600 text-white shadow-md z-10 flex-shrink-0">
      <img
        src={otherUser.profileImageUrl || `https://i.pravatar.cc/40?u=${otherUser.id}`}
        alt={otherUser.name}
        className="w-10 h-10 rounded-full mr-3 object-cover"
      />
      <div className="flex-grow">
        <h1 className="text-lg font-semibold">{otherUser.name}</h1>
        <p className="text-xs text-teal-100">online</p>
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