'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

/**
 * Composant pour rehydrater manuellement le store Zustand après l'hydration React
 * Évite les erreurs de mismatch SSR/Client avec localStorage
 */
export function Hydration() {
  useEffect(() => {
    try {
      useStore.persist.rehydrate();
      console.log('✅ Store rehydrated successfully');
    } catch (error) {
      console.error('❌ Error rehydrating store:', error);
      // Ne pas propager l'erreur
    }
  }, []);

  return null;
}
