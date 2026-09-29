/**
 * Seed de datos base para "fundavive".
 *
 * Este seed es idempotente (usa `upsert`) por lo que puede ejecutarse
 * múltiples veces sin duplicar filas ni fallar en entornos ya sembrados.
 *
 * Ejecución manual:
 *   npx prisma db seed
 *
 * (configurado en prisma.config.ts -> migrations.seed)
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 8 slots FIJOS de imágenes por sección (ver ImagenSeccion en schema.prisma).
 * Estas filas NO se crean ni se borran desde el panel admin: solo se
 * actualiza la imagen (urlImagen/rutaArchivo/etc.) de un slot ya existente.
 * Por eso el seed las inicializa vacías (sin imagen) la primera vez que se
 * levanta el entorno.
 */
const SLOTS_IMAGENES_SECCIONES: Array<{
  pagina: string;
  clave: string;
  etiqueta: string;
}> = [
  { pagina: "inicio", clave: "hero", etiqueta: "Portada de inicio" },
  { pagina: "quienes_somos", clave: "hero", etiqueta: "Portada de quiénes somos" },
  {
    pagina: "quienes_somos",
    clave: "testimonio_1",
    etiqueta: "Testimonio 1 - quiénes somos",
  },
  {
    pagina: "quienes_somos",
    clave: "testimonio_2",
    etiqueta: "Testimonio 2 - quiénes somos",
  },
  {
    pagina: "quienes_somos",
    clave: "testimonio_3",
    etiqueta: "Testimonio 3 - quiénes somos",
  },
  { pagina: "contacto", clave: "hero", etiqueta: "Portada de contacto" },
  { pagina: "voluntarios", clave: "hero", etiqueta: "Portada de voluntarios" },
  { pagina: "donaciones", clave: "hero", etiqueta: "Portada de donaciones" },
];

async function seedImagenesSecciones() {
  for (const slot of SLOTS_IMAGENES_SECCIONES) {
    await prisma.imagenSeccion.upsert({
      where: { pagina_clave: { pagina: slot.pagina, clave: slot.clave } },
      update: {},
      create: slot,
    });
  }
  console.log(
    `✔ ${SLOTS_IMAGENES_SECCIONES.length} slots de ImagenSeccion verificados/creados.`,
  );
}

/**
 * Usuario admin de DESARROLLO. `bcrypt` ya es dependencia real del proyecto
 * (agregado en la fase de implementación del backend), así que este bloque
 * queda activo. Nunca usar la contraseña por defecto fuera de desarrollo
 * local: sobreescríbela con SEED_ADMIN_PASSWORD en un entorno real.
 */
import * as bcrypt from "bcrypt";

async function seedUsuarioAdminDev() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@fundavive.dev";
  // Nunca usar este valor por defecto en un entorno real.
  const passwordPlano = process.env.SEED_ADMIN_PASSWORD ?? "CambiaEstaClave123";
  const passwordHash = await bcrypt.hash(passwordPlano, 10);

  await prisma.usuarioAdmin.upsert({
    where: { username },
    update: {},
    create: { username, email, passwordHash },
  });
  console.log(`✔ Usuario admin de desarrollo asegurado: ${username}`);
}

async function main() {
  await seedImagenesSecciones();
  await seedUsuarioAdminDev();
}

main()
  .catch((error) => {
    console.error("Error ejecutando el seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
