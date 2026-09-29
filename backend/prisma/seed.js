"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SLOTS_IMAGENES_SECCIONES = [
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
    console.log(`✔ ${SLOTS_IMAGENES_SECCIONES.length} slots de ImagenSeccion verificados/creados.`);
}
const bcrypt = __importStar(require("bcrypt"));
async function seedUsuarioAdminDev() {
    const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
    const email = process.env.SEED_ADMIN_EMAIL ?? "admin@fundavive.dev";
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
//# sourceMappingURL=seed.js.map