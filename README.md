# Goowin Hub

Goowin Hub es un SaaS preparado como monorepo para crecer de forma ordenada con una API en NestJS, una aplicacion mobile en React Native, PostgreSQL como base de datos principal y Prisma ORM como capa de acceso a datos.

Este repositorio contiene solo la estructura inicial. No incluye logica de negocio, pantallas, modulos NestJS, endpoints, entidades de dominio ni modelos Prisma.

## Estructura

```txt
goowin-hub/
├── apps/
│   ├── api/
│   └── mobile/
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── BUSINESS_RULES.md
│   ├── ROADMAP.md
│   └── API_SPEC.md
├── infrastructure/
│   ├── docker/
│   └── scripts/
├── .github/
│   └── workflows/
├── .editorconfig
├── .gitignore
├── package.json
└── pnpm-workspace.yaml
```

## Decisiones de arquitectura

### Monorepo desde el inicio

Se usa un monorepo porque Goowin Hub tendra al menos dos superficies principales: backend y mobile. Esta decision permite versionar, revisar y coordinar cambios transversales desde un solo lugar sin acoplar logicamente las aplicaciones.

### Separacion por aplicaciones

`apps/api` y `apps/mobile` viven separados para mantener limites claros entre backend y cliente mobile. Cada app podra evolucionar con sus propias dependencias, scripts, pruebas y pipeline sin mezclar responsabilidades.

### Backend NestJS

NestJS se reserva para `apps/api` por su estructura modular, soporte para testing y buena ergonomia para SaaS con dominios, integraciones y reglas de negocio crecientes. En esta fase no se crea ningun modulo para evitar introducir decisiones de dominio prematuras.

### Mobile React Native

React Native se reserva para `apps/mobile` para permitir una base compartida entre iOS y Android. En esta fase no se crean pantallas ni navegacion porque todavia no se definieron flujos de producto.

### PostgreSQL como base transaccional

PostgreSQL sera la base de datos principal por su madurez, soporte transaccional, extensibilidad e idoneidad para productos SaaS multi-entidad. Las tablas se definiran cuando existan reglas de negocio aprobadas.

### Prisma ORM

Prisma se reserva dentro del backend como contrato tipado entre la API y PostgreSQL. No se crea `schema.prisma` todavia para evitar modelar entidades sin una definicion de dominio.

### Documentacion como contrato inicial

La carpeta `docs` existe desde el primer commit para capturar decisiones, reglas, roadmaps y especificaciones antes de implementar. Esto reduce deuda tecnica y evita que el conocimiento del producto quede disperso.

### Infraestructura separada

`infrastructure` agrupa Docker y scripts operativos para que los detalles de ejecucion no se mezclen con codigo de aplicacion. La infraestructura podra crecer hacia entornos locales, CI, staging y produccion.

### CI preparada, no implementada

`.github/workflows` queda reservado para pipelines. No se agrega un workflow ejecutable todavia porque aun no existen builds, tests ni linters reales que validar.

## Convenciones iniciales

- Package manager recomendado: `pnpm`.
- Node.js recomendado: version LTS actual compatible con NestJS y React Native.
- Cada aplicacion debe declarar sus scripts propios cuando sea inicializada.
- Las variables de entorno deben documentarse y mantenerse fuera de Git.
- Las reglas de negocio deben entrar primero en `docs/BUSINESS_RULES.md` antes de convertirse en codigo.

## Estado actual

Este repositorio esta listo para recibir la inicializacion tecnica de:

- NestJS en `apps/api`.
- React Native en `apps/mobile`.
- Prisma en `apps/api/prisma`.
- PostgreSQL local en `infrastructure/docker`.
- Pipelines CI en `.github/workflows`.

La implementacion funcional queda explicitamente pendiente.
