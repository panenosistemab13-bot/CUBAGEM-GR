import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Simulate a tiny delay for a premium feedback feel
    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const cleanPass = password;

      if (
        (cleanUser === 'grupogr' && cleanPass === 'cubagemgr2026#') ||
        (cleanUser === 'pcp' && cleanPass === 'cubagempcp26')
      ) {
        onLoginSuccess(cleanUser === 'grupogr' ? 'Grupo GR' : 'PCP');
      } else {
        setError('Usuário ou senha incorretos. Por favor, tente novamente.');
        setIsSubmitting(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#2D1A10]">
      {/* Decorative Warm Light Radial Glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30" 
        style={{ 
          backgroundImage: 'radial-gradient(circle at center, rgba(202, 26, 32, 0.25) 0%, transparent 70%)' 
        }} 
      />

      {/* Decorative subtle texture/vignette */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-900/40 via-stone-900/60 to-black" />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md bg-[#F2E4CC] border-2 border-[#C7A26A]/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden z-10"
      >
        {/* Brass Screws details on corners */}
        <div className="absolute top-4 left-4 w-3.5 h-3.5 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65)] flex items-center justify-center">
          <div className="w-2.5 h-[1.2px] bg-[#311b09]/85 rotate-[45deg] rounded-sm" />
        </div>
        <div className="absolute top-4 right-4 w-3.5 h-3.5 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65)] flex items-center justify-center">
          <div className="w-2.5 h-[1.2px] bg-[#311b09]/85 rotate-[-15deg] rounded-sm" />
        </div>
        <div className="absolute bottom-4 left-4 w-3.5 h-3.5 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65)] flex items-center justify-center">
          <div className="w-2.5 h-[1.2px] bg-[#311b09]/85 rotate-[120deg] rounded-sm" />
        </div>
        <div className="absolute bottom-4 right-4 w-3.5 h-3.5 bg-gradient-to-br from-[#dfc1a0] via-[#8c6039] to-[#3a200a] rounded-full shadow-[1px_2px_2px_rgba(0,0,0,0.65)] flex items-center justify-center">
          <div className="w-2.5 h-[1.2px] bg-[#311b09]/85 rotate-[70deg] rounded-sm" />
        </div>

        {/* Card Header */}
        <div className="pt-10 pb-6 px-8 text-center border-b border-[#3A2414]/10 bg-gradient-to-b from-[#EAD8B8]/40 to-transparent">
          <h1 className="text-3xl font-black tracking-widest text-[#3A2414] font-serif leading-none">
            CUBAGEM GR
          </h1>
          <p className="text-[10px] font-black text-[#B32025] uppercase tracking-[0.25em] mt-2">
            SISTEMA PGR • SANTA LUZIA / MG
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 p-3.5 bg-red-100 border border-red-300 text-red-900 rounded-xl text-xs font-semibold leading-relaxed"
            >
              <AlertCircle size={16} className="text-red-700 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Username Input */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-[#3A2414]/80">
              Nome de Usuário
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A2414]/50">
                <User size={16} strokeWidth={2.5} />
              </span>
              <input
                id="login-username"
                type="text"
                required
                autoFocus
                disabled={isSubmitting}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: grupogr"
                className="w-full pl-10 pr-4 py-3 bg-[#FCF7ED] border-2 border-[#5c3c24]/30 focus:border-[#B32025] outline-none rounded-xl text-sm font-semibold text-[#2D1A10] placeholder-[#3A2414]/40 transition-colors shadow-inner"
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-[#3A2414]/80">
              Senha de Acesso
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3A2414]/50">
                <Lock size={16} strokeWidth={2.5} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isSubmitting}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full pl-10 pr-10 py-3 bg-[#FCF7ED] border-2 border-[#5c3c24]/30 focus:border-[#B32025] outline-none rounded-xl text-sm font-semibold text-[#2D1A10] placeholder-[#3A2414]/40 transition-colors shadow-inner"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#3A2414]/50 hover:text-[#B32025] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 bg-[#B32025] hover:bg-[#8c060a] disabled:bg-stone-500 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-md transition-all flex items-center justify-center gap-2.5 border-2 border-[#8c060a]/50 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Autenticando...
              </span>
            ) : (
              <>
                <LogIn size={15} strokeWidth={2.5} />
                <span>Entrar no Sistema</span>
              </>
            )}
          </motion.button>

        </form>

        {/* Info footer */}
        <div className="bg-[#EAD8B8]/20 border-t border-[#3A2414]/5 px-8 py-4.5 text-center text-[10px] text-[#6B4423]/70 font-mono font-bold">
          ACESSO RESTRITO • GRUPO GR & PCP
        </div>
      </motion.div>
    </div>
  );
}
