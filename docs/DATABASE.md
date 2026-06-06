# Database

## Motor seleccionado

Goowin Hub usara PostgreSQL como base de datos principal.

## ORM seleccionado

Prisma ORM se usara desde `apps/api/prisma`.

## Decision

PostgreSQL se elige por:

- Madurez en cargas transaccionales.
- Buen soporte para integridad referencial.
- Consultas relacionales expresivas.
- Extensiones utiles para SaaS.
- Compatibilidad amplia con plataformas cloud.

Prisma se elige por:

- Cliente tipado para TypeScript.
- Migraciones versionables.
- Buena integracion con NestJS.
- Productividad sin perder visibilidad del modelo relacional.

## Estado actual

No se define `schema.prisma`, tablas ni migraciones. La base de datos todavia no tiene modelo porque las reglas de negocio no han sido formalizadas.

## Convenciones futuras

- Las migraciones deben ser revisadas como cambios de contrato.
- Los nombres de tablas y columnas deben documentarse.
- Las relaciones criticas deben tener restricciones de integridad.
- Los cambios destructivos deben tener estrategia de migracion.
- Las variables de conexion deben vivir fuera de Git.

## Variables esperadas a futuro

```txt
DATABASE_URL=
DIRECT_URL=
```

Estas variables se documentan como referencia, no como configuracion activa.
