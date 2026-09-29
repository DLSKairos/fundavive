/**
 * Calcula la edad en años completos a partir de una fecha de nacimiento.
 * Réplica fiel de `calcularEdad` del backend legacy.
 */
export function calcularEdad(fechaNacimiento: Date | string | null | undefined): number | null {
  if (!fechaNacimiento) return null;

  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad -= 1;
  }

  return edad;
}
