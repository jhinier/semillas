export function obtenerMensajeError(mensaje: string): string {
  if (mensaje.includes("already registered") || mensaje.includes("already exists")) {
    return "Este correo ya está registrado. Inicia sesión.";
  }
  if (mensaje.includes("Invalid login credentials")) {
    return "Correo o contraseña incorrectos.";
  }
  if (mensaje.includes("Email not confirmed")) {
    return "Por favor confirma tu correo antes de iniciar sesión.";
  }
  return mensaje;
}
