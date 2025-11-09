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
    profileImageUrl: 'https://i.pinimg.com/736x/de/21/59/de215903c6f6631855a508b53e83b429.jpg' 
  },
  'EJTfm5BLcuQjgiCUMsYTVu0BJXS2': { id: 'EJTfm5BLcuQjgiCUMsYTVu0BJXS2', name: 'Priya' },
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser && users[firebaseUser.uid]) {
        setCurrentUser(users[firebaseUser.uid]);
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