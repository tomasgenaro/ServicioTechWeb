# ServicioTech Web

Sitio institucional estático de ServicioTech, desarrollado desde cero con HTML5, CSS3 y JavaScript puro.

## Objetivo

Convertir visitas en consultas reales por WhatsApp y presentar de forma profesional los servicios, el proceso de atención, las opiniones de clientes y la ubicación del local.

## Síntesis del análisis

- Conversión principal: consulta directa por WhatsApp.
- Conversión secundaria: llamada telefónica, correo o apertura de la ubicación.
- Público: personas de Chivilcoy que necesitan reparar o mejorar un equipo y buscan una respuesta clara y confiable.
- Servicios prioritarios: PC/notebooks, consolas y televisores.
- Diferenciadores comunicados: diagnóstico previo, garantía, rapidez y atención personalizada.
- Atención: exclusivamente en Moreno 318, con cita previa o según disponibilidad.
- Horarios: lunes a viernes de 10:00 a 20:00 y sábados de 10:00 a 12:00.

La investigación local mostró que varios competidores presentan listados extensos y mensajes genéricos. La propuesta de ServicioTech prioriza un recorrido más corto, una jerarquía visual clara, explicaciones concretas y acceso inmediato a WhatsApp.

## Decisiones de producto y diseño

- Se eliminó el formulario porque no es un canal utilizado actualmente y una web estática necesitaría un proveedor externo para enviar datos de forma real.
- Se mantuvo la identidad turquesa, cian y azul, incorporando un fondo oscuro en el hero para mejorar contraste y percepción de calidad.
- Se utilizó una sola página principal para reducir pasos y favorecer la conversión local.
- Las tres categorías prioritarias tienen tarjetas completas; los servicios secundarios permanecen visibles en formato compacto.
- Los estados hover mantienen cada elemento inmóvil y comunican interacción únicamente mediante color, borde y sombra.
- La galería es manual en celulares y tablets, con teclado, tacto y controles visibles. En escritorio alterna imágenes y una composición de marca automáticamente.
- El hero, la galería de escritorio y las opiniones tienen controles de pausa independientes. La rotación se detiene fuera de pantalla, al ocultar la pestaña, al interactuar con el contenido y al activar movimiento reducido. En este último caso, la galería de escritorio pasa a navegación manual para mantener accesibles las ocho imágenes.
- El menú móvil permanece visible cuando JavaScript está deshabilitado o no se carga; el botón desplegable se habilita después de instalar sus eventos.
- Las reseñas se presentan como contenido propio y enlazan al perfil de Google, sin depender de un widget externo.
- El mapa se carga de forma diferida para reducir el impacto inicial en rendimiento.
- No se cargan tipografías externas, analítica ni bibliotecas JavaScript.

## Mapa del sitio

```text
Inicio
├── Presentación y consulta por WhatsApp
├── Diferenciales
├── Servicios
├── Cómo trabajamos
├── Galería
├── Opiniones
├── Ubicación y horarios
└── Consulta final

Privacidad
Página 404
```

## Estrategia SEO local

El contenido y los metadatos están orientados principalmente a:

- servicio técnico en Chivilcoy;
- reparación de PC y notebooks en Chivilcoy;
- reparación de consolas en Chivilcoy;
- reparación de televisores en Chivilcoy.

Se incluyeron metadatos descriptivos, Open Graph, datos estructurados `LocalBusiness`, sitemap, robots, dirección, horarios, teléfono, catálogo de servicios y enlaces a perfiles oficiales.

## Estructura

```text
ServicioTechWeb/
├── index.html
├── privacidad.html
├── 404.html
├── css/
│   └── styles.css
├── js/
│   └── main.js
├── assets/
│   ├── images/
│   └── icons/
├── favicon.ico
├── site.webmanifest
├── robots.txt
├── sitemap.xml
└── README.md
```

## Ejecutar localmente

La forma recomendada en Visual Studio Code es instalar la extensión **Live Server**, abrir esta carpeta y elegir **Open with Live Server** sobre `index.html`.

También puede abrirse `index.html` directamente, aunque un servidor estático representa mejor el funcionamiento final y evita restricciones del navegador.

## Publicar en GitHub Pages

1. Crear o utilizar el repositorio destinado al sitio.
2. Copiar el contenido de esta carpeta en la raíz del repositorio.
3. Subir los archivos a la rama principal.
4. En GitHub, abrir **Settings → Pages**.
5. Seleccionar la rama principal y la carpeta raíz.
6. Confirmar la publicación.

La configuración actual de enlaces canónicos, Open Graph y sitemap utiliza:

`https://serviciotech.com.ar/`

Si cambia la dirección pública, hay que reemplazar esa URL en `index.html`, `privacidad.html`, `robots.txt` y `sitemap.xml`.

## Actualizaciones frecuentes

- Textos y servicios: `index.html`.
- Colores, tamaños, espaciados y diseño: `css/styles.css`.
- Menú, animaciones y galería: `js/main.js`.
- Imágenes promocionales: `assets/images/`.
- Número y mensajes de WhatsApp: buscar `542346610009` en `index.html`.

Las imágenes de la galería están optimizadas en WebP a 720 × 900 píxeles. Para conservar el rendimiento, las futuras imágenes deberían mantener dimensiones y peso similares.

## Verificación local — 26 de octubre de 2026

- Sintaxis de JavaScript comprobada con `node --check`.
- JSON del manifiesto y XML del sitemap comprobados.
- Referencias internas, archivos, anclas e identificadores auditados.
- Todas las imágenes de contenido tienen texto alternativo, dimensiones explícitas y carga diferida cuando corresponde.
- Menú preparado para teclado, cierre con `Escape` y estados ARIA.
- Galería comprobada con teclado y controles en celular, tablet y escritorio; estado final e indicadores sincronizados con el límite de desplazamiento.
- Rotación comprobada con pausa manual y `prefers-reduced-motion`, incluido el cambio de preferencia con la página abierta.
- Navegación móvil accesible sin JavaScript y con el archivo de JavaScript bloqueado.
- Página 404 comprobada en rutas anidadas, incluidos estilos, logo y regreso al inicio.
- Foco visible y enlace para saltar al contenido.
- Sin enlaces vacíos, contenido de relleno ni mensajes de depuración.
- Peso aproximado: 478 KiB de archivos del sitio sin `.git`; cambia al editar código, documentación o imágenes.

Estas comprobaciones locales no equivalen a una certificación de accesibilidad ni a una validación completa de HTML/CSS. Quedan pendientes la medición de Lighthouse sobre la URL publicada y la comprobación de los servicios externos, incluido el mapa de Google.

## Limitaciones de esta versión

- No incluye formulario ni almacenamiento de datos.
- No incluye panel administrativo.
- No permite consultar el estado de una reparación.
- Las reseñas no se sincronizan automáticamente con Google.
- Los horarios, servicios y opiniones se actualizan editando el HTML.
- No incluye analítica ni cookies publicitarias.

## Evolución recomendada

La estructura permite incorporar posteriormente un sistema de reclamos, seguimiento de reparaciones, analítica, contenido bilingüe, formularios reales o integración con el software de gestión de ServicioTech.
