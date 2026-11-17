import { Injectable, computed, signal } from '@angular/core';

// ===== Modelos =====
export type Rol = 'Mesero' | 'Chef' | 'Cajero' | 'Propietario';
export type EstadoOrden = 'En espera' | 'En preparación' | 'Listo para entregar' | 'Entregado';
export type TipoPedido = 'Mesa' | 'Para llevar';
export type MetodoPago = 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin';

export interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  clave: string;
  rol: Rol;
}

export interface Producto {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
}

export interface LineaPedido {
  id: number;
  producto: Producto;
  cantidad: number;
  indicaciones: string;
  pagado: boolean;
}

export interface Orden {
  id: number;
  cuentaId: number;
  tipo: TipoPedido;
  mesa: number | null;
  lineas: LineaPedido[];
  estado: EstadoOrden;
  mesero: string;
  chef: string | null;
  hora: Date;
}

export interface Cuenta {
  id: number;
  tipo: TipoPedido;
  mesa: number | null;
  mesero: string;
  estado: 'Abierta' | 'Pagada';
  lineas: LineaPedido[];
}

export interface Pago {
  id: number;
  cuentaId: number;
  mesa: number | null;
  mesero: string;
  metodo: MetodoPago;
  monto: number;
  fecha: Date;
  lineas: LineaPedido[];
}

export const SECUENCIA_ESTADOS: EstadoOrden[] = [
  'En espera',
  'En preparación',
  'Listo para entregar',
  'Entregado',
];

export interface Resultado {
  ok: boolean;
  mensaje: string;
}

@Injectable({ providedIn: 'root' })
export class Data {
  private nextId = 1000;

  // ===== Datos de prueba =====
  readonly usuarios: Usuario[] = [
    { id: 1, nombre: 'Carlos Ramos', usuario: 'mesero', clave: '123', rol: 'Mesero' },
    { id: 2, nombre: 'Lucía Torres', usuario: 'mesero2', clave: '123', rol: 'Mesero' },
    { id: 3, nombre: 'Wong Li', usuario: 'chef', clave: '123', rol: 'Chef' },
    { id: 4, nombre: 'Ana Quispe', usuario: 'cajero', clave: '123', rol: 'Cajero' },
    { id: 5, nombre: 'Sam Chang', usuario: 'admin', clave: '123', rol: 'Propietario' },
  ];

  readonly productos = signal<Producto[]>([
    { id: 1, nombre: 'Arroz chaufa de pollo', categoria: 'Arroces', precio: 18 },
    { id: 2, nombre: 'Arroz chaufa especial', categoria: 'Arroces', precio: 24 },
    { id: 3, nombre: 'Aeropuerto', categoria: 'Arroces', precio: 22 },
    { id: 4, nombre: 'Tallarín saltado', categoria: 'Tallarines', precio: 20 },
    { id: 5, nombre: 'Tallarín con pato', categoria: 'Tallarines', precio: 28 },
    { id: 6, nombre: 'Pollo chi jau kay', categoria: 'Platos de fondo', precio: 26 },
    { id: 7, nombre: 'Pollo tipakay', categoria: 'Platos de fondo', precio: 25 },
    { id: 8, nombre: 'Kam lu wantán', categoria: 'Platos de fondo', precio: 30 },
    { id: 9, nombre: 'Sopa wantán', categoria: 'Sopas', precio: 15 },
    { id: 10, nombre: 'Sopa fuchifú', categoria: 'Sopas', precio: 14 },
    { id: 11, nombre: 'Wantán frito (6 u.)', categoria: 'Entradas', precio: 10 },
    { id: 12, nombre: 'Inca Kola 1L', categoria: 'Bebidas', precio: 8 },
    { id: 13, nombre: 'Chicha morada (jarra)', categoria: 'Bebidas', precio: 12 },
  ]);

  readonly mesas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  readonly metodosPago: MetodoPago[] = ['Efectivo', 'Tarjeta', 'Yape', 'Plin'];

  readonly usuarioActual = signal<Usuario | null>(this.leerSesion());
  readonly cuentas = signal<Cuenta[]>([]);
  readonly ordenes = signal<Orden[]>([]);
  readonly pagos = signal<Pago[]>([]);

  readonly cuentasAbiertas = computed(() => this.cuentas().filter((c) => c.estado === 'Abierta'));

  constructor() {
    this.cargarDatosIniciales();
  }

  // ===== Sesión =====
  login(usuario: string, clave: string): Resultado {
    const u = this.usuarios.find((x) => x.usuario === usuario.trim() && x.clave === clave);
    if (!u) return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
    this.usuarioActual.set(u);
    try {
      sessionStorage.setItem('mysam-usuario', String(u.id));
    } catch {}
    return { ok: true, mensaje: `Bienvenido(a), ${u.nombre}` };
  }

  logout(): void {
    this.usuarioActual.set(null);
    try {
      sessionStorage.removeItem('mysam-usuario');
    } catch {}
  }

  private leerSesion(): Usuario | null {
    try {
      const id = Number(sessionStorage.getItem('mysam-usuario'));
      return this.usuarios.find((u) => u.id === id) ?? null;
    } catch {
      return null;
    }
  }

  // ===== HU01: Registro de pedidos =====
  registrarPedido(
    tipo: TipoPedido,
    mesa: number | null,
    items: { producto: Producto; cantidad: number; indicaciones: string }[],
  ): Resultado {
    const mesero = this.usuarioActual()?.nombre ?? 'Sin mesero';
    if (tipo === 'Mesa' && !mesa) {
      return { ok: false, mensaje: 'Debe seleccionar una mesa antes de registrar el pedido.' };
    }
    if (items.length === 0 || items.some((i) => !Number.isInteger(i.cantidad) || i.cantidad < 1)) {
      return {
        ok: false,
        mensaje: 'Debe completar la información: seleccione productos e indique cantidades válidas.',
      };
    }

    const lineas: LineaPedido[] = items.map((i) => ({
      id: this.nextId++,
      producto: i.producto,
      cantidad: i.cantidad,
      indicaciones: i.indicaciones.trim(),
      pagado: false,
    }));

    // Si la mesa tiene una cuenta abierta, se agrega a esa cuenta
    let cuenta =
      tipo === 'Mesa' ? this.cuentasAbiertas().find((c) => c.tipo === 'Mesa' && c.mesa === mesa) : undefined;

    if (cuenta) {
      const id = cuenta.id;
      this.cuentas.update((cs) =>
        cs.map((c) => (c.id === id ? { ...c, lineas: [...c.lineas, ...lineas] } : c)),
      );
    } else {
      cuenta = { id: this.nextId++, tipo, mesa: tipo === 'Mesa' ? mesa : null, mesero, estado: 'Abierta', lineas };
      this.cuentas.update((cs) => [...cs, cuenta!]);
    }

    const orden: Orden = {
      id: this.nextId++,
      cuentaId: cuenta.id,
      tipo,
      mesa: tipo === 'Mesa' ? mesa : null,
      lineas,
      estado: 'En espera',
      mesero,
      chef: null,
      hora: new Date(),
    };
    this.ordenes.update((os) => [...os, orden]);
    return { ok: true, mensaje: `Pedido registrado. Orden #${orden.id} enviada a cocina («En espera»).` };
  }

  // ===== HU03 / HU04: Cambio de estado =====
  cambiarEstado(ordenId: number, nuevo: EstadoOrden): Resultado {
    const orden = this.ordenes().find((o) => o.id === ordenId);
    if (!orden) return { ok: false, mensaje: 'La orden no existe.' };

    const actual = SECUENCIA_ESTADOS.indexOf(orden.estado);
    const siguiente = SECUENCIA_ESTADOS.indexOf(nuevo);
    if (siguiente !== actual + 1) {
      if (nuevo === 'Entregado') {
        return { ok: false, mensaje: `La orden #${orden.id} todavía no está lista para entregar.` };
      }
      return {
        ok: false,
        mensaje: `No se puede pasar de «${orden.estado}» a «${nuevo}». Debe respetarse la secuencia de estados.`,
      };
    }

    const usuario = this.usuarioActual()?.nombre ?? null;
    this.ordenes.update((os) =>
      os.map((o) =>
        o.id === ordenId
          ? { ...o, estado: nuevo, chef: nuevo === 'En preparación' ? usuario : o.chef }
          : o,
      ),
    );
    return { ok: true, mensaje: `Orden #${orden.id} actualizada a «${nuevo}».` };
  }

  // ===== HU05: Pagos =====
  registrarPago(cuentaId: number, lineaIds: number[], metodo: MetodoPago): Resultado {
    const cuenta = this.cuentas().find((c) => c.id === cuentaId);
    if (!cuenta || cuenta.estado !== 'Abierta') return { ok: false, mensaje: 'La cuenta no está abierta.' };
    const aPagar = cuenta.lineas.filter((l) => !l.pagado && lineaIds.includes(l.id));
    if (aPagar.length === 0) return { ok: false, mensaje: 'Seleccione al menos un producto a pagar.' };

    const monto = this.totalLineas(aPagar);
    const lineas = cuenta.lineas.map((l) => (lineaIds.includes(l.id) ? { ...l, pagado: true } : l));
    const pagada = lineas.every((l) => l.pagado);

    this.cuentas.update((cs) =>
      cs.map((c) => (c.id === cuentaId ? { ...c, lineas, estado: pagada ? 'Pagada' : 'Abierta' } : c)),
    );
    this.pagos.update((ps) => [
      ...ps,
      {
        id: this.nextId++,
        cuentaId,
        mesa: cuenta.mesa,
        mesero: cuenta.mesero,
        metodo,
        monto,
        fecha: new Date(),
        lineas: aPagar.map((l) => ({ ...l, pagado: true })),
      },
    ]);
    return {
      ok: true,
      mensaje: pagada
        ? `Pago de S/ ${monto.toFixed(2)} registrado. La cuenta quedó «Pagada».`
        : `Pago de S/ ${monto.toFixed(2)} registrado. Saldo pendiente: S/ ${this.saldo(cuentaId).toFixed(2)}.`,
    };
  }

  saldo(cuentaId: number): number {
    const c = this.cuentas().find((x) => x.id === cuentaId);
    return c ? this.totalLineas(c.lineas.filter((l) => !l.pagado)) : 0;
  }

  totalLineas(lineas: LineaPedido[]): number {
    return lineas.reduce((s, l) => s + l.producto.precio * l.cantidad, 0);
  }

  // ===== Gestión de carta (Propietario) =====
  agregarProducto(nombre: string, categoria: string, precio: number): Resultado {
    if (!nombre.trim() || !categoria.trim() || !(precio > 0)) {
      return { ok: false, mensaje: 'Complete nombre, categoría y un precio mayor a 0.' };
    }
    this.productos.update((ps) => [
      ...ps,
      { id: this.nextId++, nombre: nombre.trim(), categoria: categoria.trim(), precio },
    ]);
    return { ok: true, mensaje: 'Producto agregado a la carta.' };
  }

  // ===== Mensajes de contacto (página pública) =====
  readonly mensajes = signal<{ nombre: string; correo: string; mensaje: string; fecha: Date }[]>([]);

  registrarMensaje(nombre: string, correo: string, mensaje: string): void {
    this.mensajes.update((ms) => [
      ...ms,
      { nombre: nombre.trim(), correo: correo.trim(), mensaje: mensaje.trim(), fecha: new Date() },
    ]);
  }

  // ===== Datos de ejemplo para reportes =====
  private cargarDatosIniciales(): void {
    const p = this.productos();
    const metodos = this.metodosPago;
    const meseros = ['Carlos Ramos', 'Lucía Torres'];
    const pagos: Pago[] = [];
    for (let d = 1; d <= 20; d++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - d);
      fecha.setHours(13 + (d % 8), 15, 0, 0);
      const lineas: LineaPedido[] = [
        { id: this.nextId++, producto: p[d % p.length], cantidad: 1 + (d % 3), indicaciones: '', pagado: true },
        { id: this.nextId++, producto: p[(d * 3) % p.length], cantidad: 1, indicaciones: '', pagado: true },
      ];
      pagos.push({
        id: this.nextId++,
        cuentaId: this.nextId++,
        mesa: (d % 10) + 1,
        mesero: meseros[d % 2],
        metodo: metodos[d % metodos.length],
        monto: this.totalLineas(lineas),
        fecha,
        lineas,
      });
    }
    this.pagos.set(pagos);
  }
}
