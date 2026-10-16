# SEMILLAS

**Plataforma web y móvil para enseñar el evangelio de forma lúdica**  
**Documento guía de requisitos y desarrollo**  
**Versión 1.1**

**Escuela Superior Politécnica de Chimborazo (ESPOCH)**  
**Facultad de Informática y Electrónica**  
**Ingeniería de Software**

**Dirección del proyecto:** Isaac Torres  
**Lugar:** Riobamba, Ecuador  
**Documento para:** Equipo de desarrollo, 32 estudiantes de 7.º y 8.º semestre

---

## Índice

1. [Descripción del proyecto](#1-descripción-del-proyecto)
   - [1.1 Alcance de esta versión](#11-alcance-de-esta-versión)
2. [Metodología pedagógica CRECER](#2-metodología-pedagógica-crecer)
   - [2.1 Franjas de edad](#21-franjas-de-edad)
   - [2.2 Sendas trinitarias](#22-sendas-trinitarias)
3. [Arquitectura general](#3-arquitectura-general)
4. [Tecnologías de desarrollo y versiones](#4-tecnologías-de-desarrollo-y-versiones)
5. [Protocolo de desarrollo y convenciones de código](#5-protocolo-de-desarrollo-y-convenciones-de-código)
   - [5.1 Convenciones de nomenclatura](#51-convenciones-de-nomenclatura-mayúsculas-y-minúsculas)
   - [5.2 Idioma del código](#52-idioma-del-código)
   - [5.3 Estilo y formato automático](#53-estilo-y-formato-automático)
   - [5.4 Convención de commits](#54-convención-de-commits)
   - [5.5 Flujo de trabajo en Git](#55-flujo-de-trabajo-en-git)
   - [5.6 Reproducibilidad del entorno](#56-reproducibilidad-del-entorno)
   - [5.7 Metodología ágil y organización del equipo](#57-metodología-ágil-y-organización-del-equipo)
6. [Requisitos funcionales por módulo](#6-requisitos-funcionales-por-módulo-en-orden-de-construcción)
   - [6.1 Fase 1 — Cimientos](#61-fase-1--cimientos)
   - [6.2 Fase 2 — Contenido y juego base](#62-fase-2--contenido-y-juego-base)
   - [6.3 Fase 3 — Experiencia](#63-fase-3--experiencia)
   - [6.4 Fase 4 — Alcance ampliado](#64-fase-4--alcance-ampliado)
   - [6.5 Transversal — durante todo el proyecto](#65-transversal--durante-todo-el-proyecto)
7. [Requisitos no funcionales](#7-requisitos-no-funcionales)
8. [Requisitos de seguridad](#8-requisitos-de-seguridad-básicos)
9. [Paleta de colores](#9-paleta-de-colores)
   - [9.1 Colores de marca](#91-colores-de-marca)
   - [9.2 Colores de las sendas trinitarias](#92-colores-de-las-sendas-trinitarias)
10. [Funcionamiento del sistema](#10-funcionamiento-del-sistema)
    - [10.1 Sistema web](#101-sistema-web)
    - [10.2 Aplicación móvil](#102-aplicación-móvil)
11. [Tips de integración y buenas prácticas](#11-tips-de-integración-y-buenas-prácticas-lo-más-importante)
12. [Consejos de desarrollo para el éxito](#12-consejos-de-desarrollo-para-el-éxito)
13. [Distribución de los grupos de trabajo](#13-distribución-de-los-grupos-de-trabajo)
14. [Esquema de evaluación por módulo](#14-esquema-de-evaluación-por-módulo)
15. [Entregables finales](#15-entregables-finales)

---

## 1. Descripción del proyecto

**Semillas** es una plataforma gratuita, web y móvil, para enseñar el evangelio de Jesucristo a niños, preadolescentes y adolescentes de una manera llamativa, divertida y totalmente fundamentada en la Palabra de Dios.

Frente a un entorno de redes sociales poco productivas, Semillas busca ofrecer una experiencia lúdica —con historias, audios, videoclips, flashcards, juegos, quizzes, desafíos e insignias— donde las nuevas generaciones aprendan de Dios: del Padre, del Hijo y del Espíritu Santo, bajo un enfoque trinitario.

El proyecto nace con vocación misionera y social: llegar a los niños y adolescentes de comunidades y barrios del Ecuador, en especial de la provincia de Chimborazo, incluyendo zonas alejadas y con conectividad limitada. Por eso la plataforma está pensada para funcionar sin conexión y sincronizar el avance cuando haya internet.

El sistema se compone de una **aplicación móvil** para jugar y aprender, y un **sistema web** que, además de permitir jugar, ofrece un panel de administración donde se carga contenido nuevo.

El contenido crece con el tiempo: los administradores crean temas siguiendo una estructura estándar, de modo que cualquier tema tenga las mismas partes que otro, y esos temas alimentan la aplicación móvil sin necesidad de recompilarla.

### Objetivo del sistema

Promover las buenas nuevas de Cristo Jesús en las nuevas generaciones mediante una experiencia digital divertida, segura, bíblicamente fundamentada y accesible incluso sin internet, escalable para que futuros equipos sigan agregando contenido y funciones.

### 1.1 Alcance de esta versión

Se incluye ahora:

- Base de datos.
- API.
- Aplicación móvil Android.
- Sistema web.
- Autenticación con Google, Facebook o modo invitado.
- Onboarding por edad.
- Contenido con metodología CRECER.
- Actividades lúdicas.
- Gamificación.
- Carga de contenido por formulario.
- Funcionamiento offline.
- Funciones sociales en versión ligera:
  - Clubes.
  - Retos cooperativos.
  - Compartir logros.

Queda para el futuro:

- Idioma kichwa.
- Generación de temas con Inteligencia Artificial a partir de un PDF o de un tema y una edad.
- Juego multijugador en tiempo real.

La arquitectura queda preparada para todos ellos.

---

## 2. Metodología pedagógica CRECER

Cada tema se estructura en seis momentos, con el acrónimo **CRECER**. El mismo tema se ofrece a las tres franjas de edad, variando la complejidad del texto y de las actividades.

| Letra | Momento | Descripción |
|---|---|---|
| C | Conectar | Enganche que despierta el interés: audio, video o imagen y una breve introducción. |
| R | Relatar | Historia bíblica, mostrando el texto citado. Ejemplo: `2 Reyes 2:4 TLA`. |
| E | Enseñar | Verdad central del tema y versículo clave para memorizar. |
| C | Comprobar | Actividades lúdicas: quiz, flashcards, completar el versículo. |
| E | Experimentar | Aplicación a la vida mediante una o dos preguntas de reflexión. |
| R | Recompensar | Cierre, entrega de insignia y experiencia, XP. |

### 2.1 Franjas de edad

Al ingresar se pregunta la edad y se dirige al usuario a su segmento. La edad no se almacena, solo la franja.

| Franja | Edad |
|---|---:|
| Semillas | 5–8 años |
| Exploradores | 9–12 años |
| Embajadores | 13–17 años |

### 2.2 Sendas trinitarias

El contenido se organiza en tres sendas, cada una con su color:

- Padre.
- Hijo.
- Espíritu Santo.

Cada tema pertenece a una senda.

---

## 3. Arquitectura general

El principio rector es una **sola API para web y móvil**: la lógica de negocio, contenido y gamificación vive una única vez en el backend, y tanto la aplicación móvil como el sistema web la consumen.

Así no se duplica código ni se desincroniza el comportamiento entre plataformas.

### Componentes principales

- **Aplicación móvil:** enfocada en jugar y aprender; guarda contenido para uso sin conexión.
- **Sistema web:** permite jugar con rol usuario o invitado y administrar con rol administrador. Incluye una página pública de presentación, o fanpage.
- **API única REST:** servida por el backend; expone endpoints de contenido, progreso y administración.
- **Base de datos PostgreSQL:** normalizada a 3FN. El código completo se entrega por separado.
- **Autenticación:** Google, Facebook o invitado.
- **Almacenamiento de media:** audio, video e imágenes.

---

## 4. Tecnologías de desarrollo y versiones

Para que los 32 desarrolladores trabajen de forma igualitaria y todo integre sin fricción, se fija una única pila tecnológica con versiones.

Todos deben usar exactamente estas herramientas y versiones. Se recomienda confirmar la última versión LTS estable al inicio del proyecto y fijarla, o hacer lock, para todo el equipo.

| Área | Tecnología | Versión | Uso |
|---|---|---|---|
| Control de versiones | Git + GitHub | Git 2.4x | Repositorio y ramas |
| Base de datos | PostgreSQL (Supabase) | 16.x | Datos y progreso |
| Backend / API | Hono, Bun, TypeScript | Hono 4.x · Bun 1.1 · TS 5 | API única REST en Cloudflare Workers |
| ORM y migraciones | Drizzle / Supabase Client | 0.x | Acceso a datos y migraciones |
| Frontend PWA | React + Vite, TypeScript | React 18.3 · Vite 5 | PWA de juego y CMS (Web/Móvil) |
| Almacenamiento Local | Dexie (IndexedDB) | 4.x | Caché y cola de sync offline |
| Autenticación | Supabase Auth, Google / Facebook | — | Inicio de sesión y roles |
| Contenedores | Wrangler / Supabase CLI | — | Entornos reproducibles y emulación |
| Integración continua | GitHub Actions | — | Compilación, lint y typecheck por PR |
| Gestor de paquetes | Bun | Bun 1.1 | Dependencias y scripts |
| Formato y linter TS | Biome | 1.x | Estilo uniforme y linting rápido |
| Pruebas | Bun Test | Bun | Pruebas automáticas rápidas |

### Regla de oro de las versiones

Nadie instala “la versión que tenía en su computadora”.

Las versiones se fijan en los archivos de bloqueo:

- `bun.lock`
- `.nvmrc`

Idealmente, todos levantan el entorno con Wrangler y Supabase CLI para eliminar el clásico problema de “en mi máquina sí funciona”.

---

## 5. Protocolo de desarrollo y convenciones de código

Un mismo estilo de código evita conflictos y hace que cualquiera entienda el trabajo de otro.

Estas convenciones son obligatorias para todos los módulos.

### 5.1 Convenciones de nomenclatura: mayúsculas y minúsculas

Cada elemento se nombra siempre de la misma manera.

| Elemento | Convención | Ejemplo |
|---|---|---|
| Variables y funciones TS | camelCase | `contarPuntos` |
| Clases, componentes y widgets | PascalCase | `TarjetaTema` |
| Constantes globales | UPPER_SNAKE_CASE | `XP_POR_ACIERTO` |
| Archivos web / backend / API | kebab-case | `tema-service.ts` |
| Tablas y columnas SQL | snake_case en minúsculas | `versiculo_clave` |
| Endpoints REST | minúsculas, en plural | `/temas/{id}/actividades` |
| Ramas de Git | tipo/kebab-case | `feature/sync-offline` |
| Variables de entorno | UPPER_SNAKE_CASE | `DATABASE_URL` |

### 5.2 Idioma del código

Elijan un solo idioma para nombrar y sean consistentes.

Recomendación:

- Mantener los nombres de dominio en español para alinearse con la base de datos, que ya está en español.
- Mantener las palabras técnicas estándar en inglés.
- Escribir los comentarios en español.

### 5.3 Estilo y formato automático

Configuren:

- `Biome` para TypeScript/React.

La configuración debe estar compartida en el repositorio.

El formato no se discute: lo decide la herramienta y se aplica automáticamente al guardar.

### 5.4 Convención de commits

Usen **Conventional Commits**, con un prefijo que indica el tipo de cambio:

- `feat:`
- `fix:`
- `docs:`
- `style:`
- `refactor:`
- `test:`
- `chore:`

Ejemplo:

```txt
feat(gamificacion): agrega la racha diaria
```

### 5.5 Flujo de trabajo en Git

- La rama `main` está protegida y siempre debe compilar y funcionar.
- Cada módulo o funcionalidad se desarrolla en su propia rama: `feature/...`, `fix/...`.
- Todo cambio entra por Pull Request, revisado por al menos otro compañero.
- Se debe hacer integración diaria: mientras más se demora la fusión, más doloroso es el conflicto.

### 5.6 Reproducibilidad del entorno

Cada módulo incluye:

- Un `README` con los pasos exactos para levantarlo.
- Un archivo `.env.example`.
- Versiones fijadas.

El entorno de desarrollo usa Supabase remoto y no requiere Docker ni
`docker-compose`. Los servicios se ejecutan con Bun y las migraciones se
aplican únicamente al proyecto remoto enlazado, con revisión previa.

### 5.7 Metodología ágil y organización del equipo

Se aplica un principio de metodología ágil para coordinar a los 32 desarrolladores y lograr que la integración fluya.

#### Reunión diaria, daily

Cada día debe realizarse una reunión breve de 10 a 15 minutos donde cada persona dice:

- Qué avanzó.
- Qué hará.
- Qué la bloquea.

Es el motor de la coordinación y el principal aliado contra los problemas de integración.

#### Responsable por requisito

Dentro de cada subgrupo se asignan las funcionalidades y requisitos a personas específicas.

Cada requisito tiene un dueño nombrado que responde por su cumplimiento.

#### Un líder por grupo

Cada módulo tiene un líder responsable de integrar el código de su grupo con el del resto y de velar por que su rama se fusione de forma estable a la rama principal.

#### Monitoreo del avance

Invitar al correo `i_77torres@hotmail.com` como colaborador del repositorio de GitHub, para acompañar y monitorear el desarrollo del proyecto.

---

## 6. Requisitos funcionales por módulo, en orden de construcción

Los módulos están ordenados por jerarquía de construcción:

1. Primero los cimientos.
2. Luego el contenido y el juego.
3. Después la experiencia.
4. Al final el alcance ampliado.

La integración, Módulo 9, es transversal y corre durante todo el proyecto.

### 6.1 Fase 1 — Cimientos

#### Módulo 7 · Backend, API y Base de Datos

Columna vertebral. Se inicia primero.

| Código | Requisito |
|---|---|
| RF-B1 | Levantar la base de datos PostgreSQL en 3FN según el script entregado. |
| RF-B2 | Definir el contrato de la API el primer día y exponer endpoints de contenido, progreso y administración. |
| RNF-01 | Una sola API REST para web y móvil, sin duplicar lógica. |

#### Módulo 1 · Autenticación y Perfiles

| Código | Requisito |
|---|---|
| RF-01 | Acceso como invitado, con progreso local. |
| RF-02 / RF-03 | Inicio de sesión con Google y con Facebook. |
| RF-04 | El onboarding pide la edad y asigna la franja. No se guarda la edad. |
| RF-05 | Crear y editar el perfil: apodo, avatar, franja. |
| RF-06 | Migrar el progreso de invitado a la cuenta al registrarse. |
| RF-07 | Tres roles: administrador, usuario e invitado, con control de acceso. |

### 6.2 Fase 2 — Contenido y juego base

#### Módulo 6 · CMS / Administración

Carga de contenido.

| Código | Requisito |
|---|---|
| RF-16 | Crear y editar temas mediante un formulario guiado por los pasos CRECER. |
| RF-17 | Validar cada tema contra la estructura estándar antes de guardarlo. |
| RF-18 | Flujo borrador → revisión → publicación. Aprueba el administrador; publicar es un acto humano y registrado. |
| RF-19 | Publicar sin recompilar la aplicación. El contenido se sirve por la API. |
| RF-20 | Cargar media: audio, video, imagen. |

#### Módulo 2 · Contenido y Navegación móvil

| Código | Requisito |
|---|---|
| RF-08 | Navegar Sendas → Temas según la franja del usuario. |
| RF-09 | Ejecutar el recorrido CRECER: Conectar → Recompensar por tema. |
| RF-10 | Mostrar la cita bíblica y el versículo clave en formato `Libro cap:vers TLA`. |

#### Módulo 3 · Actividades Lúdicas

| Código | Requisito |
|---|---|
| RF-11 | Motor de actividades dirigido por configuración, con quiz, flashcards y completar el versículo. |

### 6.3 Fase 3 — Experiencia

#### Módulo 4 · Gamificación

| Código | Requisito |
|---|---|
| RF-13 | Otorgar XP y calcular el nivel. |
| RF-14 | Racha diaria. |
| RF-15 | Insignias por hito o por tema. |

#### Módulo 5 · Web de Juego y Fanpage

| Código | Requisito |
|---|---|
| RF-27 | Página pública de presentación con acceso a iniciar sesión, jugar como invitado o entrar a las funcionalidades. |
| RF-12 | La web permite jugar, como usuario o invitado, consumiendo la misma API, además de administrar. |

### 6.4 Fase 4 — Alcance ampliado

#### Módulo 8 · Offline y Sincronización

| Código | Requisito |
|---|---|
| RF-21 | Descargar temas para uso sin conexión. |
| RF-22 | Registrar el progreso sin conexión y sincronizarlo con eventos idempotentes al recuperar internet. |

#### Módulo 10 · Social, versión ligera

| Código | Requisito |
|---|---|
| RF-23 | Crear o unirse a clubes mediante un código de invitación: iglesia, curso, familia. |
| RF-24 | Tabla de progreso, ranking, por club. |
| RF-25 | Retos cooperativos con meta grupal. |
| RF-26 | Compartir logros como tarjeta de imagen en redes, sin exponer datos del menor. |

### 6.5 Transversal — durante todo el proyecto

#### Módulo 9 · Integración, QA y Despliegue

Dueño de los requisitos de proceso y entrega, y de las pruebas de integración entre módulos.

---

## 7. Requisitos no funcionales

| Código | Requisito |
|---|---|
| RNF-01 | Una sola API REST para web y móvil. |
| RNF-02 | Rendimiento aceptable en dispositivos de gama baja. |
| RNF-03 | Sincronización resiliente ante conectividad intermitente. |
| RNF-04 | Escalabilidad de contenido sin migraciones mayores de esquema. |
| RNF-05 | Base de datos normalizada a 3FN, con integridad referencial. |
| RNF-06 | Internacionalización preparada, textos externalizados; solo español activo. |
| RNF-07 | Accesibilidad: contraste adecuado, narración para pre-lectores, tamaños legibles. |
| RNF-08 | Mantenibilidad: código modular por dominio, documentación y pruebas mínimas. |
| RNF-09 | Portabilidad: Android y web responsiva / PWA. |

---

## 8. Requisitos de seguridad básicos

Seguridad básica pero suficiente para el plazo, con énfasis en la protección de menores.

| Código | Requisito |
|---|---|
| RS-01 | Autenticación mediante proveedor externo, Google/Facebook; la API verifica el token en cada petición. |
| RS-02 | Autorización por rol en cada endpoint; solo el administrador administra. |
| RS-03 | Minimización de datos de menores: se guarda la franja, no la edad ni la fecha de nacimiento. |
| RS-04 | Sin publicidad ni rastreo comercial dirigido a menores. |
| RS-05 | Transporte cifrado HTTPS/TLS en toda comunicación. |
| RS-06 | Validación y saneamiento de entradas para prevenir inyección y XSS en la API y el CMS. |
| RS-07 | En la sincronización, cada usuario solo puede escribir su propio progreso: verificación de propiedad más idempotencia. |
| RS-08 | El contenido llega a los niños solo tras la aprobación del administrador. |
| RS-09 | En el social, sin chat libre entre desconocidos; con moderación y opción de reporte. |
| RS-10 | Gestión segura de secretos: variables de entorno, nunca dentro del repositorio. |

---

## 9. Paleta de colores

Se usa una sola paleta para toda la plataforma.

La adaptación por edad no se hace con colores distintos, sino con:

- Tamaño de la tipografía.
- Densidad de la interfaz.
- Cantidad de animación:
  - Más lúdica en Semillas.
  - Más sobria en Embajadores.

### 9.1 Colores de marca

| Nombre | Hex | Uso sugerido |
|---|---|---|
| Verde Brote | `#2E9E5B` | Primario |
| Dorado Semilla | `#F4B740` | Secundario |
| Coral Alegría | `#EE6C4D` | Acción / recompensa |
| Verde Profundo | `#123B2C` | Texto / títulos |
| Crema Fondo | `#F7F4EC` | Fondo |

### 9.2 Colores de las sendas trinitarias

| Senda | Nombre | Hex |
|---|---|---|
| Padre | Azul Cielo | `#3D8BD4` |
| Hijo | Ámbar Luz | `#E9A23B` |
| Espíritu | Verde Vida | `#17A398` |

### Uso

En móvil:

- Fondo Crema con tarjetas blancas.
- Verde para la navegación.
- Coral solo para botones de acción y celebraciones.

En la web de administración:

- Fondo blanco o gris muy claro para las jornadas largas de carga.
- Verde Profundo para títulos y texto.

Todos los pares texto-fondo cumplen contraste accesible.

---

## 10. Funcionamiento del sistema

### 10.1 Sistema web

Abre con la fanpage. Esta presenta el proyecto, muestra el versículo base:

> “Id por todo el mundo y predicad el evangelio a toda criatura.”  
> — Marcos 16:15

La fanpage ofrece:

- Iniciar sesión.
- Jugar como invitado.
- Entrar a las funcionalidades.

El usuario con sesión de Google o Facebook juega igual que en móvil y guarda su avance.

El invitado juega, pero no se guarda su avance.

El administrador entra al panel y crea contenido con el formulario CRECER. Para ello:

1. Llena la ficha:
   - Título.
   - Senda.
   - Cita bíblica.
   - Versión.
   - Segmentos.
2. Completa los seis momentos CRECER, con su variante por edad.
3. Sube media.
4. Guarda como borrador.
5. Publica tras la revisión.

Al publicar, el tema aparece en la app móvil sin recompilar.

### 10.2 Aplicación móvil

Al abrir por primera vez, pregunta la edad y asigna la franja.

Luego:

- Muestra las tres sendas.
- Dentro de cada senda, muestra los temas disponibles para esa franja.
- Cada tema se recorre con la secuencia CRECER.
- Muestra el texto bíblico y el versículo clave.
- Las actividades otorgan XP.
- Se llevan rachas, niveles e insignias.
- Permite descargar temas para jugar sin conexión.
- El progreso se sincroniza al volver el internet.

Social ligero:

- Unirse a clubes por código.
- Ver el ranking del club.
- Participar en retos cooperativos.
- Compartir logros como imagen.

---

## 11. Tips de integración y buenas prácticas, lo más importante

Con 32 desarrolladores y varios módulos en paralelo, la integración es la tarea más compleja y el mayor riesgo.

El talento individual no es el problema; la coordinación sí.

Estas prácticas son obligatorias:

- Un solo repositorio en GitHub, con control de versiones para todo el proyecto: móvil, web y backend.
- Una rama por módulo o funcionalidad; nunca se trabaja directo sobre la rama principal.
- Integración diaria y frecuente: cada equipo sincroniza su código todos los días.
- Pull Requests revisados antes de fusionar a la rama principal; al menos otro compañero revisa.
- Contrato de API primero: el Módulo 7 define y publica el contrato de la API el primer día.
- Los demás equipos trabajan contra ese contrato usando datos simulados hasta que esté listo.
- Rama principal siempre estable: lo que está en la rama principal debe compilar y funcionar.
- Integración continua: configurar comprobaciones automáticas, compilación y pruebas, en cada Pull Request.
- Estándares comunes: mismo estilo de código, misma convención de nombres, mismo formato de mensajes de commit.
- Reunión diaria de 15 minutos para sincronizar avances y bloqueos entre módulos.
- Documentar sobre la marcha: cada módulo mantiene un README de cómo levantarlo y usarlo.

### Definición de Terminado por módulo

Un módulo está terminado cuando:

1. Cumple el 100 % de sus requisitos funcionales.
2. Su rama está integrada y funcionando junto al resto en la rama principal.
3. Está documentado.

Los tres puntos, no solo el primero.

---

## 12. Consejos de desarrollo para el éxito

Estos consejos complementan las prácticas de integración de la sección anterior y apuntan a los riesgos reales de un proyecto grande con plazo corto.

### 12.1 De-riesgo temprano

#### Esqueleto ambulante en la primera semana

Logren cuanto antes el camino completo más delgado funcionando de punta a punta:

```txt
inicio de sesión → ver un tema → responder una actividad → guardar XP
```

Aunque sea sencillo, si eso corre integrado el día 3 o 4, el mayor riesgo desaparece. Dejarlo para el final es la causa número uno de fracaso.

#### Ataquen el offline desde el inicio, no al final

Es el módulo más difícil, porque requiere dos implementaciones: web y móvil.

El equipo de sincronización debe tener un prototipo mínimo funcionando en la semana 1.

#### Despliegue temprano

Suban un “hola mundo” al servidor de la ESPOCH y publiquen un APK de prueba en los primeros días.

El despliegue siempre trae sorpresas; no deben aparecer el día de la entrega.

### 12.2 Contenido y pruebas

#### Carguen datos reales cuanto antes

Usen la lección de ejemplo entregada:

```txt
semillas_leccion_ejemplo.sql
```

Sin contenido de prueba, ningún equipo puede probar de verdad su módulo.

#### Prueben en un Android de gama baja real

No prueben solo en el emulador.

Ese es el dispositivo de sus usuarios en las comunidades. El rendimiento y el tamaño de las descargas se ven distintos ahí.

#### Prueben la idempotencia del sync con un caso concreto

Caso recomendado:

1. Jugar sin internet.
2. Cerrar la app.
3. Reconectar.
4. Verificar que el XP no se duplica ni se pierde.

### 12.3 Calidad y entrega

#### Sistema de diseño compartido

Definan desde el día 1 los componentes base:

- Botón.
- Tarjeta.
- Encabezado.

También definan los colores de la paleta como variables.

Con 32 personas, sin esto tendrán diez botones distintos.

#### Feature flags

Permiten fusionar trabajo incompleto sin romper la rama principal.

El módulo apagado no molesta.

#### Nunca suban secretos al repositorio

Usen:

- Archivo `.env.example`.
- Variables de entorno.

Esto es parte de los requisitos de seguridad.

#### Respalden la base de datos desde el día 1

Es un entregable.

Un `pg_dump` periódico evita tragedias.

### 12.4 Equipo y alcance

- Pongan a sus mejores estudiantes en la columna vertebral, API y base de datos, y en el offline; esos dos frentes bloquean o desbloquean a todos.
- Definan “debe salir sí o sí” frente a “extra deseable” dentro del alcance.
- Si algo se retrasa, el núcleo igual entrega. Protejan el núcleo.
- Cuidado con la trampa del “90 % terminado”: un módulo no está listo hasta que está integrado y funcionando junto al resto.
- Integren a diario.
- Demo en cada hito para la dirección: validación corta contra los criterios de aceptación, no contra impresiones.

---

## 13. Distribución de los grupos de trabajo

Con 32 estudiantes se sugiere formar 10 grupos, uno por módulo.

El tamaño de cada grupo se asigna según la complejidad del módulo, no en partes iguales: los frentes de los que depende el resto llevan más integrantes.

| Grupo / Módulo | Integrantes | Enfoque |
|---|---:|---|
| M7 · Backend, API y Base de Datos | 5 | Columna vertebral; publica el contrato de la API el primer día. |
| M8 · Offline y Sincronización | 4 | Dos implementaciones: web y móvil. |
| M6 · CMS / Administración | 4 | Formulario CRECER y flujo de publicación. |
| M1 · Autenticación y Perfiles | 3 | Google, Facebook, invitado, onboarding, roles. |
| M2 · Contenido y Navegación móvil | 3 | Sendas, temas y recorrido CRECER. |
| M3 · Actividades Lúdicas | 3 | Motor de quiz, flashcards y completar. |
| M4 · Gamificación | 3 | XP, niveles, rachas e insignias. |
| M5 · Web de Juego y Fanpage | 3 | La web también juega, más la landing. |
| M9 · Integración, QA y Despliegue | 2 | Transversal; trabaja con los líderes de grupo. |
| M10 · Social, versión ligera | 2 | Clubes, retos y compartir. |
| **Total** | **32** | **10 grupos** |

Cada grupo nombra un líder.

Los líderes, junto con el grupo de Integración, M9, conforman la capa de integración del proyecto.

Aunque los 10 grupos existen desde el primer día, el Módulo 7 debe publicar el contrato de la API al inicio para que todos trabajen en paralelo contra datos simulados sin bloquearse.

---

## 14. Esquema de evaluación por módulo

Cada grupo pequeño responde por su módulo y se evalúa de forma objetiva.

| Porcentaje | Criterio |
|---:|---|
| 70 % | Cumplimiento funcional: los requisitos del módulo funcionan al 100 %. |
| 20 % | Integración exitosa en la versión final. |
| 10 % | Documentación y entrega. |

Como piso de aprobación, los requisitos funcionales del módulo deben estar al 100 %.

Los pesos son ajustables por la dirección del proyecto.

---

## 15. Entregables finales

- APK instalable de Android, funcional.
- URL de la web desplegada en el servidor de la red local de la ESPOCH, accesible y operativa.
- Repositorio de GitHub con absolutamente todo:
  - Código de móvil.
  - Código de web.
  - Código de backend.
  - Respaldo, backup, de la base de datos.
  - Scripts de despliegue.
  - Archivo de variables de entorno de ejemplo.
  - Documentación:
    - README.
    - Manual de usuario.
    - Manual de administrador.
    - Guía de arquitectura.

Esto permitirá que los futuros practicantes continúen el desarrollo sobre esta base.

---

> “Id por todo el mundo y predicad el evangelio a toda criatura.”  
> — Marcos 16:15
