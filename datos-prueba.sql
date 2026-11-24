-- Datos de PRUEBA para ver el Inicio con contenido real del backend.
-- Se pueden borrar con borrar-datos-prueba.sql

-- Aviso al abrir la página (fila única id = 1)
INSERT INTO configuracion_modal_noticia (id, activo, titulo, subtitulo, badge_texto, highlight_texto, url_destino, etiqueta_boton, actualizado_en)
VALUES (1, true, 'Jornada de donación', 'Ven y comparte con las familias de la fundación.', 'Noticia destacada', 'Cada donación hace la diferencia.', '/donaciones', 'Quiero ayudar', now())
ON CONFLICT (id) DO UPDATE SET activo = true, titulo = EXCLUDED.titulo, subtitulo = EXCLUDED.subtitulo, actualizado_en = now();

-- Fotos del carrusel (imágenes de ejemplo de internet)
DELETE FROM imagenes_carrusel WHERE nombre_archivo LIKE 'prueba-%';
INSERT INTO imagenes_carrusel (titulo, nombre_archivo, url_imagen, ruta_archivo, orden, activo, actualizado_en) VALUES
('Taller de arte', 'prueba-1.jpg', 'https://picsum.photos/seed/vive1/800/500', 'prueba-1', 1, true, now()),
('Jornada de refrigerio', 'prueba-2.jpg', 'https://picsum.photos/seed/vive2/800/500', 'prueba-2', 2, true, now()),
('Capacitación para mujeres', 'prueba-3.jpg', 'https://picsum.photos/seed/vive3/800/500', 'prueba-3', 3, true, now()),
('Actividad con niños', 'prueba-4.jpg', 'https://picsum.photos/seed/vive4/800/500', 'prueba-4', 4, true, now()),
('Encuentro comunitario', 'prueba-5.jpg', 'https://picsum.photos/seed/vive5/800/500', 'prueba-5', 5, true, now()),
('Acompañamiento familiar', 'prueba-6.jpg', 'https://picsum.photos/seed/vive6/800/500', 'prueba-6', 6, true, now());
