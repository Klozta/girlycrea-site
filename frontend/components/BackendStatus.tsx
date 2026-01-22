'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function BackendStatus() {
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Essayer de récupérer le token CSRF (endpoint simple)
        await api.getCsrfToken();
        setIsOnline(true);
      } catch (error: any) {
        setIsOnline(false);
      } finally {
        setChecking(false);
      }
    };

    checkBackend();
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkBackend, 30000);
    return () => clearInterval(interval);
  }, []);

  if (checking || isOnline) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
        <div>
          <p className="text-sm font-medium text-yellow-800">
            Backend non accessible
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            Le serveur backend n'est pas accessible. Assurez-vous qu'il est lancé sur le port 3001.
          </p>
        </div>
      </div>
    </div>
  );
}



