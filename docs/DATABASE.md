# Database

## 1. Introduccion

Este documento define el modelo conceptual de datos de Goowin Hub. Su proposito es identificar las entidades principales del sistema, sus relaciones y sus cardinalidades segun las reglas de negocio aprobadas.

El modelo aqui descrito servira como base para disenos futuros de PostgreSQL, Prisma, backend NestJS, frontend web y aplicacion movil.

Este documento es conceptual. No representa una implementacion fisica y no define SQL, Prisma Schema, migraciones, endpoints, DTOs, entidades NestJS, tablas fisicas, campos, columnas ni diagramas tecnicos de implementacion.

Goowin Hub es una plataforma central de servicios digitales. Google Ads es un servicio dentro de la plataforma y se modela como Servicio + Billetera Publicitaria, no como una aplicacion independiente.

## 2. Entidades Principales

Las siguientes entidades conceptuales representan el nucleo del sistema.

### Usuario

Representa una persona que accede al sistema.

Existen dos grupos conceptuales:

- Usuarios Internos Goowin: personas del equipo Goowin, como Administrador Goowin y Editor Goowin.
- Usuarios Cliente: personas pertenecientes a una empresa cliente, con acceso al portal cliente para consultar informacion de esa empresa.

Usuario representa siempre una persona, no una empresa.

### Cliente

Representa una organizacion, empresa o cuenta comercial administrada por Goowin.

Cliente no representa necesariamente una persona individual. Una empresa cliente puede tener multiples usuarios con acceso al sistema.

Agrupa servicios contratados, facturas, pagos, notificaciones, historial, estado comercial, usuarios cliente y solicitudes operativas asociadas a la relacion con Goowin.

### Servicio

Representa el concepto general de servicio contratado o administrado para un cliente.

Es la base conceptual para servicios recurrentes y servicios prepago. Permite tratar de forma comun renovaciones, historial, facturacion, notificaciones y estado tecnico del servicio.

### Dominio

Representa un servicio recurrente anual de dominio.

Un dominio conserva su propia vida operacional, estado, renovaciones e historial, incluso si es cancelado o reemplazado por otro dominio.

### Hosting

Representa un servicio recurrente anual de hosting.

Incluye conceptualmente SSL dentro del hosting. SSL no existe como entidad independiente en el modelo conceptual inicial.

### Servicio SEO

Representa un servicio recurrente mensual de SEO.

Un cliente puede contratar multiples servicios SEO. Cada servicio SEO conserva su propia frecuencia, estado, renovaciones e historial.

### Licencia

Representa un servicio recurrente asociado a un producto licenciado.

Puede tener frecuencia anual o mensual segun el producto. Cada licencia conserva su propio ciclo de renovacion e historial.

### Cuenta Google Ads

Representa una cuenta publicitaria administrada para un cliente dentro de Goowin Hub.

Conceptualmente funciona como un servicio prepago con billetera publicitaria. Un cliente puede tener multiples cuentas Google Ads, cada una con saldo, recargas, consumos, historial y reportes independientes.

### Recarga Google Ads

Representa un aumento de saldo en una Cuenta Google Ads.

Las recargas no crean una renovacion fija ni convierten Google Ads en suscripcion. Un cliente puede realizar multiples recargas durante el mismo mes.

### Consumo Google Ads

Representa el uso del saldo disponible de una Cuenta Google Ads por ejecucion de campanas publicitarias.

El consumo permite calcular referencias operativas como consumo promedio y duracion estimada del saldo.

### Reporte Google Ads

Representa informacion de desempeno o seguimiento de campanas asociada a una Cuenta Google Ads.

Cada cuenta conserva sus reportes de forma independiente.

### Factura

Representa un cobro oficial emitido al cliente.

Las facturas oficiales son emitidas por Siigo. Goowin Hub almacena la referencia conceptual a la factura y el comprobante PDF para consulta del cliente.

### Pago

Representa dinero recibido o confirmado por Goowin.

Un pago puede cubrir una o varias facturas, total o parcialmente segun la operacion comercial.

### Comprobante PDF

Representa el documento consultable asociado a una factura o pago.

En el caso de facturas oficiales, el PDF corresponde al documento emitido por Siigo y almacenado para consulta dentro de Goowin Hub.

### Renovacion

Representa la continuidad de un servicio recurrente para un nuevo ciclo.

Aplica a dominio, hosting, SEO y licencias. No aplica a Google Ads como ciclo fijo, porque Google Ads funciona por saldo, recargas y consumo.

### Ajuste de Renovacion

Representa un ajuste comercial u operativo para alinear fechas de renovacion o aplicar prorrateos.

Es opcional, puede generar cobros parciales y debe conservarse historicamente.

### Notificacion

Representa un aviso generado por eventos relevantes del sistema.

Ejemplos conceptuales: proximo vencimiento, servicio vencido, pago recibido, renovacion realizada, saldo bajo Google Ads o sin saldo Google Ads.

### Historial

Representa la trazabilidad de eventos relevantes sobre clientes, servicios, facturas, pagos, renovaciones, recargas, consumos, migraciones y cambios de proveedor.

El historial nunca debe eliminarse por cancelaciones, reemplazos, migraciones o cambios operativos.

### Migracion o Cambio de Proveedor

Representa un cambio operativo relevante en hosting, dominio o servicios relacionados.

Permite conservar continuidad historica del cliente sin perder informacion previa.

### Solicitud de Soporte

Representa una solicitud abierta por el cliente o registrada por Goowin para seguimiento operativo.

Se incluye en el modelo conceptual porque el Cliente puede abrir solicitudes de soporte segun las reglas de negocio.

## 3. Relaciones Conceptuales

Las relaciones conceptuales principales son:

- Usuario se asocia con un rol funcional.
- Usuario puede ser interno de Goowin o pertenecer a una empresa cliente.
- Cliente representa una Empresa u Organizacion.
- Cliente agrupa multiples Usuarios Cliente.
- Usuario Cliente pertenece a un Cliente.
- Cliente agrupa Servicios.
- Cliente agrupa Dominios.
- Cliente agrupa Hostings.
- Cliente agrupa Servicios SEO.
- Cliente agrupa Licencias.
- Cliente agrupa Cuentas Google Ads.
- Cliente agrupa Facturas.
- Cliente agrupa Pagos.
- Cliente recibe Notificaciones.
- Cliente conserva Historial.
- Servicio pertenece a Cliente.
- Dominio representa un tipo especializado de Servicio.
- Hosting representa un tipo especializado de Servicio.
- Servicio SEO representa un tipo especializado de Servicio.
- Licencia representa un tipo especializado de Servicio.
- Cuenta Google Ads representa un tipo especializado de Servicio prepago.
- Cuenta Google Ads agrupa Recargas Google Ads.
- Cuenta Google Ads agrupa Consumos Google Ads.
- Cuenta Google Ads agrupa Reportes Google Ads.
- Factura puede incluir Servicios.
- Factura puede incluir Recargas Google Ads.
- Factura puede incluir Ajustes de Renovacion.
- Pago puede cubrir Facturas.
- Renovacion aplica a Servicios recurrentes.
- Ajuste de Renovacion puede relacionarse con Renovaciones y Servicios.
- Notificacion puede relacionarse con Cliente, Servicio, Factura, Pago, Renovacion o Cuenta Google Ads.
- Historial puede relacionarse con Cliente, Servicio, Dominio, Hosting, Cuenta Google Ads, Factura, Pago, Renovacion, Ajuste de Renovacion o Migracion.
- Migracion o Cambio de Proveedor puede relacionarse con Dominio, Hosting o servicios relacionados.
- Solicitud de Soporte pertenece a Cliente y puede referirse a un Servicio.

Estas relaciones describen el comportamiento del negocio. No implican todavia tablas, claves, columnas, indices ni estructura fisica.

## 4. Cardinalidades

### Uno a uno

- Un Dominio conceptual corresponde a un Servicio base.
- Un Hosting conceptual corresponde a un Servicio base.
- Un Servicio SEO conceptual corresponde a un Servicio base.
- Una Licencia conceptual corresponde a un Servicio base.
- Una Cuenta Google Ads conceptual corresponde a un Servicio base prepago.
- Un Hosting incluye conceptualmente SSL dentro del mismo servicio.

### Uno a muchos

- Un Cliente puede tener multiples Usuarios Cliente.
- Cada Usuario Cliente pertenece a un unico Cliente.
- Un Cliente puede tener multiples Servicios.
- Un Cliente puede tener multiples Dominios.
- Un Cliente puede tener multiples Hostings.
- Un Cliente puede tener multiples Servicios SEO.
- Un Cliente puede tener multiples Licencias.
- Un Cliente puede tener multiples Cuentas Google Ads.
- Una Cuenta Google Ads puede tener multiples Recargas Google Ads.
- Una Cuenta Google Ads puede tener multiples Consumos Google Ads.
- Una Cuenta Google Ads puede tener multiples Reportes Google Ads.
- Un Cliente puede tener multiples Facturas.
- Un Cliente puede tener multiples Pagos.
- Un Cliente puede tener multiples Notificaciones.
- Un Cliente puede tener multiples eventos de Historial.
- Un Servicio recurrente puede tener multiples Renovaciones a lo largo de su vida.
- Un Servicio puede tener multiples Notificaciones.
- Un Servicio puede tener multiples eventos de Historial.
- Un Dominio puede tener multiples eventos de Historial, incluyendo cancelaciones, reemplazos o cambios de proveedor.
- Un Hosting puede tener multiples eventos de Historial, incluyendo migraciones o cambios de proveedor.
- Un Cliente puede tener multiples Solicitudes de Soporte.

### Muchos a muchos

- Una Factura puede incluir multiples Servicios.
- Un Servicio puede aparecer en multiples Facturas a lo largo de su vida.
- Un Pago puede cubrir multiples Facturas.
- Una Factura puede ser cubierta por multiples Pagos cuando existan pagos parciales o abonos.
- Una Factura puede incluir multiples Recargas Google Ads.
- Una Cuenta Google Ads puede aparecer en multiples Facturas a lo largo de sus recargas.
- Una Factura puede incluir multiples Ajustes de Renovacion.
- Un Ajuste de Renovacion puede relacionarse con multiples Servicios cuando busca alinear fechas de renovacion.
- Una Factura puede cubrir multiples Renovaciones.
- Un Servicio puede tener renovaciones facturadas en multiples Facturas a lo largo de su vida.

## 5. Portal Cliente y Acceso Empresarial

El Portal Cliente corresponde conceptualmente a `hub.goowin.co`.

Multiples usuarios de una misma empresa cliente pueden acceder al portal cliente.

Reglas conceptuales:

- Cliente equivale a empresa u organizacion.
- Usuario equivale a persona.
- Una empresa cliente puede tener multiples usuarios con acceso al portal.
- Todos los usuarios cliente consultan informacion de la misma empresa segun sus permisos.
- Los usuarios de una empresa pueden consultar servicios, Google Ads, facturas, hosting, dominios, SEO, licencias, pagos y soporte de esa empresa.
- El acceso simultaneo de multiples usuarios de una misma empresa no cambia la propiedad conceptual de la informacion: la informacion pertenece a la empresa cliente.

Ejemplo conceptual:

- Empresa cliente: Papeles Contables SAS.
- Usuarios cliente: Luis Moreno, Contabilidad, Marketing y Asistente Administrativo.
- Todos consultan informacion asociada a Papeles Contables SAS.

## 6. Servicios Recurrentes

Los servicios recurrentes se modelan conceptualmente como Servicios con ciclo de renovacion.

Los tipos recurrentes oficiales son:

- Dominio.
- Hosting.
- Servicio SEO.
- Licencia.

Cada servicio recurrente conserva su propia vigencia, estado tecnico, renovaciones, recordatorios e historial.

### Dominio

Dominio es un servicio recurrente anual.

Un cliente puede tener multiples dominios. Cada dominio se gestiona de forma independiente, puede renovarse, cancelarse, reemplazarse o migrarse sin afectar automaticamente otros servicios.

### Hosting

Hosting es un servicio recurrente anual.

Un cliente puede tener multiples hostings. Cada hosting se gestiona de forma independiente e incluye SSL como parte del mismo servicio.

Hosting y Dominio no son dependencias directas. Un dominio puede cambiar, cancelarse o reemplazarse sin cancelar automaticamente el hosting.

### Servicio SEO

Servicio SEO es un servicio recurrente mensual.

Un cliente puede tener multiples servicios SEO sin limite definido. Cada servicio SEO mantiene su estado, frecuencia, historial y renovaciones de forma independiente.

### Licencia

Licencia es un servicio recurrente anual o mensual segun el producto.

Cada licencia mantiene su propio ciclo y estado. Una licencia anual y una licencia mensual pueden convivir para el mismo cliente.

## 7. Servicios Prepago

El servicio prepago oficial actual es Google Ads.

Google Ads se modela conceptualmente como Servicio + Billetera Publicitaria.

Una Cuenta Google Ads representa la billetera publicitaria de una cuenta especifica. Un cliente puede tener multiples Cuentas Google Ads, y cada una mantiene independencia operativa.

La billetera publicitaria contempla:

- Saldo disponible como concepto operacional.
- Recargas como aumentos del saldo.
- Consumos como reducciones del saldo por campanas.
- Historial de recargas y consumos.
- Reportes asociados a campanas.

Google Ads no tiene renovacion fija, no es suscripcion mensual obligatoria y puede recibir recargas en cualquier momento.

## 8. Facturacion

La facturacion se modela conceptualmente alrededor de Factura, Pago y Comprobante PDF.

### Factura

Una Factura representa un cobro oficial emitido al cliente.

Las facturas oficiales son emitidas por Siigo. Goowin Hub debe conservar la referencia conceptual a la factura y el PDF para consulta del cliente.

Una Factura puede incluir multiples conceptos de negocio, incluyendo servicios recurrentes, recargas Google Ads y ajustes de renovacion.

Ejemplos validos:

- Dominio + Hosting.
- Hosting + SEO.
- Dominio + Hosting + Google Ads.
- Licencias + SEO.

### Pago

Un Pago representa dinero recibido o confirmado por Goowin.

Conceptualmente, un pago puede cubrir una factura completa, varias facturas o parte de una factura, segun el proceso comercial.

### Comprobante PDF

El Comprobante PDF representa el soporte documental consultable por el cliente.

Para facturas oficiales, el comprobante corresponde al PDF emitido por Siigo y almacenado por Goowin Hub para consulta.

## 9. Renovaciones

Las renovaciones aplican a servicios recurrentes.

### Renovaciones normales

Una Renovacion normal representa la continuidad de un servicio recurrente para un nuevo ciclo.

Aplica a Dominio, Hosting, Servicio SEO y Licencia.

### Renovaciones alineadas

Una renovacion alineada representa la decision de ajustar ciclos para reducir la cantidad de fechas de renovacion del cliente.

La alineacion no elimina el historial previo y no cambia la independencia conceptual entre servicios.

### Ajustes de prorrateo

Un Ajuste de Renovacion representa el prorrateo o cobro parcial usado para alinear fechas.

Reglas conceptuales:

- El ajuste es opcional.
- Puede generar cobros parciales.
- Puede relacionarse con servicios, renovaciones y facturas.
- Debe conservar historial.
- No debe borrar ciclos anteriores.

## 10. Historial y Trazabilidad

El historial es una entidad conceptual transversal.

Debe preservar trazabilidad para:

- Migraciones.
- Cambios de proveedor.
- Dominios reemplazados.
- Hostings migrados.
- Renovaciones.
- Pagos.
- Facturas.
- Recargas Google Ads.
- Consumos Google Ads.
- Ajustes de renovacion.
- Cambios de estado comercial del cliente.
- Cambios de estado tecnico del servicio.

Reglas conceptuales:

- El historial nunca debe eliminarse por cancelacion, reemplazo, suspension o migracion.
- Un dominio reemplazado conserva su propia historia.
- Un hosting migrado conserva la continuidad historica del servicio.
- Una migracion no implica perdida de informacion historica.
- Los pagos y facturas deben conservar trazabilidad financiera.
- Los cambios de proveedor deben poder entenderse posteriormente desde la historia del cliente y del servicio afectado.

## 11. Entidades Pendientes para Fase Futura

Las siguientes entidades quedan reservadas para fases futuras y no forman parte del modelo conceptual inicial obligatorio:

- Smart Cards.
- Agencia.
- Reportes avanzados.
- Automatizaciones.

Estas entidades deberan definirse cuando existan reglas de negocio aprobadas para cada una.

### Roles internos para usuarios cliente

En fases futuras podran existir roles internos dentro de una empresa cliente.

Ejemplos conceptuales:

- Administrador Cliente.
- Usuario Cliente.
- Solo Lectura.

Esta posibilidad queda reservada para el futuro. No se disenan permisos ni reglas detalladas en este documento.

## 12. Validacion Final

Este modelo conceptual es coherente con README.md, ARCHITECTURE.md y BUSINESS_RULES.md:

- Goowin Hub se mantiene como plataforma central de servicios digitales.
- PostgreSQL y Prisma se mantienen como destino futuro, sin diseno fisico en este documento.
- El modelo no define SQL, Prisma Schema, migraciones, endpoints, DTOs, entidades NestJS, tablas fisicas, campos, columnas ni diagramas tecnicos.
- Cliente es el eje comercial del sistema y representa una empresa u organizacion.
- Usuario representa una persona.
- Una empresa cliente puede tener multiples usuarios.
- Cada Usuario Cliente pertenece a una unica empresa cliente.
- Servicio es el concepto base para servicios recurrentes y prepago.
- Dominio, Hosting, Servicio SEO y Licencia son servicios recurrentes.
- Google Ads se modela como Servicio + Billetera Publicitaria.
- Un cliente puede tener multiples dominios, hostings, servicios SEO y cuentas Google Ads.
- SSL esta integrado dentro de Hosting.
- Las facturas oficiales son emitidas por Siigo y Goowin Hub conserva referencia y PDF para consulta.
- El historial preserva trazabilidad de migraciones, cambios de proveedor, dominios reemplazados, hostings migrados, renovaciones y pagos.
