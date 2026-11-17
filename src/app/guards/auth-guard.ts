import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Data, Rol } from '../services/data';

/** Verifica que haya sesión iniciada y que el rol tenga acceso a la ruta (data.roles). */
export const authGuard: CanActivateFn = (route) => {
  const data = inject(Data);
  const router = inject(Router);
  const usuario = data.usuarioActual();
  if (!usuario) return router.parseUrl('/login');

  const roles = route.data?.['roles'] as Rol[] | undefined;
  if (roles && !roles.includes(usuario.rol)) return router.parseUrl('/inicio');
  return true;
};
