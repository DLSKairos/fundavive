import sanitizeHtml from 'sanitize-html';

/**
 * Config explícita de `sanitize-html` para el contenido HTML editable del
 * CMS: permite formato de texto normal (párrafos, listas, encabezados,
 * enlaces, énfasis) pero bloquea vectores de XSS (`<script>`, `<iframe>`,
 * `<object>`, `<embed>`, atributos `on*`, esquema `javascript:`).
 */
const SANITIZE_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    's',
    'ul',
    'ol',
    'li',
    'a',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'span',
    'div',
    'hr',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    span: ['style'],
    div: ['style'],
    p: ['style'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  // Elimina explícitamente cualquier tag peligroso aunque venga anidado.
  exclusiveFilter: (frame) => ['script', 'iframe', 'object', 'embed'].includes(frame.tag),
};

/** Sanitiza el HTML de una sección de contenido antes de persistirlo. */
export function sanitizarContenidoHtml(contenido: string): string {
  return sanitizeHtml(contenido, SANITIZE_HTML_OPTIONS);
}
