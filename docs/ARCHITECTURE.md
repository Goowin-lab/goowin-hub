# Architecture

## Objetivo

Definir una base profesional y escalable para Goowin Hub sin implementar codigo funcional de negocio.

## Vision general

Goowin Hub se organiza como un monorepo con dos aplicaciones principales:

- `apps/api`: API backend basada en NestJS.
- `apps/mobile`: cliente mobile basado en React Native.

La persistencia se planifica con PostgreSQL y Prisma ORM, ubicando Prisma dentro del backend porque la API sera la responsable de coordinar acceso a datos y reglas transaccionales.

Goowin Hub es una plataforma para centralizar la gestion de servicios digitales de clientes. Google Ads es solo uno de los servicios disponibles dentro de la plataforma; Goowin Hub no se define como una aplicacion exclusiva de Google Ads.

## Arquitectura de negocio

### Modelo de Servicios

Goowin Hub reconoce dos tipos oficiales de servicios: servicios recurrentes y servicios prepago.

Los servicios recurrentes representan obligaciones periodicas con vencimiento y renovacion. Deben permitir seguimiento de fecha de vencimiento, proxima renovacion, estado y recordatorios automaticos.

Los servicios prepago representan bolsas de valor disponibles para consumo. No tienen una fecha fija de renovacion, pueden recibir recargas en cualquier momento y deben permitir seguimiento de saldo, movimientos, recargas y consumo.

Esta clasificacion evita tratar todos los servicios como suscripciones y permite que cada experiencia del cliente muestre la informacion correcta segun la naturaleza del servicio.

### Servicios recurrentes

Los servicios recurrentes oficiales son:

- Dominio, con periodicidad anual.
- Hosting, con periodicidad anual.
- SEO, con periodicidad mensual.
- Licencias, con periodicidad anual o mensual segun el producto.

Estos servicios tienen:

- Fecha de vencimiento.
- Proxima renovacion.
- Estado.
- Recordatorios automaticos.

### Servicios prepago

El servicio prepago oficial actual es Google Ads.

Google Ads no funciona como una suscripcion ni como una renovacion mensual obligatoria. En Goowin Hub debe modelarse como un servicio con billetera publicitaria, donde el cliente mantiene saldo disponible para inversion en campanas.

Google Ads debe contemplar:

- Saldo actual.
- Historial de recargas.
- Historial de consumo.
- Consumo promedio.
- Duracion estimada del saldo.
- Reportes de campanas.

El saldo de Google Ads puede recibir recargas en cualquier momento y su consumo depende de la ejecucion real de las campanas publicitarias.

### Hosting y SSL

SSL no tendra un modulo independiente dentro de Goowin Hub. El SSL pertenece al servicio de Hosting.

La experiencia visible para el cliente debe presentar Hosting como un unico servicio con:

- Estado.
- Renovacion.
- SSL incluido.

### Dashboard principal

El dashboard principal debe reflejar la diferencia entre servicios recurrentes y prepago.

Para Google Ads debe mostrar:

- Saldo disponible.
- Consumo del dia.
- Duracion estimada.

Para renovaciones debe mostrar:

- Dominio.
- Hosting.
- SEO.
- Licencias.

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

Las decisiones funcionales documentadas en esta arquitectura no generan por si mismas modulos, endpoints, tablas SQL, entidades ni pantallas. Su objetivo es orientar implementaciones futuras cuando las reglas de negocio se conviertan en codigo.

## Principio rector

Primero estructura y contratos, luego implementacion. Cada nueva funcionalidad debe justificar su ubicacion dentro del monorepo y actualizar la documentacion afectada.
