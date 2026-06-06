# API Spec

## Proposito

Este archivo documentara el contrato publico y privado de la API de Goowin Hub.

## Estado actual

No hay endpoints definidos.

## Decision

El contrato de API debe definirse antes de implementar controladores. Esto evita que la forma del backend se derive accidentalmente de detalles internos.

## Convenciones futuras

Cada endpoint debera documentar:

- Metodo HTTP.
- Ruta.
- Autenticacion requerida.
- Parametros.
- Body.
- Respuesta exitosa.
- Errores esperados.
- Reglas de negocio relacionadas.

## Plantilla futura

```md
## Nombre del recurso

### METHOD /path

Autenticacion:

Descripcion:

Request:

Response:

Errores:

Reglas relacionadas:
```
