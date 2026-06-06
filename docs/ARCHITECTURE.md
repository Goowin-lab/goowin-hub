# Architecture

## Objetivo

Definir una base profesional y escalable para Goowin Hub sin implementar funcionalidades de negocio.

## Vision general

Goowin Hub se organiza como un monorepo con dos aplicaciones principales:

- `apps/api`: API backend basada en NestJS.
- `apps/mobile`: cliente mobile basado en React Native.

La persistencia se planifica con PostgreSQL y Prisma ORM, ubicando Prisma dentro del backend porque la API sera la responsable de coordinar acceso a datos y reglas transaccionales.

## Decisiones iniciales

### 1. Monorepo

El proyecto inicia como monorepo para facilitar cambios coordinados entre API, mobile, documentacion e infraestructura. Esto ayuda a mantener una sola historia de versionado y una vision compartida del producto.

### 2. Separacion por apps

Las aplicaciones se ubican en `apps` para diferenciar codigo ejecutable de documentacion e infraestructura. Esta separacion evita que el backend, mobile y operaciones crezcan mezclados.

### 3. Backend en NestJS

NestJS es adecuado para SaaS porque favorece arquitectura modular, inyeccion de dependencias, pruebas automatizadas y separacion por dominios. En esta fase no se crean modulos para no fijar dominios inexistentes.

### 4. Mobile en React Native

React Native permite construir una experiencia mobile compartida para iOS y Android. La carpeta queda preparada, pero sin pantallas ni navegacion hasta definir flujos reales.

### 5. PostgreSQL y Prisma

PostgreSQL sera la fuente de verdad transaccional. Prisma ofrecera un cliente tipado y migraciones controladas. No se crea schema porque el modelo de datos debe venir de reglas de negocio validadas.

### 6. Infraestructura fuera de apps

Docker y scripts operativos se agrupan en `infrastructure` para que los comandos de entorno y despliegue no queden dispersos en las aplicaciones.

### 7. CI reservado

`.github/workflows` queda listo para pipelines futuros. No se agrega CI ejecutable hasta que existan comandos reales de lint, test o build en las apps.

## Limites actuales

No existen:

- Modulos NestJS.
- Endpoints HTTP.
- Pantallas mobile.
- Componentes UI.
- Entidades de dominio.
- Modelo Prisma.
- Migraciones.
- Workflows CI ejecutables.

## Principio rector

Primero estructura y contratos, luego implementacion. Cada nueva funcionalidad debe justificar su ubicacion dentro del monorepo y actualizar la documentacion afectada.
