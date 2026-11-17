import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Data, EstadoOrden } from '../../../services/data';

export const COLOR_ESTADO: Record<EstadoOrden, string> = {
  'En espera': 'bg-warning text-dark',
  'En preparación': 'bg-primary',
  'Listo para entregar': 'bg-success',
  Entregado: 'bg-secondary',
};

@Component({
  imports: [DatePipe],
  selector: 'app-mis-pedidos',
  styleUrl: './mis-pedidos.css',
  templateUrl: './mis-pedidos.html',
})
export class MisPedidos {
  private readonly data = inject(Data);
  protected readonly mensaje = signal<{ ok: boolean; texto: string } | null>(null);
  protected readonly color = COLOR_ESTADO;

  /** El mesero ve sus pedidos; el propietario ve todos. */
  protected readonly ordenes = computed(() => {
    const u = this.data.usuarioActual();
    const os = this.data.ordenes();
    const propias = u?.rol === 'Propietario' ? os : os.filter((o) => o.mesero === u?.nombre);
    return [...propias].sort((a, b) => b.hora.getTime() - a.hora.getTime());
  });

  // HU04: confirmar entrega (solo si está «Listo para entregar»)
  confirmarEntrega(id: number): void {
    const r = this.data.cambiarEstado(id, 'Entregado');
    this.mensaje.set({ ok: r.ok, texto: r.mensaje });
  }
}
