# ShortKeep Frontend

Aplicación web para gestionar y guardar shorts de YouTube.

## Requisitos

- Node.js 18+
- npm

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

La app corre en `http://localhost:5173`. Las peticiones a `/api` se redirigen al backend en `http://localhost:3000`.

## Build

```bash
npm run build
```

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/login` | Iniciar sesión |
| `/register` | Registrarse |
| `/myshorts` | Shorts guardados |
| `/explore` | Explorar últimos shorts |
| `/channels` | Gestionar canales |
| `/channels/:id` | Detalle del canal |
