import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Data } from '../../services/data';

@Component({
  imports: [FormsModule, CurrencyPipe],
  selector: 'app-carta',
  styleUrl: './carta.css',
  templateUrl: './carta.html',
})
export class Carta {
  protected readonly data = inject(Data);

  nombre = '';
  categoria = '';
  precio: number | null = null;
  protected readonly mensaje = signal<{ ok: boolean; texto: string } | null>(null);

  agregar(): void {
    const r = this.data.agregarProducto(this.nombre, this.categoria, Number(this.precio));
    this.mensaje.set({ ok: r.ok, texto: r.mensaje });
    if (r.ok) {
      this.nombre = '';
      this.categoria = '';
      this.precio = null;
    }
  }
}
