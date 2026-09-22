import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

/**
 * AuthGuard — Protege las rutas de tabs.
 * Soporta tanto localStorage (web, sincrónico) como Capacitor Preferences
 * (nativo, asíncrono). Al iniciar, sincroniza Preferences → localStorage
 * para que la sesión sobreviva cierres de la app.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);

  // 1. Intentar leer desde Capacitor Preferences (nativo/persistente)
  const { value: prefLoggedIn } = await Preferences.get({ key: 'isLoggedIn' });

  if (prefLoggedIn) {
    // Sincronizar al localStorage para operaciones síncronas dentro de la app
    const parsed = JSON.parse(prefLoggedIn);
    if (parsed === true) {
      localStorage.setItem('isLoggedIn', 'true');

      const { value: prefUserId } = await Preferences.get({ key: 'user_id' });
      if (prefUserId) {
        localStorage.setItem('user_id', JSON.parse(prefUserId));
      }
      return true;
    }
  }

  // 2. Fallback: revisar localStorage (para compatibilidad en web en la misma sesión)
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  if (isLoggedIn) {
    return true;
  }

  // No autenticado → redirigir al login
  router.navigateByUrl('/login');
  return false;
};