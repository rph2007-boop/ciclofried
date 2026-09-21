import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, Send } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    const { success } = await resetPassword(email);
    setIsSubmitting(false);
    
    if (success) {
      setIsSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <Helmet>
        <title>Reset Password | FriendManager</title>
      </Helmet>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50"
      >
        <div className="p-8 sm:p-12">
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-sm">
              <KeyRound className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">Forgot Password?</h1>
            <p className="text-gray-500 text-sm px-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {!isSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 placeholder-gray-400 hover:bg-white"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Send Reset Link <Send className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center bg-green-50 p-6 rounded-2xl border border-green-100"
            >
              <h3 className="text-green-800 font-bold mb-2">Check your email</h3>
              <p className="text-green-600 text-sm">
                We've sent password reset instructions to <span className="font-semibold">{email}</span>
              </p>
              <Button 
                variant="outline" 
                className="mt-4 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
                onClick={() => setIsSent(false)}
              >
                Try another email
              </Button>
            </motion.div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;