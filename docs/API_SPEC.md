# API Spec

## 1. Introduccion

Este documento define la especificacion funcional de APIs para Goowin Hub. Su objetivo es identificar los modulos funcionales del backend, las operaciones principales que necesitara cada modulo y los roles que podran ejecutarlas.

Esta especificacion no define implementacion tecnica. No incluye codigo, NestJS, Swagger, OpenAPI, DTOs, controladores, SQL, Prisma, rutas, metodos HTTP, payloads ni contratos fisicos de request o response.

Goowin Hub es una plataforma central de servicios digitales. Google Ads es solo uno de los servicios disponibles dentro de la plataforma y se gestiona como servicio prepago con billetera publicitaria.

Roles considerados:

- Administrador Goowin.
- Editor Goowin.
- Cliente.

El rol Agencia queda reservado para una fase futura.

## 2. Autenticacion

Modulo responsable del acceso de usuarios internos Goowin y usuarios cliente.

Operaciones conceptuales:

- Iniciar sesion.
- Cerrar sesion.
- Recuperar contrasena.
- Cambiar contrasena.
- Consultar perfil.

Permisos funcionales:

- Administrador Goowin: puede ejecutar todas las operaciones de autenticacion sobre su propia cuenta.
- Editor Goowin: puede ejecutar todas las operaciones de autenticacion sobre su propia cuenta.
- Cliente: puede ejecutar todas las operaciones de autenticacion sobre su propia cuenta.

Reglas:

- Usuario representa una persona.
- Cliente representa una empresa u organizacion.
- Multiples usuarios de una misma empresa pueden iniciar sesion y consultar informacion de la misma empresa segun sus permisos.

## 3. Clientes

Modulo responsable de gestionar empresas u organizaciones cliente.

Operaciones conceptuales:

- Crear cliente.
- Editar cliente.
- Consultar cliente.
- Consultar listado de clientes.
- Cambiar estado comercial.

Permisos funcionales:

- Administrador Goowin: puede crear, editar, consultar, listar clientes y cambiar estado comercial.
- Editor Goowin: puede crear, editar, consultar y listar clientes. Puede cambiar estado comercial si la operacion forma parte de la gestion operativa aprobada por Goowin.
- Cliente: puede consultar la informacion de su propia empresa cuando corresponda al portal cliente. No puede crear clientes, listar otros clientes ni cambiar estado comercial.

Reglas:

- Cliente equivale a empresa, organizacion o cuenta comercial administrada por Goowin.
- El estado comercial del cliente es distinto del estado tecnico de cada servicio.

## 4. Usuarios Cliente

Modulo responsable de los usuarios pertenecientes a una empresa cliente.

Operaciones conceptuales:

- Crear usuario cliente.
- Editar usuario cliente.
- Desactivar usuario cliente.
- Consultar usuarios de una empresa.

Permisos funcionales:

- Administrador Goowin: puede crear, editar, desactivar y consultar usuarios cliente de cualquier empresa.
- Editor Goowin: puede crear, editar, desactivar y consultar usuarios cliente como parte de la operacion administrativa, sin administrar permisos globales ni usuarios administradores.
- Cliente: puede consultar su propio perfil. La gestion de usuarios internos de la empresa queda reservada para una fase futura de roles cliente.

Reglas:

- Una empresa cliente puede tener multiples usuarios.
- Cada usuario cliente pertenece a una unica empresa cliente.
- En fases futuras podran existir roles como Administrador Cliente, Usuario Cliente y Solo Lectura.

## 5. Servicios

Modulo base para gestionar servicios contratados por una empresa cliente.

Operaciones conceptuales:

- Crear servicio.
- Editar servicio.
- Consultar servicio.
- Consultar servicios de un cliente.
- Cambiar estado.

Permisos funcionales:

- Administrador Goowin: puede ejecutar todas las operaciones del modulo.
- Editor Goowin: puede crear, editar, consultar servicios de clientes y cambiar estados operativos permitidos.
- Cliente: puede consultar sus servicios contratados. No puede crear, editar ni cambiar estados.

Reglas:

- Servicio es el concepto base para servicios recurrentes, servicios prepago y servicios unicos.
- Cada servicio mantiene su propio estado tecnico u operativo e historial.
- Los servicios unicos no generan renovaciones ni fechas de vencimiento.
- Los precios no forman parte permanente de la definicion de un servicio; las operaciones facturables deben conservar el precio aplicado.

## 6. Dominios

Modulo responsable de servicios de dominio.

Operaciones conceptuales:

- Registrar dominio.
- Renovar dominio.
- Cancelar dominio.
- Reemplazar dominio.
- Consultar historial.

Permisos funcionales:

- Administrador Goowin: puede ejecutar todas las operaciones del modulo.
- Editor Goowin: puede registrar, renovar, cancelar, reemplazar y consultar historial de dominios.
- Cliente: puede consultar sus dominios y su historial visible. No puede registrar, renovar, cancelar ni reemplazar directamente desde la especificacion inicial.

Reglas:

- Dominio es un servicio recurrente anual.
- Un cliente puede tener multiples dominios.
- Un dominio cancelado o reemplazado conserva historial.
- Cambiar un dominio no cancela automaticamente el hosting.

## 7. Hosting

Modulo responsable de servicios de hosting.

Operaciones conceptuales:

- Registrar hosting.
- Renovar hosting.
- Suspender hosting.
- Reactivar hosting.
- Registrar migracion.

Permisos funcionales:

- Administrador Goowin: puede ejecutar todas las operaciones del modulo.
- Editor Goowin: puede registrar, renovar, suspender, reactivar y registrar migraciones de hosting.
- Cliente: puede consultar sus hostings y su estado visible. No puede registrar, renovar, suspender, reactivar ni registrar migraciones directamente desde la especificacion inicial.

Reglas:

- Hosting es un servicio recurrente anual.
- SSL esta incluido dentro de Hosting.
- No existe modulo independiente para SSL.
- Las migraciones de hosting deben conservar trazabilidad.

## 8. SEO

Modulo responsable de servicios SEO.

Operaciones conceptuales:

- Crear servicio SEO.
- Renovar SEO.
- Suspender SEO.
- Reactivar SEO.
- Consultar historial.

Permisos funcionales:

- Administrador Goowin: puede ejecutar todas las operaciones del modulo.
- Editor Goowin: puede crear, renovar, suspender, reactivar y consultar historial de servicios SEO.
- Cliente: puede consultar sus servicios SEO y su historial visible. No puede crear, renovar, suspender ni reactivar directamente desde la especificacion inicial.

Reglas:

- SEO es un servicio recurrente mensual.
- Un cliente puede tener multiples servicios SEO sin limite definido.
- Cada servicio SEO conserva estado, frecuencia, historial y renovaciones de forma independiente.

## 9. Licencias

Modulo responsable de licencias contratadas por clientes.

Operaciones conceptuales:

- Registrar licencia.
- Renovar licencia.
- Cambiar estado.
- Consultar historial.

Permisos funcionales:

- Administrador Goowin: puede ejecutar todas las operaciones del modulo.
- Editor Goowin: puede registrar, renovar, cambiar estado y consultar historial de licencias.
- Cliente: puede consultar sus licencias y su historial visible. No puede registrar, renovar ni cambiar estado directamente desde la especificacion inicial.

Reglas:

- Las licencias pueden ser anuales o mensuales segun el producto.
- Cada licencia mantiene su propio ciclo, estado e historial.

## 10. Google Ads

Modulo responsable de cuentas Google Ads como servicios prepago con billetera publicitaria.

Operaciones conceptuales:

- Registrar cuenta Google Ads.
- Consultar saldo.
- Registrar recarga.
- Consultar recargas.
- Consultar consumo.
- Consultar reportes.
- Cambiar estado.

Permisos funcionales:

- Administrador Goowin: puede ejecutar todas las operaciones del modulo.
- Editor Goowin: puede registrar cuentas, consultar saldos, registrar recargas, consultar recargas, consumo y reportes, y cambiar estados operativos permitidos.
- Cliente: puede consultar saldos, recargas, consumo y reportes de sus propias cuentas Google Ads. No puede registrar cuentas, registrar recargas ni cambiar estado directamente desde la especificacion inicial.

Reglas:

- Un cliente puede tener multiples cuentas Google Ads.
- Cada cuenta mantiene saldo, consumo, recargas, historial y reportes de forma independiente.
- Google Ads no tiene renovacion fija.
- Google Ads puede recibir recargas en cualquier momento.
- Monitoreo Google Ads es un servicio recurrente independiente de la billetera publicitaria.

## 11. Monitoreo Google Ads

Modulo responsable del servicio recurrente mensual de Monitoreo Google Ads.

Operaciones conceptuales:

- Crear servicio.
- Renovar servicio.
- Suspender servicio.
- Consultar servicio.
- Consultar historial.

Permisos funcionales:

- Administrador Goowin: puede crear, renovar, suspender, consultar y consultar historial del servicio.
- Editor Goowin: puede crear, renovar, suspender, consultar y consultar historial como parte de la gestion operativa.
- Cliente: puede consultar sus servicios de Monitoreo Google Ads y su historial visible. No puede crear, renovar ni suspender directamente desde la especificacion inicial.

Reglas:

- Monitoreo Google Ads es recurrente mensual.
- Es independiente de la inversion publicitaria, recargas y consumos de las cuentas Google Ads.
- Puede coexistir con multiples cuentas Google Ads del mismo cliente.
- Suspender el monitoreo no modifica automaticamente el saldo de una cuenta Google Ads.

## 12. Correo Corporativo

Modulo responsable de servicios recurrentes anuales de correo corporativo.

Operaciones conceptuales:

- Registrar servicio.
- Renovar servicio.
- Consultar servicio.
- Consultar historial.

Permisos funcionales:

- Administrador Goowin: puede registrar, renovar, consultar y consultar historial del servicio.
- Editor Goowin: puede registrar, renovar, consultar y consultar historial como parte de la gestion operativa.
- Cliente: puede consultar sus servicios de Correo Corporativo y su historial visible. No puede registrar ni renovar directamente desde la especificacion inicial.

Reglas:

- Correo Corporativo es recurrente anual.
- Debe permitir consultar plan de cuentas, cuentas activas, cuentas disponibles y renovacion anual.
- Cambiar el plan de cuentas debe conservar historial.
- La renovacion anual debe conservar el precio aplicado cuando se facture.

## 13. Servicios Unicos

Modulo responsable de servicios puntuales sin renovacion periodica.

Operaciones conceptuales:

- Registrar servicio.
- Consultar servicio.
- Consultar historial.

Permisos funcionales:

- Administrador Goowin: puede registrar, consultar y consultar historial de servicios unicos.
- Editor Goowin: puede registrar, consultar y consultar historial como parte de la gestion operativa.
- Cliente: puede consultar sus servicios unicos y su historial visible. No puede registrar servicios unicos directamente desde la especificacion inicial.

Reglas:

- Los servicios unicos no generan renovaciones.
- Los servicios unicos no tienen fecha de vencimiento.
- Pueden aparecer en facturas.
- Pueden contratarse multiples veces.
- Cada operacion debe conservar historial y precio aplicado.

## 14. Facturacion

Modulo responsable de facturas emitidas por Siigo y consultadas desde Goowin Hub.

Operaciones conceptuales:

- Registrar factura.
- Adjuntar PDF Siigo.
- Consultar factura.
- Descargar factura.
- Consultar historial.

Permisos funcionales:

- Administrador Goowin: puede registrar facturas, adjuntar PDF Siigo, consultar, descargar y consultar historial.
- Editor Goowin: puede registrar facturas, adjuntar PDF Siigo, consultar, descargar y consultar historial como parte de la operacion administrativa.
- Cliente: puede consultar y descargar facturas de su propia empresa. Puede consultar historial visible de facturacion de su empresa.

Reglas:

- Las facturas oficiales son emitidas por Siigo.
- Goowin Hub almacena la referencia y el PDF para consulta del cliente.
- Una factura puede incluir multiples servicios.
- Una factura debe conservar el precio aplicado en el momento de cada operacion facturable.
- Ejemplos validos: Dominio + Hosting, Hosting + SEO, Dominio + Hosting + Google Ads, Licencias + SEO, Correo Corporativo + Monitoreo Google Ads, Backup / Migracion.

## 15. Pagos

Modulo responsable del registro y consulta de pagos.

Operaciones conceptuales:

- Registrar pago.
- Consultar pago.
- Consultar historial de pagos.

Permisos funcionales:

- Administrador Goowin: puede registrar pagos, consultar pagos y consultar historial de pagos.
- Editor Goowin: puede registrar pagos, consultar pagos y consultar historial de pagos como parte de la operacion administrativa.
- Cliente: puede consultar pagos e historial de pagos de su propia empresa. No puede registrar pagos directamente desde la especificacion inicial.

Reglas:

- Un pago representa dinero recibido o confirmado por Goowin.
- Un pago puede cubrir una o varias facturas.
- El historial financiero debe conservar trazabilidad.

## 16. Renovaciones

Modulo responsable del seguimiento de renovaciones de servicios recurrentes.

Operaciones conceptuales:

- Consultar proximas renovaciones.
- Registrar renovacion.
- Registrar ajuste de prorrateo.
- Consultar historial.

Permisos funcionales:

- Administrador Goowin: puede ejecutar todas las operaciones del modulo.
- Editor Goowin: puede consultar proximas renovaciones, registrar renovaciones, registrar ajustes de prorrateo y consultar historial.
- Cliente: puede consultar sus proximas renovaciones e historial visible. No puede registrar renovaciones ni ajustes directamente desde la especificacion inicial.

Reglas:

- Las renovaciones aplican a servicios recurrentes.
- Los ajustes de prorrateo son opcionales y deben conservar historial.
- Hosting y Dominio no son dependencias directas.
- Los servicios unicos no generan renovaciones.
- Google Ads como billetera prepago no genera renovacion fija.
- Monitoreo Google Ads genera renovaciones mensuales.
- Correo Corporativo genera renovaciones anuales.

## 17. Notificaciones

Modulo responsable de avisos para usuarios internos y clientes.

Operaciones conceptuales:

- Consultar notificaciones.
- Marcar como leida.
- Consultar historial.

Permisos funcionales:

- Administrador Goowin: puede consultar notificaciones globales, marcar como leidas las que le correspondan y consultar historial.
- Editor Goowin: puede consultar notificaciones operativas, marcar como leidas las que le correspondan y consultar historial operativo.
- Cliente: puede consultar notificaciones de su propia empresa, marcarlas como leidas y consultar historial visible.

Reglas:

- Eventos relevantes incluyen proximo vencimiento, servicio vencido, pago recibido, renovacion realizada, saldo bajo Google Ads y sin saldo Google Ads.
- Las notificaciones de saldo aplican a Google Ads como servicio prepago.
- Los servicios unicos pueden generar notificaciones operativas, pero no recordatorios de renovacion.

## 18. Soporte

Modulo responsable de solicitudes de soporte.

Operaciones conceptuales:

- Crear solicitud.
- Consultar solicitud.
- Actualizar solicitud.
- Cerrar solicitud.

Permisos funcionales:

- Administrador Goowin: puede crear, consultar, actualizar y cerrar solicitudes.
- Editor Goowin: puede crear, consultar, actualizar y cerrar solicitudes como parte de la operacion administrativa.
- Cliente: puede crear solicitudes, consultar sus solicitudes y actualizar informacion propia de la solicitud. El cierre queda sujeto a la gestion operativa de Goowin.

Reglas:

- Las solicitudes pertenecen a una empresa cliente.
- Una solicitud puede referirse a un servicio especifico.

## 19. Dashboard Cliente

Modulo de consulta agregada para usuarios cliente en `hub.goowin.co`.

Informacion que debe consultar:

- Servicios activos.
- Google Ads.
- Monitoreo Google Ads.
- Correo Corporativo.
- Servicios unicos.
- Facturas.
- Renovaciones.
- Notificaciones.

Permisos funcionales:

- Administrador Goowin: puede consultar esta informacion para una empresa cliente desde contexto administrativo.
- Editor Goowin: puede consultar esta informacion para apoyar operacion y soporte.
- Cliente: puede consultar informacion de su propia empresa.

Reglas:

- Multiples usuarios de una misma empresa pueden consultar el mismo dashboard empresarial segun sus permisos.
- Google Ads debe mostrarse por saldo, consumo y necesidad de recarga.
- Monitoreo Google Ads debe mostrarse como servicio recurrente mensual independiente de saldo.
- Correo Corporativo debe mostrar plan de cuentas, cuentas activas y cuentas disponibles.
- Servicios unicos deben consultarse como historial operativo, no como renovaciones.
- Hosting debe mostrar SSL incluido.

## 20. Dashboard Administrativo

Modulo de consulta agregada para usuarios internos en `adminhub.goowin.co`.

Informacion que debe consultar:

- Clientes activos.
- Renovaciones proximas.
- Servicios vencidos.
- Google Ads con saldo bajo.
- Monitoreo Google Ads pendiente, vencido o suspendido.
- Correo Corporativo proximo a vencer o vencido.
- Servicios unicos en seguimiento operativo.
- Pagos pendientes.

Permisos funcionales:

- Administrador Goowin: puede consultar toda la informacion administrativa y global.
- Editor Goowin: puede consultar informacion operativa necesaria para gestion diaria, sin metricas financieras globales ni configuraciones sensibles.
- Cliente: no tiene acceso al dashboard administrativo.

Reglas:

- El dashboard administrativo prioriza la operacion diaria de Goowin.
- Debe diferenciar estado comercial del cliente y estado tecnico de los servicios.
- Debe diferenciar servicios recurrentes, servicios prepago y servicios unicos.

## 21. Roles y Permisos

Resumen funcional por modulo.

| Modulo | Administrador Goowin | Editor Goowin | Cliente |
| --- | --- | --- | --- |
| Autenticacion | Gestiona su propia sesion y perfil | Gestiona su propia sesion y perfil | Gestiona su propia sesion y perfil |
| Clientes | Crea, edita, consulta, lista y cambia estado comercial | Crea, edita, consulta, lista y puede cambiar estado comercial operativo | Consulta informacion de su propia empresa |
| Usuarios Cliente | Crea, edita, desactiva y consulta | Crea, edita, desactiva y consulta | Consulta su propio perfil; gestion interna futura |
| Servicios | Gestion total | Gestion operativa | Consulta servicios propios |
| Dominios | Gestion total | Gestion operativa | Consulta dominios propios |
| Hosting | Gestion total | Gestion operativa | Consulta hostings propios |
| SEO | Gestion total | Gestion operativa | Consulta servicios SEO propios |
| Licencias | Gestion total | Gestion operativa | Consulta licencias propias |
| Google Ads | Gestion total | Gestion operativa | Consulta cuentas propias, saldos, consumos, recargas y reportes |
| Monitoreo Google Ads | Gestion total | Gestion operativa | Consulta monitoreo propio |
| Correo Corporativo | Gestion total | Gestion operativa | Consulta correo corporativo propio |
| Servicios Unicos | Registra y consulta | Registra y consulta | Consulta servicios unicos propios |
| Facturacion | Registra, adjunta PDF, consulta y descarga | Registra, adjunta PDF, consulta y descarga | Consulta y descarga facturas propias |
| Pagos | Registra y consulta | Registra y consulta | Consulta pagos propios |
| Renovaciones | Gestion total | Gestion operativa | Consulta renovaciones propias |
| Notificaciones | Consulta, marca y revisa historial | Consulta, marca y revisa historial operativo | Consulta y marca notificaciones propias |
| Soporte | Gestion total | Gestion operativa | Crea y consulta solicitudes propias |
| Dashboard Cliente | Consulta por empresa | Consulta por empresa para soporte | Consulta su propia empresa |
| Dashboard Administrativo | Consulta global | Consulta operativa | Sin acceso |

Reglas transversales:

- Administrador Goowin tiene acceso total.
- Editor Goowin opera mediante formularios y paneles administrativos, sin acceso tecnico ni configuraciones sensibles.
- Cliente consulta informacion de su propia empresa.
- Cliente representa empresa u organizacion.
- Usuario representa persona.

## 22. Validacion Final

Esta especificacion funcional es coherente con README.md, ARCHITECTURE.md, BUSINESS_RULES.md y DATABASE.md:

- No define codigo, NestJS, Swagger, OpenAPI, DTOs, controladores, SQL ni Prisma.
- No define rutas, metodos HTTP, payloads ni contratos tecnicos.
- Goowin Hub se mantiene como plataforma central de servicios digitales.
- Los portales funcionales son `adminhub.goowin.co` y `hub.goowin.co`.
- Cliente representa empresa u organizacion.
- Usuario representa persona.
- Una empresa puede tener multiples usuarios cliente.
- Dominio, Hosting, SEO, Licencias, Monitoreo Google Ads y Correo Corporativo son servicios recurrentes.
- Google Ads es servicio prepago con billetera publicitaria.
- Servicios Unicos son servicios puntuales sin renovacion periodica ni fecha de vencimiento.
- Un cliente puede tener multiples cuentas Google Ads.
- Monitoreo Google Ads es independiente de inversion, recargas y consumos de Google Ads.
- Correo Corporativo permite plan de cuentas, cuentas activas, cuentas disponibles y renovacion anual.
- SSL esta integrado dentro de Hosting.
- Las facturas oficiales son emitidas por Siigo y Goowin Hub almacena referencia y PDF.
- Las facturas deben conservar el precio aplicado en cada operacion y no asumir precios fijos permanentes.
- El historial y la trazabilidad aplican a servicios, servicios unicos, pagos, renovaciones, migraciones, precios aplicados y cambios relevantes.
