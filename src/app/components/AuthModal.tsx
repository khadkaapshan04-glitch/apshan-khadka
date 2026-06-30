import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Shield, User, ChefHat, Lock, ArrowLeft } from 'lucide-react';
import { db } from '../lib/supabaseDb';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (role: string) => void;
  initialView?: ModalView;
  initialEmail?: string;
}

type ModalView = 'signin' | 'signup' | 'forgot' | 'reset_password';

const normalizeEmail = (value: string) => value.trim().toLowerCase();

const getEmailValidationError = (value: string) => {
  const normalized = normalizeEmail(value);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(normalized)) {
    return 'Please enter a valid email address.';
  }

  if (normalized.endsWith('@gmai.com')) {
    return 'Did you mean @gmail.com? Please fix the email and try again.';
  }

  return '';
};

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialView = 'signin',
  initialEmail = '',
}) => {
  const navigate = useNavigate();
  const [view, setView] = useState<ModalView>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    setView(initialView);
    setEmail(initialEmail);
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  }, [isOpen, initialView, initialEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    const normalizedEmail = normalizeEmail(email);

    if (view !== 'reset_password') {
      const emailError = getEmailValidationError(normalizedEmail);
      if (emailError) {
        setError(emailError);
        return;
      }
    }

    if (view === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (view === 'reset_password') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    } else if (view !== 'forgot' && password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (view === 'signup') {
        const result = await db.signup(normalizedEmail, password, fullName);
        if (result?.profile) {
          if (result.needsEmailConfirmation) {
            setPassword('');
            setConfirmPassword('');
            setView('signin');
            setSuccessMessage(`Account created for ${result.profile.email}. Confirm your email, then sign in.`);
            return;
          }

          onLoginSuccess(result.profile.role);
          onClose();
        } else {
          setError('Signup failed. Please check the email and try again.');
        }
      } else if (view === 'signin') {
        const user = await db.login(normalizedEmail, password);
        if (user) {
          onLoginSuccess(user.role);
          onClose();
        } else {
          setError('No confirmed account matches that email and password.');
        }
      } else if (view === 'forgot') {
        const result = await db.sendPasswordResetEmail(normalizedEmail);
        if (result.success) {
          setSuccessMessage('A password reset link has been sent to your email.');
        } else {
          setError(result.error || 'Failed to send reset link. Please check your email and try again.');
        }
      } else if (view === 'reset_password') {
        const updateSuccess = await db.updatePassword(password);
        if (updateSuccess) {
          const user = await db.getCurrentUser();
          onLoginSuccess(user ? user.role : 'customer');
          onClose();
        } else {
          setError('Failed to update password. Please open the reset link again and try once more.');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string) => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    try {
      const user = await db.login(quickEmail, 'Flavore123!');
      if (user) {
        onLoginSuccess(user.role);
        onClose();
      } else {
        setError('Demo login failed. Make sure seed users are created.');
      }
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card border border-border/30 rounded-2xl w-full max-w-[420px] shadow-2xl overflow-hidden relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent/10 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {view !== 'signin' && (
          <button
            onClick={() => {
              setView('signin');
              setError('');
              setSuccessMessage('');
            }}
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent/10 cursor-pointer flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}

        {view === 'signin' && (
          <button
            onClick={() => {
              onClose();
              navigate('/');
            }}
            className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-accent/10 cursor-pointer flex items-center gap-1 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
        )}

        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h3 className="font-display text-2xl font-bold mb-1 text-foreground animate-fade-in">
              {view === 'signin' && 'Welcome to Flavoré'}
              {view === 'signup' && 'Create an Account'}
              {view === 'forgot' && 'Reset Password'}
              {view === 'reset_password' && 'Choose New Password'}
            </h3>
            <p className="text-xs text-muted-foreground">
              {view === 'signin' && 'Sign in to manage reservations, order food, and access dashboards.'}
              {view === 'signup' && 'Sign up to book tables, order food, and earn gourmet rewards.'}
              {view === 'forgot' && "Enter your email address and we'll send you a recovery link."}
              {view === 'reset_password' && 'Enter a new password for your account.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setError('');
                    }}
                    placeholder="John Doe"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 text-foreground transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {view !== 'reset_password' && (
              <div>
                <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                      setSuccessMessage('');
                    }}
                    placeholder="name@example.com"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 text-foreground transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {view === 'reset_password' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1.5">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 text-foreground transition-all disabled:opacity-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground/80 mb-1.5">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 text-foreground transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </>
            )}

            {view !== 'forgot' && view !== 'reset_password' && (
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-semibold text-foreground/80">Password</label>
                  {view === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setView('forgot');
                        setError('');
                        setSuccessMessage('');
                      }}
                      className="text-[10px] text-accent hover:underline font-medium cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary border border-border/30 text-sm focus:outline-none focus:border-accent/60 focus:ring-1 focus:ring-accent/40 text-foreground transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            )}

            {error && <p className="text-[11px] text-destructive mt-1.5 font-medium">{error}</p>}
            {successMessage && <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">{successMessage}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:shadow-md hover:bg-accent/90 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Processing...
                </>
              ) : view === 'signup' ? (
                'Sign Up'
              ) : view === 'signin' ? (
                'Sign In'
              ) : view === 'forgot' ? (
                'Send Link'
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            {view === 'forgot' || view === 'reset_password' ? (
              <button
                type="button"
                onClick={() => {
                  setView('signin');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-xs text-accent hover:underline font-medium cursor-pointer"
              >
                Back to Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setView(view === 'signin' ? 'signup' : 'signin');
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-xs text-accent hover:underline font-medium cursor-pointer"
              >
                {view === 'signin' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
              </button>
            )}
          </div>


        </div>
      </motion.div>
    </div>
  );
};
