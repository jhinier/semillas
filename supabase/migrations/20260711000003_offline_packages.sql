-- Garantiza idempotencia para paquetes y descargas offline existentes.
DELETE FROM paquete_sin_conexion a
USING paquete_sin_conexion b
WHERE a.ctid < b.ctid
  AND a.tema_id = b.tema_id
  AND a.version_contenido = b.version_contenido;

DELETE FROM descarga_sin_conexion_usuario a
USING descarga_sin_conexion_usuario b
WHERE a.ctid < b.ctid
  AND a.usuario_id = b.usuario_id
  AND a.paquete_id = b.paquete_id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_paquete_sin_conexion_tema_version
  ON paquete_sin_conexion (tema_id, version_contenido);

CREATE UNIQUE INDEX IF NOT EXISTS uq_descarga_sin_conexion_usuario_paquete
  ON descarga_sin_conexion_usuario (usuario_id, paquete_id);
