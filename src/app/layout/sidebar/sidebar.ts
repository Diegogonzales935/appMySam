import { Component, computed, inject, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Data, Rol } from '../../services/data';

interface Enlace {
  ruta: string;
  texto: string;
  icono: string;
  roles: Rol[];
}

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar {
  private readonly data = inject(Data);
  readonly navegar = output<void>();

  private readonly enlaces: Enlace[] = [
    { ruta: '/inicio', texto: 'Inicio', icono: 'bi-house', roles: ['Mesero', 'Chef', 'Cajero', 'Propietario'] },
    { ruta: '/mesero/registro-pedido', texto: 'Registrar pedido', icono: 'bi-journal-plus', roles: ['Mesero', 'Propietario'] },
    { ruta: '/mesero/mis-pedidos', texto: 'Mis pedidos', icono: 'bi-list-check', roles: ['Mesero', 'Propietario'] },
    { ruta: '/cocina', texto: 'Cocina', icono: 'bi-fire', roles: ['Chef', 'Propietario'] },
    { ruta: '/caja', texto: 'Caja', icono: 'bi-cash-coin', roles: ['Cajero', 'Propietario'] },
    { ruta: '/reportes', texto: 'Reportes', icono: 'bi-bar-chart', roles: ['Propietario'] },
    { ruta: '/carta', texto: 'Carta de productos', icono: 'bi-book', roles: ['Propietario'] },
  ];

  protected readonly menu = computed(() => {
    const rol = this.data.usuarioActual()?.rol;
    return rol ? this.enlaces.filter((e) => e.roles.includes(rol)) : [];
  });
}
