DELETE FROM imagenes_carrusel WHERE nombre_archivo LIKE 'prueba-%';
UPDATE configuracion_modal_noticia SET activo = false, actualizado_en = now() WHERE id = 1;
