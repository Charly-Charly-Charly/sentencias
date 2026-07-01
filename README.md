# Página institucional de sentencias

## Estructura

- `index.html`: página principal.
- `styles.css`: diseño institucional.
- `script.js`: carga segura del JSON y manejo de popup.
- `data/sentencias.json`: información editable de las 14 sentencias.

## Cómo editar la información

Abre `data/sentencias.json` y cambia los campos:

```json
{
  "id": 1,
  "nombre": "Nombre de la sentencia",
  "fecha": "2026-01-01",
  "resumen": "Breve resumen",
  "medidaCumplimientoBusqueda": "Medida de cumplimiento de búsqueda",
  "urlSentencia": "https://...",
  "urlDocumentoCumplimientoRealizado": "https://...",
  "urlDocumentoCumplimientoPendiente": "https://..."
}
```

## Seguridad aplicada

- No se usa `innerHTML` para cargar información del JSON.
- El contenido se inserta con `textContent`.
- Los enlaces se validan con `URL`.
- Los enlaces externos usan `rel="noopener noreferrer"`.
- Incluye una política CSP en el HTML.
- El CSS no se genera desde datos externos.
