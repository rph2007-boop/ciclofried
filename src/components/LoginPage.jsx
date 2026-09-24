import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, ArrowRight, UserCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, currentUser, startGuestSession } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsSubmitting(true);
    const { success } = await login(email, password);
    setIsSubmitting(false);
    
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGuestLogin = () => {
    startGuestSession();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Helmet>
        <title>{t('auth.loginTitle')} | CicloFriend</title>
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full sm:max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 mb-6">
          <div className="p-6 sm:p-12">
            <div className="text-center mb-8 sm:mb-10">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-200 transform rotate-3">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 mb-2">{t('auth.loginTitle')}</h1>
              <p className="text-sm sm:text-base text-gray-500">{t('auth.loginSubtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">{t('auth.emailLabel')}</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 placeholder-gray-400 hover:bg-white min-h-[48px]"
                    placeholder={t('auth.emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-semibold text-gray-700">{t('auth.passwordLabel')}</label>
                  <Link 
                    to="/forgot-password" 
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {t('auth.forgotPasswordLink')}
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 placeholder-gray-400 hover:bg-white min-h-[48px]"
                    placeholder={t('auth.passwordPlaceholder')}
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group min-h-[48px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {t('auth.signInButton')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-500 text-sm">
                {t('auth.noAccount')}{' '}
                <Link 
                  to="/signup" 
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors p-2"
                >
                  {t('auth.signUpButton')}
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Guest Mode Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-3xl border border-white/50 p-6 text-center">
          <h3 className="font-bold text-gray-900 mb-2">Começar sem fazer login</h3>
          <p className="text-sm text-gray-500 mb-4">
            Experimente todas as funcionalidades do app. Seus dados não serão salvos sem criar uma conta.
          </p>
          <Button 
            variant="outline"
            className="w-full h-12 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 rounded-xl font-semibold transition-all min-h-[48px]"
            onClick={handleGuestLogin}
          >
            <UserCircle2 className="w-5 h-5 mr-2" />
            Experimentar Agora
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;