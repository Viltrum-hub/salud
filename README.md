# VITAL · Activa tu equilibrio

Sitio web de salud y bienestar con identidad deportiva: blanco, negro y verde lima, fotografías originales y tipografía local.

## Páginas

- `index.html`: inicio y acceso a las cuatro áreas.
- `mente.html`: estado de ánimo y respiración guiada.
- `movimiento.html`: temporizador de actividad.
- `alimentacion.html`: recetas, filtros y lista de compras descargable.
- `descanso.html`: planificador de horarios y rutina nocturna.
- `mi-espacio.html`: hábitos, registros recientes y descarga o eliminación de datos.
- `nosotros.html`: enfoque e identidad de VITAL.
- `recursos.html`: fuentes públicas y preguntas frecuentes.

## Uso

Abre el sitio con un servidor web. Las recetas usan un archivo JSON local, por lo que se recomienda HTTP en lugar de abrir los archivos con `file://`.

```sh
npm run check
npm run build
python -m http.server 8000
```

El sitio no necesita dependencias de ejecución. `npm run build` copia los archivos publicables a `dist/`.

## Registros

Los datos se guardan en `localStorage` con la clave `vital-wellbeing-v1`, solo en el navegador actual. No hay cuentas ni sincronización entre dispositivos. Se puede descargar una copia JSON o eliminar los registros desde Mi espacio.

## Contenido

El contenido es educativo. Las fuentes de OMS y CDC están enlazadas en Recursos y en las áreas correspondientes. Las herramientas no ofrecen diagnósticos o tratamientos. Las fotografías de recetas son ilustrativas.
