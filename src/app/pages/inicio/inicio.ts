import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Data } from '../../services/data';

@Component({
  imports: [RouterLink],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio {
  private readonly data = inject(Data);
  protected readonly usuario = this.data.usuarioActual;

  protected readonly resumen = computed(() => {
    const os = this.data.ordenes();
    return {
      espera: os.filter((o) => o.estado === 'En espera').length,
      preparacion: os.filter((o) => o.estado === 'En preparación').length,
      listas: os.filter((o) => o.estado === 'Listo para entregar').length,
      cuentas: this.data.cuentasAbiertas().length,
    };
  });

  protected readonly accesos = computed(() => {
    const rol = this.usuario()?.rol;
    const todos = [
      { ruta: '/mesero/registro-pedido', titulo: 'Registrar pedido', desc: 'Toma pedidos de mesa o para llevar.', icono: 'bi-journal-plus', roles: ['Mesero', 'Propietario'] },
      { ruta: '/mesero/mis-pedidos', titulo: 'Mis pedidos', desc: 'Revisa el estado y confirma entregas.', icono: 'bi-list-check', roles: ['Mesero', 'Propietario'] },
      { ruta: '/cocina', titulo: 'Cocina', desc: 'Comandas en orden de llegada.', icono: 'bi-fire', roles: ['Chef', 'Propietario'] },
      { ruta: '/caja', titulo: 'Caja', desc: 'Cobros, pagos parciales y vouchers.', icono: 'bi-cash-coin', roles: ['Cajero', 'Propietario'] },
      { ruta: '/reportes', titulo: 'Reportes', desc: 'Ventas por fecha, producto, método y mesero.', icono: 'bi-bar-chart', roles: ['Propietario'] },
      { ruta: '/carta', titulo: 'Carta', desc: 'Administra los productos de la carta.', icono: 'bi-book', roles: ['Propietario'] },
    ];
    return rol ? todos.filter((a) => a.roles.includes(rol)) : [];
  });
}
