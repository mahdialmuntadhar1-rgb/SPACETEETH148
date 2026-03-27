import React, { useState } from 'react';
import { X } from './icons';
import { useTranslations } from '../hooks/useTranslations';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (role: 'user' | 'owner') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin }) => {
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'user' | 'owner'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'error' | 'success' | null>(null);
  const { t } = useTranslations();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } = useSupabaseAuth();

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      sessionStorage.setItem('pending_role', role);
      await signInWithGoogle();
      onLogin(role);
    } catch (error) {
      sessionStorage.removeItem('pending_role');
      setStatusType('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      sessionStorage.setItem('pending_role', role);
      if (activeTab === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }

      setStatusType('success');
      setStatusMessage(activeTab === 'signin' ? 'Signed in successfully.' : 'Signup successful. Check your email for verification.');
      onLogin(role);
    } catch (error) {
      sessionStorage.removeItem('pending_role');
      setStatusType('error');
      setStatusMessage(error instanceof Error ? error.message : 'Authentication request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsLoading(true);
    setStatusMessage(null);

    try {
      await resetPassword(email);
      setStatusType('success');
      setStatusMessage('Password reset email sent.');
    } catch (error) {
      setStatusType('error');
      setStatusMessage(error instanceof Error ? error.message : 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md backdrop-blur-2xl bg-dark-bg/90 border border-white/20 rounded-3xl p-8 shadow-glow-primary text-start rtl:text-right">
        <button onClick={onClose} className="absolute top-4 end-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-2">{activeTab === 'signin' ? t('auth.signIn') : t('auth.signUp')}</h2>
        <p className="text-white/60 text-sm mb-8">{activeTab === 'signin' ? t('auth.welcomeBack') : t('auth.joinEcosystem')}</p>

        <div className="space-y-6">
          {activeTab === 'signup' && (
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${role === 'user' ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/60'}`}
              >
                <span className="font-semibold text-sm">{t('auth.roleUser')}</span>
                <span className="text-[10px] opacity-60">{t('auth.exploreConnect')}</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('owner')}
                className={`flex-1 py-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${role === 'owner' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-white/10 text-white/60'}`}
              >
                <span className="font-semibold text-sm">{t('auth.roleOwner')}</span>
                <span className="text-[10px] opacity-60">{t('auth.growBusiness')}</span>
              </button>
            </div>
          )}

          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-4 rounded-xl bg-white text-black font-bold flex items-center justify-center gap-3 hover:bg-white/90 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('auth.continueGoogle')}</span>
              </>
            )}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-dark-bg px-2 text-white/40">{t('auth.orEmail')}</span>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.email')}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.password')}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
            />
            <button onClick={handleEmailAuth} disabled={isLoading || !email || !password} className="w-full py-3 rounded-xl bg-white/10 text-white font-semibold disabled:opacity-50">
              {activeTab === 'signin' ? t('auth.signIn') : t('auth.createAccount')}
            </button>
            <button onClick={handlePasswordReset} disabled={isLoading || !email} className="w-full py-2 text-primary text-sm hover:underline disabled:opacity-50">
              {t('auth.newPassword') || 'Forgot password?'}
            </button>
          </div>

          {statusMessage && (
            <p className={`text-sm ${statusType === 'error' ? 'text-red-400' : 'text-green-400'}`}>{statusMessage}</p>
          )}

          <div className="text-center">
            <button onClick={() => setActiveTab(activeTab === 'signin' ? 'signup' : 'signin')} className="text-primary text-sm font-medium hover:underline">
              {activeTab === 'signin' ? t('auth.noAccount') : t('auth.haveAccount')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
