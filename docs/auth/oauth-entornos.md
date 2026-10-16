# OAuth por entorno

Todos los proveedores redirigen a la ruta `/auth/callback` del mismo origen de
la PWA. Supabase debe tener autorizadas estas URLs:

| Entorno | URL de retorno de la PWA |
|---|---|
| Local | `http://localhost:5173/auth/callback` |
| Preview | `https://<branch>.semillas.pages.dev/auth/callback` |
| Staging | `https://staging.semillas.pages.dev/auth/callback` |
| Producción | `https://semillas.org/auth/callback` |

El callback del proveedor externo continúa apuntando al callback de Supabase
configurado en el Dashboard. Las banderas públicas
`VITE_AUTH_GOOGLE_ENABLED` y `VITE_AUTH_FACEBOOK_ENABLED` controlan la
visibilidad/uso de cada proveedor; no contienen secretos.

