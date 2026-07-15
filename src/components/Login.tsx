import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User } from 'lucide-react';
import { auth, handleFirestoreError, OperationType } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { toAbsoluteUrl } from '../utils/url';
import loginBg from '../assets/images/coffee_shop_bg_1780921585218.png';

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLogin(); // State will be captured via auth listener in App or directly here
    } catch (e: any) {
      if (e.code === 'auth/popup-closed-by-user') {
        setError('Login cancelado.');
      } else {
        setError('Erro ao autenticar. Tente novamente.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-zinc-950">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-40 bg-cover bg-center"
        style={{ backgroundImage: `url(${toAbsoluteUrl(loginBg)})` }}
      />
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -tranzinc-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 bg-card/60 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl w-full max-w-md"
      >
        <div className="mb-8">
          <h2 className="font-heading text-4xl font-extrabold text-white tracking-tight mb-2">Bem-vindo</h2>
          <p className="text-slate-400 font-sans">Acesse sua área restrita para gestão.</p>
        </div>

        <div className="space-y-6">
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-400 text-xs text-center font-medium bg-rose-950/30 p-2 rounded-lg">
              {error}
            </motion.p>
          )}

          <button onClick={handleGoogleLogin} className="w-full bg-primary hover:bg-blue-600 text-white font-heading font-semibold py-4 rounded-xl transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-lg mt-2 flex items-center justify-center gap-2">
            Entrar com Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}
