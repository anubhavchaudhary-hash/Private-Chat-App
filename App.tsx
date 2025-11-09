import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';
import { User } from './types';
import { auth } from './services/firebase';
import { onAuthStateChanged, User as FirebaseUser, signOut } from 'firebase/auth';

const users: Record<string, User> = {
  'DrTZw7Kv5MeGpdVbiU4lp6Kk6nF3': { 
    id: 'DrTZw7Kv5MeGpdVbiU4lp6Kk6nF3', 
    name: 'Anu',
    // Use the local radha avatar for the other user shown in the chat header
    profileImageUrl: '/avatars/krishna.png'
  },
  'EJTfm5BLcuQjgiCUMsYTVu0BJXS2': { 
    id: 'EJTfm5BLcuQjgiCUMsYTVu0BJXS2', 
    name: 'Aas',
    profileImageUrl: '/avatars/radha.png',
  },
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && users[firebaseUser.uid]) {
        // If this specific test user logs in, force their profile image to the local radha avatar
        const baseUser = users[firebaseUser.uid];
        const overriddenUser = firebaseUser.uid === 'DrTZw7Kv5MeGpdVbiU4lp6Kk6nF3'
          ? { ...baseUser, profileImageUrl: '/avatars/radha.png' }
          : baseUser;
        setCurrentUser(overriddenUser);
      } else {
        setCurrentUser(null);
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    signOut(auth).catch(error => console.error("Logout failed:", error));
  };

  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(loggedInUser) => setCurrentUser(loggedInUser)} allowedUsers={users} />;
  }

  const otherUser = currentUser.id === users['DrTZw7Kv5MeGpdVbiU4lp6Kk6nF3'].id 
    ? users['EJTfm5BLcuQjgiCUMsYTVu0BJXS2'] 
    : users['DrTZw7Kv5MeGpdVbiU4lp6Kk6nF3'];

  return <ChatScreen currentUser={currentUser} otherUser={otherUser} onLogout={handleLogout} />;
};

export default App;