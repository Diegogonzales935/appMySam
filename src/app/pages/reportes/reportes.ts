import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Data, Pago } from '../../services/data';

interface Fila {
  nombre: string;
  cantidad: number;
  monto: number;
}

function aFecha(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function agrupar(pagos: Pago[], clave: (p: Pago) => string): Fila[] {
  const mapa = new Map<string, Fila>();
  for (const p of pagos) {
    const k = clave(p);
    const f = mapa.get(k) ?? { nombre: k, cantidad: 0, monto: 0 };
    f.cantidad++;
    f.monto += p.monto;
    mapa.set(k, f);
  }
  return [...mapa.values()].sort((a, b) => b.monto - a.monto);
}

@Component({
  imports: [FormsModule, CurrencyPipe, DatePipe],
  selector: 'app-reportes',
  styleUrl: './reportes.css',
  templateUrl: './reportes.html',
})
export class Reportes {
  private readonly data = inject(Data);

  protected readonly desde = signal(aFecha(new Date(Date.now() - 30 * 86400000)));
  protected readonly hasta = signal(aFecha(new Date()));

  // HU06: pagos del periodo seleccionado
  protected readonly pagos = computed(() => {
    const d = this.desde();
    const h = this.hasta();
    return this.data
      .pagos()
      .filter((p) => {
        const f = aFecha(p.fecha);
        return (!d || f >= d) && (!h || f <= h);
      })
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
  });

  protected readonly total = computed(() => this.pagos().reduce((s, p) => s + p.monto, 0));
  protected readonly porMetodo = computed(() => agrupar(this.pagos(), (p) => p.metodo));
  protected readonly porMesero = computed(() => agrupar(this.pagos(), (p) => p.mesero));

  protected readonly productos = computed(() => {
    const mapa = new Map<string, Fila>();
    for (const p of this.pagos()) {
      for (const l of p.lineas) {
        const f = mapa.get(l.producto.nombre) ?? { nombre: l.producto.nombre, cantidad: 0, monto: 0 };
        f.cantidad += l.cantidad;
        f.monto += l.cantidad * l.producto.precio;
        mapa.set(l.producto.nombre, f);
      }
    }
    return [...mapa.values()].sort((a, b) => b.cantidad - a.cantidad);
  });

  porcentaje(monto: number): number {
    return this.total() ? Math.round((monto / this.total()) * 100) : 0;
  }
}
