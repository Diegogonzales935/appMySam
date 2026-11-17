# Cómo trabajar en el repositorio (Grupo 4)

## 1. Primera vez

```bash
git clone <URL-del-repositorio>
cd appMySam
npm install
npm start            # http://localhost:4200
```

## 2. Ramas

| Rama               | Para qué                                                      |
|--------------------|---------------------------------------------------------------|
| `main`             | Versión estable (la que se entrega y se publica en Vercel). No se sube directo. |
| `develop`          | Integración del equipo. Aquí llegan los pull requests.        |
| `feature/<tema>`   | Una por tarea. Ej.: `feature/hu05-caja`, `feature/home-contacto`. |

## 3. Flujo para subir tu parte

```bash
git checkout develop
git pull                               # trae lo último del equipo
git checkout -b feature/mi-tarea       # crea tu rama

# ... trabajas ...
npm test                               # que todo pase
git add .
git commit -m "feat: descripción corta de lo que hiciste"
git push -u origin feature/mi-tarea
```

Luego en GitHub abre un **Pull Request** de `feature/mi-tarea` hacia **`develop`**, y pide que otro compañero lo revise.
Cuando `develop` esté estable, se hace un Pull Request de `develop` hacia `main` para la entrega.

## 4. Mensajes de commit

- `feat:` nueva funcionalidad
- `fix:` corrección de un error
- `style:` cambios visuales/CSS
- `docs:` documentación
- `chore:` configuración, dependencias

## 5. Dónde va cada cosa

```
src/app
├── layout/      header, sidebar, footer
├── pages/       una carpeta por pantalla (home, login, mesero, cocina, caja, reportes, carta)
├── services/    data.ts – modelos y reglas de negocio
└── guards/      control de acceso por rol
```

Para crear una pantalla nueva: `npx ng g c pages/nombre` y agrega su ruta en `app.routes.ts`.
