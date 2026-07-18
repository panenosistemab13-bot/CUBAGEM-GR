import React, { useEffect, useState } from 'react';
import { Users, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { rtdb } from '../firebase';
import { ref, onValue, set, onDisconnect, remove } from 'firebase/database';

interface ActiveUsersProps {
  currentUser: string;
}

export default function ActiveUsers({ currentUser }: ActiveUsersProps) {
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const isJeff = currentUser.toLowerCase() === 'jeff';

    // A unique session ID for this tab
    const sessionId = Math.random().toString(36).substring(2, 9);
    const userRef = ref(rtdb, `presence/${currentUser}_${sessionId}`);
    const presenceRef = ref(rtdb, 'presence');

    // Register presence (unless it's jeff)
    if (!isJeff) {
      set(userRef, {
        username: currentUser,
        online: true,
        lastSeen: Date.now()
      });
  
      // Remove presence on disconnect
      onDisconnect(userRef).remove();
    }

    // Listen to all presences
    const unsubscribe = onValue(presenceRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Collect unique usernames from all active sessions
        const usernames = new Set<string>();
        Object.values(data).forEach((session: any) => {
          if (session && session.username && session.online) {
            if (session.username.toLowerCase() !== 'jeff') {
              usernames.add(session.username);
            }
          }
        });
        setActiveUsers(Array.from(usernames));
      } else {
        setActiveUsers([]);
      }
    });

    // Cleanup on unmount
    return () => {
      if (!isJeff) {
        remove(userRef);
      }
      unsubscribe();
    };
  }, [currentUser]);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#E8D4B0] border-2 border-[#3A2414] rounded-full shadow-md hover:bg-[#d8c39e] transition-colors cursor-pointer"
        title="Usuários Online"
      >
        <div className="relative flex items-center justify-center">
          <Users size={14} className="text-[#3A2414]" />
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-500 border border-[#E8D4B0]" />
        </div>
        <span className="text-[10px] font-black uppercase text-[#3A2414]">
          {activeUsers.length} Online
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 w-48 bg-[#fdfbf7] border-2 border-[#3A2414] rounded-2xl shadow-xl z-50 overflow-hidden"
            >
            <div className="bg-[#3A2414] py-2 px-3 flex items-center justify-between">
              <span className="text-[9px] font-black uppercase text-[#E8D4B0] tracking-wider">Usuários no Sistema</span>
              <Users size={12} className="text-[#E8D4B0]" />
            </div>
            <div className="p-2 flex flex-col max-h-[200px] overflow-y-auto">
              {activeUsers.map(user => (
                <div key={user} className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#f0eadd] rounded-lg transition-colors">
                  <Circle size={8} className="fill-green-500 text-green-500" />
                  <span className="text-xs font-bold text-[#3A2414] uppercase">
                    {user} {user === currentUser ? '(Você)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
