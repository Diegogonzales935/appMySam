# Chifa MY SAM – Gestión de pedidos, órdenes y ventas

Trabajo Parcial (TB1) · Desarrollo para Entorno Web · UPC 2026-2 · Grupo 4

Aplicación web en **Angular + Bootstrap 5** que digitaliza el registro de pedidos, las comandas de cocina, los cobros en caja y los reportes de ventas del chifa MY SAM.

## Ejecutar

```bash
npm install
npm start          # http://localhost:4200
npm test           # pruebas unitarias
```

### Usuarios de prueba (contraseña `123`)

| Usuario   | Rol         |
|-----------|-------------|
| mesero    | Mesero      |
| mesero2   | Mesero      |
| chef      | Chef        |
| cajero    | Cajero      |
| admin     | Propietario |

> Los datos se guardan en memoria (servicio `Data`); al recargar la página se reinician.

## Estructura

```
src/app
├── layout/                 # Plantilla principal
│   ├── header/             # Barra superior (usuario, cerrar sesión)
│   ├── sidebar/            # Menú lateral según el rol
│   ├── footer/
│   └── layout.ts|html|css
├── pages/
│   ├── home/               # Página pública: Home, Resumen, Carta y Contacto
│   ├── login/              # Inicio de sesión
│   ├── inicio/             # Resumen y accesos por rol
│   ├── mesero/
│   │   ├── registro-pedido/  # HU01
│   │   └── mis-pedidos/      # HU04
│   ├── cocina/             # HU02, HU03
│   ├── caja/               # HU05
│   ├── reportes/           # HU06
│   └── carta/              # Gestión de carta (propietario)
├── services/data.ts        # Modelos, datos y reglas de negocio
├── guards/auth-guard.ts    # Sesión y acceso por rol
├── app.routes.ts
└── app.config.ts
```

## Historias de usuario

| HU   | Pantalla                 | Rol         |
|------|--------------------------|-------------|
| HU01 | Registro de pedido       | Mesero      |
| HU02 | Tablero de cocina        | Chef        |
| HU03 | Cambio de estado (cocina)| Chef        |
| HU04 | Mis pedidos / entrega    | Mesero      |
| HU05 | Caja y vouchers          | Cajero      |
| HU06 | Reportes de ventas       | Propietario |

## Flujo de ramas

- `main`: versión estable
- `develop`: integración
- `feature/<nombre>`: una rama por funcionalidad, integrada mediante pull request a `develop`
