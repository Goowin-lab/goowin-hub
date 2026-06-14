# Business Rules

## Proposito

Este documento define las reglas de negocio oficiales de Goowin Hub. Su objetivo es describir como funciona la operacion diaria de Goowin antes de disenar base de datos, APIs, backend, frontend web o aplicacion movil.

Goowin Hub es una plataforma central de servicios digitales para clientes de Goowin. Google Ads es uno de los servicios disponibles dentro de la plataforma, no el producto completo.

Este documento no define codigo, tablas SQL, entidades, endpoints, diagramas tecnicos ni diseno de base de datos.

## 1. Tipos de Usuarios

### Administrador Goowin

El Administrador Goowin es Christian.

Tiene acceso total al sistema y puede:

- Gestionar clientes.
- Gestionar servicios.
- Gestionar pagos.
- Gestionar renovaciones.
- Gestionar campanas Google Ads.
- Gestionar usuarios.
- Gestionar configuracion del sistema.
- Ver metricas globales.
- Ver informacion financiera.

### Editor Goowin

Los Editores Goowin son usuarios internos del equipo. No son desarrolladores y no tienen acceso tecnico. Su trabajo se realiza mediante formularios administrativos y paneles operativos.

Pueden:

- Crear clientes.
- Editar clientes.
- Registrar dominios.
- Registrar hosting.
- Registrar servicios SEO.
- Registrar licencias.
- Registrar recargas Google Ads.
- Consultar renovaciones.
- Consultar reportes de clientes.

No pueden:

- Modificar configuracion global.
- Administrar permisos.
- Gestionar usuarios administradores.
- Acceder a metricas financieras globales.

### Cliente

El Cliente puede consultar la informacion operativa y comercial asociada a sus servicios.

Puede:

- Consultar servicios.
- Consultar renovaciones.
- Consultar Google Ads.
- Consultar hosting.
- Consultar dominios.
- Consultar facturas.
- Consultar pagos.
- Abrir solicitudes de soporte.

### Agencia

El rol Agencia queda reservado para una fase futura. No forma parte de las reglas operativas iniciales de Goowin Hub.

## 2. Estados Comerciales del Cliente

El Estado Comercial del Cliente describe la situacion comercial general del cliente frente a Goowin. Este estado ayuda a priorizar seguimiento, pagos, renovaciones y atencion operativa.

Estados oficiales:

- Al dia.
- Pago pendiente.
- En seguimiento.
- Suspendido.

### Al dia

Un cliente esta Al dia cuando no tiene obligaciones comerciales pendientes que requieran accion inmediata.

Reglas:

- Puede tener servicios activos, renovaciones futuras o saldos disponibles.
- Puede recibir recordatorios preventivos sin dejar de estar Al dia.
- Su estado comercial no impide la operacion normal de sus servicios.

### Pago pendiente

Un cliente esta en Pago pendiente cuando existe una factura, renovacion, recarga acordada, ajuste o compromiso comercial pendiente de pago.

Reglas:

- Debe ser visible para seguimiento administrativo.
- No implica necesariamente que todos sus servicios esten suspendidos.
- Puede coexistir con servicios tecnicamente activos.

### En seguimiento

Un cliente esta En seguimiento cuando Goowin requiere monitoreo comercial u operativo especial.

Reglas:

- Puede deberse a negociaciones, acuerdos de pago, riesgo de vencimiento, cambios de servicio, migraciones o decisiones pendientes del cliente.
- Debe ayudar al equipo a priorizar gestion sin asumir automaticamente suspension.
- Puede coexistir con servicios activos, vencidos, suspendidos o en proceso de renovacion.

### Suspendido

Un cliente esta Suspendido cuando Goowin limita o detiene la operacion comercial por una decision administrativa, incumplimiento de pago o situacion excepcional.

Reglas:

- Debe ser visible para el Administrador Goowin y para los Editores Goowin segun su alcance operativo.
- No elimina el historial del cliente.
- No elimina facturas, pagos, servicios, renovaciones, recargas ni consumos historicos.
- No debe confundirse con la suspension tecnica de un servicio especifico.

### Estado Comercial vs Estado Tecnico del Servicio

El Estado Comercial aplica al cliente como relacion comercial con Goowin.

El Estado Tecnico del Servicio aplica a cada servicio contratado y describe su situacion operativa o de ciclo de vida.

Diferencias oficiales:

- Un cliente tiene un estado comercial general.
- Cada servicio conserva su propio estado tecnico independiente.
- Un cliente puede estar en Pago pendiente y aun tener servicios tecnicamente Activos.
- Un cliente puede estar Al dia y tener un servicio Proximo a vencer por calendario.
- Un servicio puede estar Suspendido sin que todos los demas servicios del cliente esten suspendidos.
- Cambiar el estado comercial del cliente no debe borrar ni reemplazar el estado tecnico historico de sus servicios.

## 3. Tipos de Servicios

Goowin Hub reconoce dos categorias oficiales de servicios: servicios recurrentes y servicios prepago.

### Servicios Recurrentes

Los servicios recurrentes son:

- Dominio.
- Hosting.
- SEO.
- Licencias.

Todo servicio recurrente tiene:

- Fecha de vencimiento.
- Proxima renovacion.
- Estado.
- Recordatorios automaticos.

Los servicios recurrentes representan compromisos que deben renovarse segun su frecuencia comercial.

### Servicios Prepago

El servicio prepago oficial actual es:

- Google Ads.

Google Ads funciona como Servicio + Billetera de Inversion Publicitaria.

Google Ads no tiene renovacion fija. Puede recibir recargas en cualquier momento y su consumo depende de la inversion publicitaria ejecutada en campanas.

## 4. Reglas Google Ads

Google Ads debe gestionarse como una billetera de inversion publicitaria asociada a un cliente.

Debe permitir consultar:

- Saldo disponible.
- Historial de recargas.
- Historial de consumo.
- Consumo promedio.
- Duracion estimada del saldo.
- Estados del servicio.

### Multiples cuentas Google Ads

Un cliente puede tener multiples cuentas Google Ads.

Reglas:

- No existe limite de cuentas Google Ads por cliente.
- Cada cuenta Google Ads debe mantener su saldo de forma independiente.
- Cada cuenta Google Ads debe mantener su consumo de forma independiente.
- Cada cuenta Google Ads debe mantener sus recargas de forma independiente.
- Cada cuenta Google Ads debe mantener su historial de forma independiente.
- Cada cuenta Google Ads debe mantener sus reportes de forma independiente.
- Las recargas, consumos y reportes de una cuenta no deben mezclarse con los de otra cuenta del mismo cliente.

### Recargas

Una recarga aumenta el saldo disponible de Google Ads.

Reglas:

- Un cliente puede realizar multiples recargas durante el mismo mes.
- Las recargas no reinician el servicio ni crean una renovacion fija.
- Toda recarga debe quedar visible en el historial del cliente.
- Las recargas sirven para financiar campanas publicitarias.

### Consumo

El consumo reduce el saldo disponible de Google Ads.

Reglas:

- El consumo depende de la ejecucion real de las campanas.
- El consumo debe poder consultarse historicamente.
- El consumo promedio sirve para estimar cuanto durara el saldo disponible.
- La duracion estimada del saldo es una referencia operativa, no una garantia.

### Estados Google Ads

Los estados oficiales de Google Ads son:

- Activo: el servicio tiene saldo suficiente y puede operar campanas.
- Saldo Bajo: el saldo disponible esta por debajo del umbral operativo definido por Goowin.
- Sin Saldo: el saldo disponible no permite continuar la inversion publicitaria.
- Pausado: el servicio esta detenido por decision operativa, comercial o solicitud del cliente.

## 5. Reglas Dominio

El Dominio es un servicio recurrente anual.

Estados oficiales:

- Activo.
- Proximo a vencer.
- Vencido.
- Cancelado.

### Renovacion de Dominio

La renovacion de un dominio busca mantener la titularidad y continuidad del dominio contratado por el cliente.

Reglas:

- Todo dominio debe tener una fecha de vencimiento.
- Antes del vencimiento se deben generar recordatorios de renovacion.
- Si el cliente renueva, el dominio pasa a estado renovado y se actualiza su proximo ciclo anual.
- Si el cliente no renueva antes de la fecha limite, el dominio pasa a Vencido.
- Un dominio puede ser Cancelado por decision del cliente, por reemplazo o por una decision operativa aprobada.
- La cancelacion de un dominio no cancela automaticamente otros servicios del cliente.

## 6. Reglas Hosting

El Hosting es un servicio recurrente anual.

Estados oficiales:

- Activo.
- Proximo a vencer.
- Vencido.
- Suspendido.

### SSL incluido

El SSL pertenece al Hosting.

Reglas:

- No existe un modulo independiente para SSL.
- El cliente debe ver el SSL como incluido dentro del Hosting.
- La gestion operativa del SSL se entiende como parte del estado y continuidad del Hosting.

### Renovacion de Hosting

Reglas:

- Todo hosting debe tener una fecha de vencimiento.
- Antes del vencimiento se deben generar recordatorios de renovacion.
- Si el cliente renueva, el hosting continua por un nuevo ciclo anual.
- Si el cliente no renueva, el hosting puede pasar a Vencido o Suspendido segun la situacion operativa.
- La suspension del hosting afecta la disponibilidad del servicio de hosting, pero no implica por si misma la cancelacion del dominio.

## 7. Reglas SEO

SEO es un servicio recurrente mensual.

Estados oficiales:

- Activo.
- Pendiente de pago.
- Suspendido.

Reglas:

- El servicio SEO se evalua por ciclos mensuales.
- Si el pago del ciclo esta al dia, el servicio se mantiene Activo.
- Si existe una obligacion de pago sin cumplir, el servicio puede pasar a Pendiente de pago.
- Si la situacion de pago u operacion no se corrige, el servicio puede pasar a Suspendido.

### Multiples servicios SEO por cliente

Un cliente puede contratar multiples servicios SEO.

Reglas:

- No existe limite de servicios SEO por cliente.
- Cada servicio SEO debe mantener su estado de forma independiente.
- Cada servicio SEO debe mantener su frecuencia de forma independiente.
- Cada servicio SEO debe mantener su historial de forma independiente.
- Cada servicio SEO debe mantener sus renovaciones de forma independiente.
- La suspension, renovacion o finalizacion de un servicio SEO no afecta automaticamente los demas servicios SEO del mismo cliente.

## 8. Reglas Licencias

Las Licencias son servicios recurrentes cuya frecuencia depende del producto.

Frecuencias oficiales:

- Anual.
- Mensual.

Estados oficiales:

- Activa.
- Proxima a vencer.
- Vencida.

Reglas:

- Cada licencia debe respetar la frecuencia comercial del producto contratado.
- Una licencia anual se gestiona con renovacion anual.
- Una licencia mensual se gestiona con renovacion mensual.
- El estado debe reflejar si la licencia esta vigente, cercana a vencerse o vencida.

## 9. Reglas de Renovaciones

Las renovaciones aplican a servicios recurrentes.

### Proximo a vencer

Un servicio esta Proximo a vencer cuando su fecha de vencimiento entra en la ventana operativa de recordatorios definida por Goowin.

Reglas:

- Debe aparecer en las vistas de renovaciones proximas.
- Debe activar recordatorios automaticos.
- Debe indicar al equipo y al cliente que requiere seguimiento.

### Vencido

Un servicio esta Vencido cuando supero su fecha de vencimiento sin renovacion confirmada.

Reglas:

- Debe aparecer como servicio vencido.
- Debe requerir atencion operativa.
- Puede generar acciones como suspension, seguimiento comercial o cierre del servicio, segun el tipo de servicio.

### Renovado

Un servicio esta Renovado cuando Goowin confirma la continuidad del servicio para un nuevo ciclo.

Reglas:

- Debe actualizarse la proxima renovacion del servicio.
- Debe quedar historial de la renovacion.
- Deben conservarse los registros previos para trazabilidad.

### Recordatorios

Reglas:

- Los recordatorios deben generarse antes del vencimiento de servicios recurrentes.
- Los recordatorios deben ayudar a priorizar la gestion operativa del equipo.
- Los recordatorios deben poder orientar al cliente sobre que servicio requiere pago o decision.
- Un servicio vencido debe seguir visible como pendiente de atencion hasta que sea renovado, cancelado, suspendido o cerrado segun aplique.

## 10. Ajustes de Renovacion y Prorrateos

Regla oficial: Hosting y Dominio no son dependencias directas.

Un dominio puede ser cancelado, suspendido o reemplazado sin afectar automaticamente el Hosting.

Caso real:

- Cliente compra Dominio A.
- Cliente compra Hosting.
- Dominio A es cancelado.
- Cliente compra Dominio B.
- Hosting continua siendo el mismo.

Goowin puede generar ajustes de prorrateo para alinear fechas de renovacion.

Reglas:

- Los ajustes de prorrateo son opcionales.
- Los ajustes pueden generar cobros parciales.
- Todo ajuste debe registrarse historicamente.
- El objetivo del ajuste es reducir la cantidad de fechas de renovacion para el cliente.
- Un ajuste de prorrateo no debe asumirse automaticamente; debe responder a una decision operativa o comercial.
- La alineacion de fechas no cambia la naturaleza independiente de Dominio y Hosting.

## 11. Migraciones y Cambios de Proveedor

Las migraciones y cambios de proveedor forman parte de la operacion real de Goowin y deben conservar la continuidad historica del cliente.

Casos cubiertos:

- Hosting.
- Dominio.
- Servicios relacionados.

### Hosting

Un servicio de hosting puede cambiar de proveedor, infraestructura operativa o condiciones comerciales sin que esto elimine su historial.

Reglas:

- El historial del hosting nunca debe eliminarse.
- El cambio de proveedor debe conservar trazabilidad.
- El cliente mantiene continuidad historica del servicio.
- La migracion no implica perdida de informacion historica.
- El cambio de proveedor no debe asumirse automaticamente como cancelacion del hosting.

### Dominio

Un dominio puede requerir cambio de proveedor, registrador, administracion o responsable operativo.

Reglas:

- El historial del dominio nunca debe eliminarse.
- Los cambios de proveedor deben conservar trazabilidad.
- El cliente mantiene continuidad historica sobre el dominio.
- La migracion no implica perdida de informacion historica.
- Si un dominio es reemplazado por otro, ambos deben conservar su propia historia.

### Servicios relacionados

Los servicios relacionados son servicios o gestiones asociadas a la continuidad operativa del cliente.

Reglas:

- El historial nunca debe eliminarse.
- Los cambios de proveedor deben conservar trazabilidad.
- El cliente mantiene continuidad historica.
- La migracion no implica perdida de informacion historica.
- Las decisiones de migracion deben poder entenderse posteriormente desde el historial operativo del cliente.

## 12. Reglas de Facturacion

La facturacion debe reflejar las obligaciones comerciales entre Goowin y sus clientes.

### Facturas

Reglas:

- Una factura representa un cobro emitido al cliente.
- Una factura debe permitir identificar que servicios, renovaciones, recargas o ajustes cubre.
- Una factura puede estar asociada a servicios recurrentes, recargas prepago o ajustes de prorrateo.
- Las facturas deben quedar disponibles para consulta del cliente.

### Pagos

Reglas:

- Un pago representa dinero recibido o confirmado por Goowin.
- Un pago puede cubrir una o varias obligaciones del cliente.
- Un pago debe quedar asociado al historial financiero del cliente.
- Los pagos deben poder consultarse por el Administrador Goowin y por el Cliente cuando correspondan a su cuenta.

### Historial

Reglas:

- El historial debe conservar facturas, pagos, recargas, consumos, renovaciones y ajustes relevantes.
- El historial debe permitir entender que ocurrio, cuando ocurrio y que servicio fue afectado.
- La informacion historica no debe perderse cuando un servicio sea cancelado, reemplazado o suspendido.

### Comprobantes

Reglas:

- Los comprobantes respaldan pagos, recargas o transacciones relevantes.
- Deben poder consultarse como soporte operativo y financiero.
- Un comprobante no reemplaza la confirmacion operativa del pago si Goowin requiere validacion interna.

## 13. Reglas de Notificaciones

Las notificaciones deben comunicar eventos relevantes para clientes y equipo interno.

Eventos oficiales:

- Proximo vencimiento.
- Servicio vencido.
- Pago recibido.
- Renovacion realizada.
- Saldo bajo Google Ads.
- Sin saldo Google Ads.

Reglas:

- Las notificaciones deben ayudar a prevenir interrupciones de servicios.
- Las notificaciones de renovacion aplican a servicios recurrentes.
- Las notificaciones de saldo aplican a Google Ads como servicio prepago.
- El Administrador Goowin debe poder ver eventos relevantes de toda la operacion.
- El Editor Goowin debe ver eventos necesarios para operar clientes y servicios.
- El Cliente debe ver eventos relacionados con sus propios servicios, pagos, renovaciones y saldos.

## 14. Dashboard Cliente

El Dashboard Cliente debe priorizar claridad operativa para el cliente.

Prioridad de informacion:

1. Que tiene contratado.
2. Que esta proximo a vencer.
3. Que debe pagar.
4. Que requiere atencion.

Reglas:

- El cliente debe poder identificar rapidamente sus servicios activos.
- Las renovaciones proximas y servicios vencidos deben ser visibles.
- Google Ads debe mostrarse por saldo, consumo y necesidad de recarga, no como suscripcion mensual.
- Hosting debe mostrar el SSL como incluido.
- La informacion financiera visible debe corresponder a facturas y pagos del propio cliente.

## 15. Dashboard Administrativo

El Dashboard Administrativo debe priorizar la operacion diaria de Goowin.

Prioridad de informacion:

- Clientes activos.
- Renovaciones proximas.
- Servicios vencidos.
- Google Ads con saldo bajo.
- Pagos pendientes.

Reglas:

- El Administrador Goowin debe poder tener una vista global de la operacion.
- El Editor Goowin debe ver la informacion necesaria para ejecutar tareas operativas sin acceder a configuraciones sensibles.
- Los servicios vencidos y renovaciones proximas deben ser faciles de priorizar.
- Google Ads con saldo bajo o sin saldo debe requerir atencion visible.
- Los pagos pendientes deben permitir seguimiento comercial y operativo.

## 16. Casos Especiales

### Cliente con multiples dominios

Un cliente puede tener multiples dominios.

Reglas:

- Cada dominio conserva su propio estado y vencimiento.
- La cancelacion de un dominio no cancela automaticamente los demas dominios.
- Cada dominio debe poder renovarse, cancelarse o reemplazarse de forma independiente.

### Cliente con multiples hostings

Un cliente puede tener multiples servicios de hosting.

Reglas:

- Cada hosting conserva su propio estado y vencimiento.
- Cada hosting incluye su propio tratamiento de SSL como parte del servicio.
- La suspension o vencimiento de un hosting no afecta automaticamente otros hostings del mismo cliente.

### Cliente con multiples servicios SEO

Un cliente puede contratar multiples servicios SEO sin limite operativo definido.

Reglas:

- Cada servicio SEO conserva su estado, frecuencia, historial y renovaciones.
- Los servicios SEO del mismo cliente deben poder evaluarse individualmente.
- Un servicio SEO suspendido o pendiente de pago no afecta automaticamente otro servicio SEO del mismo cliente.

### Cliente con multiples cuentas Google Ads

Un cliente puede tener multiples cuentas Google Ads sin limite operativo definido.

Reglas:

- Cada cuenta conserva su saldo, consumo, recargas, historial y reportes.
- Una cuenta puede estar Sin Saldo mientras otra cuenta del mismo cliente permanece Activa.
- Las recargas de una cuenta no deben asumirse como saldo disponible para otra cuenta.

### Dominio cancelado y reemplazado

Un cliente puede cancelar o reemplazar un dominio sin cancelar su hosting.

Reglas:

- El nuevo dominio debe tratarse como un servicio de dominio diferente.
- El hosting puede continuar siendo el mismo.
- El historial debe mostrar el dominio anterior, su cancelacion y el dominio nuevo.

### Renovaciones alineadas mediante prorrateos

Goowin puede alinear fechas de renovacion para simplificar la gestion del cliente.

Reglas:

- La alineacion es opcional.
- Puede generar cobros parciales.
- Debe quedar registrada historicamente.
- No debe eliminar el historial de ciclos anteriores.

### Google Ads con multiples recargas durante el mes

Un cliente puede hacer varias recargas de Google Ads durante el mismo mes.

Reglas:

- Cada recarga incrementa el saldo disponible.
- Cada recarga debe quedar en el historial.
- El consumo debe descontarse del saldo disponible.
- La duracion estimada del saldo debe considerar el consumo promedio.
- Varias recargas en un mes no convierten Google Ads en una suscripcion mensual.

## 17. Validacion Final

Estas reglas son coherentes con la arquitectura oficial de Goowin Hub:

- Goowin Hub es una plataforma central de servicios digitales.
- Google Ads es un servicio prepago tipo billetera de inversion publicitaria.
- Dominio es un servicio recurrente anual.
- Hosting es un servicio recurrente anual.
- SEO es un servicio recurrente mensual.
- Licencias pueden ser anuales o mensuales segun el producto.
- SSL esta integrado dentro de Hosting.
- Un cliente puede tener multiples servicios SEO independientes.
- Un cliente puede tener multiples cuentas Google Ads independientes.
- El Estado Comercial del Cliente es distinto del Estado Tecnico del Servicio.
- Las migraciones y cambios de proveedor conservan trazabilidad e historial.
- Los roles oficiales son Administrador Goowin, Editor Goowin, Cliente y Agencia como fase futura.
- Las reglas aqui descritas no crean codigo, tablas SQL, entidades, endpoints, diagramas tecnicos ni diseno de base de datos.
