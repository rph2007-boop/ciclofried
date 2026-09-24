import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/customSupabaseClient.js';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    async function getInitialSession() {
      try {
        const guestSession = localStorage.getItem('guestSession');
        
        if (guestSession === 'true') {
          if (mounted) {
            setIsGuest(true);
            setCurrentUser({ 
              id: 'guest_user', 
              email: 'visitante@demo.com', 
              user_metadata: { name: 'Visitante' } 
            });
            setIsLoading(false);
          }
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        
        if (error) console.error("Error getting session:", error);

        if (mounted) {
          if (data?.session?.user) {
            setCurrentUser(data.session.user);
            setIsGuest(false);
            setSyncTrigger(prev => prev + 1);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Unexpected error checking auth session:", error);
        if (mounted) setIsLoading(false);
      }
    }

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session?.user) {
          setCurrentUser(session.user);
          setIsGuest(false);
          localStorage.removeItem('guestSession');
          setSyncTrigger(prev => prev + 1);
        } else if (!localStorage.getItem('guestSession')) {
           setCurrentUser(null);
           setIsGuest(false);
        }
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      if (isGuest) {
        endGuestSession();
      }

      toast({
        title: "Bem-vindo de volta!",
        description: "Login realizado com sucesso.",
      });
      return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Falha no login",
        description: error.message || "Credenciais inválidas",
      });
      return { success: false, error };
    }
  };

  const signup = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Conta criada com sucesso",
        description: "Você já pode fazer login.",
      });
      return { success: true, data };
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Falha no cadastro",
        description: error.message,
      });
      return { success: false, error };
    }
  };

  const logout = async () => {
    if (isGuest) {
      endGuestSession();
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Desconectado",
        description: "Até logo!",
      });
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Erro ao sair",
        description: error.message,
      });
      return { success: false, error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      toast({
        title: "E-mail enviado",
        description: "Verifique sua caixa de entrada.",
      });
      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        variant: "destructive",
        title: "Erro na solicitação",
        description: error.message,
      });
      return { success: false, error };
    }
  };

  const startGuestSession = () => {
    setIsGuest(true);
    setCurrentUser({ 
      id: 'guest_user', 
      email: 'visitante@demo.com',
      user_metadata: { name: 'Visitante' }
    });
    localStorage.setItem('guestSession', 'true');
    toast({
      title: "Modo de Teste Iniciado",
      description: "Você está acessando como visitante.",
    });
  };

  const endGuestSession = () => {
    setIsGuest(false);
    setCurrentUser(null);
    localStorage.removeItem('guestSession');
    
    const guestKeys = ['guest_friends', 'guest_categories', 'guest_meetings', 'guest_events', 'guest_preferences'];
    guestKeys.forEach(key => localStorage.removeItem(key));
    
    toast({
      title: "Sessão de Teste Finalizada",
      description: "Seus dados temporários foram limpos.",
    });
  };

  const value = {
    currentUser,
    isLoading,
    isGuest,
    syncTrigger,
    login,
    signup,
    logout,
    resetPassword,
    startGuestSession,
    endGuestSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};