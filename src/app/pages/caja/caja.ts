import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Data, MetodoPago, Pago } from '../../services/data';

@Component({
  imports: [FormsModule, CurrencyPipe, DatePipe],
  selector: 'app-caja',
  styleUrl: './caja.css',
  templateUrl: './caja.html',
})
export class Caja {
  protected readonly data = inject(Data);

  protected readonly busqueda = signal('');
  protected readonly cuentaId = signal<number | null>(null);
  protected readonly seleccion = signal<number[]>([]);
  protected readonly metodo = signal<MetodoPago>('Efectivo');
  protected readonly mensaje = signal<{ ok: boolean; texto: string } | null>(null);
  protected readonly ultimoPago = signal<Pago | null>(null);

  // HU05: buscar cuentas por número de mesa
  protected readonly cuentas = computed(() => {
    const q = this.busqueda().trim();
    return this.data
      .cuentasAbiertas()
      .filter((c) => !q || (c.tipo === 'Mesa' ? String(c.mesa) === q : 'llevar'.includes(q.toLowerCase())));
  });

  protected readonly cuenta = computed(() => this.data.cuentas().find((c) => c.id === this.cuentaId()) ?? null);
  protected readonly pendientes = computed(() => this.cuenta()?.lineas.filter((l) => !l.pagado) ?? []);
  protected readonly saldo = computed(() => this.data.totalLineas(this.pendientes()));
  protected readonly importe = computed(() =>
    this.data.totalLineas(this.pendientes().filter((l) => this.seleccion().includes(l.id))),
  );

  abrir(id: number): void {
    this.cuentaId.set(id);
    this.seleccion.set([]);
    this.mensaje.set(null);
    this.ultimoPago.set(null);
  }

  alternar(id: number, marcado: boolean): void {
    this.seleccion.update((s) => (marcado ? [...s, id] : s.filter((x) => x !== id)));
  }

  seleccionarTodo(): void {
    this.seleccion.set(this.pendientes().map((l) => l.id));
  }

  pagar(): void {
    const id = this.cuentaId();
    if (id === null) return;
    const r = this.data.registrarPago(id, this.seleccion(), this.metodo());
    this.mensaje.set({ ok: r.ok, texto: r.mensaje });
    if (r.ok) {
      this.ultimoPago.set(this.data.pagos().at(-1) ?? null);
      this.seleccion.set([]);
    }
  }

  imprimir(): void {
    window.print();
  }
}
