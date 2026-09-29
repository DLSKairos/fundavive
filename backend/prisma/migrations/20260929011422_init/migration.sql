-- CreateEnum
CREATE TYPE "estado_voluntario" AS ENUM ('pendiente', 'en_revision', 'aprobado', 'rechazado', 'inactivo');

-- CreateEnum
CREATE TYPE "estado_donacion" AS ENUM ('pendiente', 'completada', 'fallida', 'cancelada', 'reembolsada');

-- CreateEnum
CREATE TYPE "frecuencia_donacion" AS ENUM ('mensual', 'bimestral', 'trimestral', 'anual');

-- CreateEnum
CREATE TYPE "pagina_cms" AS ENUM ('quienes_somos', 'valores', 'mision_vision', 'contacto');

-- CreateTable
CREATE TABLE "usuarios_admin" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimo_acceso" TIMESTAMPTZ(6),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "usuarios_admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voluntarios" (
    "id" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "cedula" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20) NOT NULL,
    "ciudad" VARCHAR(100) NOT NULL,
    "direccion" VARCHAR(250),
    "fecha_nacimiento" DATE,
    "nivel_estudios" VARCHAR(100),
    "profesion_ocupacion" VARCHAR(150),
    "habilidades_especiales" TEXT,
    "disponibilidad_horaria" VARCHAR(100),
    "motivacion" TEXT,
    "areas_interes" JSONB,
    "estado" "estado_voluntario" NOT NULL DEFAULT 'pendiente',
    "notas_admin" TEXT,
    "nombre_archivo_cv" VARCHAR(255),
    "ruta_archivo_cv" TEXT,
    "url_cv" TEXT,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "voluntarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donaciones" (
    "id" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "cedula" VARCHAR(20),
    "monto" DECIMAL(12,2) NOT NULL,
    "moneda" VARCHAR(10) NOT NULL DEFAULT 'COP',
    "estado" "estado_donacion" NOT NULL DEFAULT 'pendiente',
    "referencia_epayco" VARCHAR(100),
    "ref_payco" VARCHAR(200),
    "transaction_id" VARCHAR(200),
    "es_recurrente" BOOLEAN NOT NULL DEFAULT false,
    "frecuencia" "frecuencia_donacion",
    "aparecer_muro_donantes" BOOLEAN NOT NULL DEFAULT false,
    "comprobante_enviado" BOOLEAN NOT NULL DEFAULT false,
    "fecha_pago" TIMESTAMPTZ(6),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "donaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "formularios_contacto" (
    "id" SERIAL NOT NULL,
    "nombre_completo" VARCHAR(150) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "telefono" VARCHAR(20),
    "asunto" VARCHAR(200) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leido" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "formularios_contacto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contenido_paginas" (
    "id" SERIAL NOT NULL,
    "pagina" "pagina_cms" NOT NULL,
    "seccion" VARCHAR(100) NOT NULL,
    "contenido" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "actualizado_por" INTEGER,
    "icono" VARCHAR(50),
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "contenido_paginas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_carrusel" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(200),
    "descripcion" TEXT,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "url_imagen" TEXT NOT NULL,
    "ruta_archivo" TEXT NOT NULL,
    "tamano_archivo" BIGINT,
    "ancho" INTEGER,
    "alto" INTEGER,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "subido_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "imagenes_carrusel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imagenes_secciones" (
    "id" SERIAL NOT NULL,
    "pagina" VARCHAR(50) NOT NULL,
    "clave" VARCHAR(50) NOT NULL,
    "etiqueta" VARCHAR(150) NOT NULL,
    "nombre_archivo" VARCHAR(255),
    "url_imagen" TEXT,
    "ruta_archivo" TEXT,
    "tamano_archivo" BIGINT,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "imagenes_secciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdfs_informativos" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(300) NOT NULL,
    "descripcion" TEXT,
    "nombre_archivo" VARCHAR(255) NOT NULL,
    "url_pdf" TEXT NOT NULL,
    "ruta_archivo" TEXT NOT NULL,
    "tamano_archivo" BIGINT,
    "descargas" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "subido_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "pdfs_informativos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_whatsapp" (
    "id" SERIAL NOT NULL,
    "codigo_pais" VARCHAR(10) NOT NULL DEFAULT '+57',
    "numero" VARCHAR(20) NOT NULL,
    "mensaje_predeterminado" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "configuracion_whatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_redes_sociales" (
    "id" SERIAL NOT NULL,
    "plataforma" VARCHAR(50) NOT NULL,
    "url" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT false,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "configuracion_redes_sociales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion_modal_noticia" (
    "id" SERIAL NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "titulo" TEXT NOT NULL DEFAULT 'Nueva campaña destacada',
    "subtitulo" TEXT,
    "badge_texto" TEXT NOT NULL DEFAULT 'Noticia destacada',
    "highlight_texto" TEXT DEFAULT 'Cada donación hace la diferencia.',
    "url_destino" TEXT NOT NULL DEFAULT '/donaciones',
    "etiqueta_boton" TEXT NOT NULL DEFAULT 'Quiero ayudar',
    "imagen_url" TEXT,
    "imagen_public_id" TEXT,
    "actualizado_en" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "configuracion_modal_noticia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "logs_actividad_admin" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER,
    "accion" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "ip_address" VARCHAR(45),
    "recurso_id" INTEGER,
    "creado_en" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_actividad_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_admin_username_key" ON "usuarios_admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_admin_email_key" ON "usuarios_admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "voluntarios_cedula_key" ON "voluntarios"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "voluntarios_email_key" ON "voluntarios"("email");

-- CreateIndex
CREATE INDEX "voluntarios_ciudad_idx" ON "voluntarios"("ciudad");

-- CreateIndex
CREATE INDEX "voluntarios_estado_idx" ON "voluntarios"("estado");

-- CreateIndex
CREATE INDEX "voluntarios_creado_en_idx" ON "voluntarios"("creado_en" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "donaciones_referencia_epayco_key" ON "donaciones"("referencia_epayco");

-- CreateIndex
CREATE INDEX "donaciones_estado_idx" ON "donaciones"("estado");

-- CreateIndex
CREATE INDEX "donaciones_monto_idx" ON "donaciones"("monto");

-- CreateIndex
CREATE INDEX "donaciones_es_recurrente_idx" ON "donaciones"("es_recurrente");

-- CreateIndex
CREATE INDEX "donaciones_email_idx" ON "donaciones"("email");

-- CreateIndex
CREATE INDEX "donaciones_creado_en_idx" ON "donaciones"("creado_en" DESC);

-- CreateIndex
CREATE INDEX "formularios_contacto_leido_idx" ON "formularios_contacto"("leido");

-- CreateIndex
CREATE INDEX "formularios_contacto_creado_en_idx" ON "formularios_contacto"("creado_en" DESC);

-- CreateIndex
CREATE INDEX "contenido_paginas_activo_idx" ON "contenido_paginas"("activo");

-- CreateIndex
CREATE INDEX "contenido_paginas_pagina_orden_idx" ON "contenido_paginas"("pagina", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "contenido_paginas_pagina_seccion_key" ON "contenido_paginas"("pagina", "seccion");

-- CreateIndex
CREATE INDEX "imagenes_carrusel_activo_idx" ON "imagenes_carrusel"("activo");

-- CreateIndex
CREATE INDEX "imagenes_carrusel_orden_idx" ON "imagenes_carrusel"("orden");

-- CreateIndex
CREATE UNIQUE INDEX "imagenes_secciones_pagina_clave_key" ON "imagenes_secciones"("pagina", "clave");

-- CreateIndex
CREATE INDEX "pdfs_informativos_activo_idx" ON "pdfs_informativos"("activo");

-- CreateIndex
CREATE INDEX "pdfs_informativos_subido_en_idx" ON "pdfs_informativos"("subido_en" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_redes_sociales_plataforma_key" ON "configuracion_redes_sociales"("plataforma");

-- CreateIndex
CREATE INDEX "logs_actividad_admin_accion_idx" ON "logs_actividad_admin"("accion");

-- CreateIndex
CREATE INDEX "logs_actividad_admin_creado_en_idx" ON "logs_actividad_admin"("creado_en" DESC);

-- CreateIndex
CREATE INDEX "logs_actividad_admin_usuario_id_idx" ON "logs_actividad_admin"("usuario_id");

-- AddForeignKey
ALTER TABLE "contenido_paginas" ADD CONSTRAINT "contenido_paginas_actualizado_por_fkey" FOREIGN KEY ("actualizado_por") REFERENCES "usuarios_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "logs_actividad_admin" ADD CONSTRAINT "logs_actividad_admin_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios_admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
