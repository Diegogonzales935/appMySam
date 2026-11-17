import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Data, Producto } from '../../services/data';

@Component({
  imports: [RouterLink, FormsModule, CurrencyPipe],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  private readonly data = inject(Data);

  protected readonly anio = new Date().getFullYear();
  protected readonly menuAbierto = signal(false);
  protected readonly sesion = this.data.usuarioActual;

  readonly secciones = [
    { id: 'home', texto: 'Home' },
    { id: 'resumen', texto: 'Resumen' },
    { id: 'carta', texto: 'Carta' },
    { id: 'contacto', texto: 'Contacto' },
  ];

  // Carta pública agrupada por categoría (se actualiza con la gestión de carta del propietario)
  protected readonly categoria = signal('Todas');
  protected readonly categorias = computed(() => [
    'Todas',
    ...new Set(this.data.productos().map((p) => p.categoria)),
  ]);
  protected readonly grupos = computed(() => {
    const mapa = new Map<string, Producto[]>();
    for (const p of this.data.productos()) {
      if (this.categoria() !== 'Todas' && p.categoria !== this.categoria()) continue;
      mapa.set(p.categoria, [...(mapa.get(p.categoria) ?? []), p]);
    }
    return [...mapa.entries()].map(([nombre, productos]) => ({ nombre, productos }));
  });

  // Formulario de contacto
  nombre = '';
  correo = '';
  mensajeTexto = '';
  protected readonly enviado = signal<{ ok: boolean; texto: string } | null>(null);

  irA(id: string): void {
    this.menuAbierto.set(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  }

  enviar(): void {
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.correo.trim());
    if (!this.nombre.trim() || !correoValido || this.mensajeTexto.trim().length < 10) {
      this.enviado.set({
        ok: false,
        texto: 'Completa tu nombre, un correo válido y un mensaje de al menos 10 caracteres.',
      });
      return;
    }
    this.data.registrarMensaje(this.nombre, this.correo, this.mensajeTexto);
    this.enviado.set({ ok: true, texto: `¡Gracias, ${this.nombre.trim()}! Recibimos tu mensaje.` });
    this.nombre = '';
    this.correo = '';
    this.mensajeTexto = '';
  }
}
