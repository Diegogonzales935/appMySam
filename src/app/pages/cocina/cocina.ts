import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Data, EstadoOrden } from '../../services/data';
import { COLOR_ESTADO } from '../mesero/mis-pedidos/mis-pedidos';

@Component({
  imports: [DatePipe],
  selector: 'app-cocina',
  styleUrl: './cocina.css',
  templateUrl: './cocina.html',
})
export class Cocina {
  private readonly data = inject(Data);
  protected readonly color = COLOR_ESTADO;
  protected readonly mensaje = signal<{ ok: boolean; texto: string } | null>(null);

  // HU02: órdenes pendientes ordenadas por hora de registro (orden de llegada)
  protected readonly pendientes = computed(() =>
    this.data
      .ordenes()
      .filter((o) => o.estado === 'En espera' || o.estado === 'En preparación')
      .sort((a, b) => a.hora.getTime() - b.hora.getTime()),
  );

  protected readonly listas = computed(() =>
    this.data.ordenes().filter((o) => o.estado === 'Listo para entregar'),
  );

  // HU03: actualización de estado respetando la secuencia
  cambiar(id: number, estado: EstadoOrden): void {
    const r = this.data.cambiarEstado(id, estado);
    this.mensaje.set({ ok: r.ok, texto: r.mensaje });
  }
}
