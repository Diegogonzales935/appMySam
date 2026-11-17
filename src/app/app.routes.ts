import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Layout } from './layout/layout';
import { Login } from './pages/login/login';
import { Inicio } from './pages/inicio/inicio';
import { RegistroPedido } from './pages/mesero/registro-pedido/registro-pedido';
import { MisPedidos } from './pages/mesero/mis-pedidos/mis-pedidos';
import { Cocina } from './pages/cocina/cocina';
import { Caja } from './pages/caja/caja';
import { Reportes } from './pages/reportes/reportes';
import { Carta } from './pages/carta/carta';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Home, title: 'Chifa MY SAM' },
  { path: 'login', component: Login, title: 'Iniciar sesión | MY SAM' },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'inicio', component: Inicio, title: 'Inicio | MY SAM' },
      {
        path: 'mesero/registro-pedido',
        component: RegistroPedido,
        title: 'Registro de pedido | MY SAM',
        data: { roles: ['Mesero', 'Propietario'] },
      },
      {
        path: 'mesero/mis-pedidos',
        component: MisPedidos,
        title: 'Mis pedidos | MY SAM',
        data: { roles: ['Mesero', 'Propietario'] },
      },
      {
        path: 'cocina',
        component: Cocina,
        title: 'Cocina | MY SAM',
        data: { roles: ['Chef', 'Propietario'] },
      },
      {
        path: 'caja',
        component: Caja,
        title: 'Caja | MY SAM',
        data: { roles: ['Cajero', 'Propietario'] },
      },
      {
        path: 'reportes',
        component: Reportes,
        title: 'Reportes | MY SAM',
        data: { roles: ['Propietario'] },
      },
      {
        path: 'carta',
        component: Carta,
        title: 'Carta | MY SAM',
        data: { roles: ['Propietario'] },
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
