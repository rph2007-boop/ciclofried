import React from 'react';
import { AlertTriangle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const GuestModeIndicator = () => {
  const navigate = useNavigate();
  const { isGuest, endGuestSession } = useAuth();

  if (!isGuest) return null;

  const handleLoginClick = async () => {
    await endGuestSession();
    navigate('/login');
  };

  return (
    <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex items-center gap-3 text-amber-800">
          <div className="p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Modo de Teste Ativo</p>
            <p className="text-xs opacity-90">Os dados criados nesta sessão não serão salvos permanentemente.</p>
          </div>
        </div>
        
        <Button 
          size="sm" 
          variant="outline" 
          className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100 hover:text-amber-950 whitespace-nowrap text-xs font-semibold"
          onClick={handleLoginClick}
        >
          <LogIn className="w-3 h-3 mr-2" />
          Fazer Login
        </Button>
      </div>
    </div>
  );
};

export default GuestModeIndicator;