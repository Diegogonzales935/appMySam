import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Data, Producto, TipoPedido } from '../../../services/data';

interface ItemCarrito {
  producto: Producto;
  cantidad: number;
  indicaciones: string;
}

@Component({
  imports: [FormsModule, CurrencyPipe],
  selector: 'app-registro-pedido',
  styleUrl: './registro-pedido.css',
  templateUrl: './registro-pedido.html',
})
export class RegistroPedido {
  protected readonly data = inject(Data);

  protected readonly tipo = signal<TipoPedido>('Mesa');
  protected readonly mesa = signal<number | null>(null);
  protected readonly categoria = signal('Todas');
  protected readonly carrito = signal<ItemCarrito[]>([]);
  protected readonly mensaje = signal<{ ok: boolean; texto: string } | null>(null);

  protected readonly categorias = computed(() => [
    'Todas',
    ...new Set(this.data.productos().map((p) => p.categoria)),
  ]);

  protected readonly productosFiltrados = computed(() =>
    this.categoria() === 'Todas'
      ? this.data.productos()
      : this.data.productos().filter((p) => p.categoria === this.categoria()),
  );

  protected readonly total = computed(() =>
    this.carrito().reduce((s, i) => s + i.producto.precio * (i.cantidad || 0), 0),
  );

  /** Mesas con cuenta abierta (para agregar nuevas solicitudes). */
  mesaAbierta(n: number): boolean {
    return this.data.cuentasAbiertas().some((c) => c.tipo === 'Mesa' && c.mesa === n);
  }

  cambiarTipo(t: TipoPedido): void {
    this.tipo.set(t);
    if (t === 'Para llevar') this.mesa.set(null);
  }

  agregar(p: Producto): void {
    this.mensaje.set(null);
    this.carrito.update((c) => {
      const existe = c.find((i) => i.producto.id === p.id);
      return existe
        ? c.map((i) => (i.producto.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i))
        : [...c, { producto: p, cantidad: 1, indicaciones: '' }];
    });
  }

  quitar(i: ItemCarrito): void {
    this.carrito.update((c) => c.filter((x) => x !== i));
  }

  actualizar(i: ItemCarrito, cambios: Partial<ItemCarrito>): void {
    this.carrito.update((c) => c.map((x) => (x === i ? { ...x, ...cambios } : x)));
  }

  confirmar(): void {
    const r = this.data.registrarPedido(this.tipo(), this.mesa(), this.carrito());
    this.mensaje.set({ ok: r.ok, texto: r.mensaje });
    if (r.ok) {
      this.carrito.set([]);
      this.mesa.set(null);
    }
  }
}
