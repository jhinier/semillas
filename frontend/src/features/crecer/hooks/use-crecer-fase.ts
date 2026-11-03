import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { obtenerTema, obtenerPasos, obtenerActividades } from "@/features/themes/themes.api";
import { obtenerMiPerfil } from "@/features/perfil/profile.api";
import type { Actividad, ContenidoPaso, EventoProgreso, Paso } from "@/shared/api/api";
import { registrarEventosCrecer } from "../services/crecer-progress";
import { playSound } from "@/lib/audio";

type UseCrecerFaseOptions = {
  themeId: string;
  pasoCodigo: string;
};

export type ClaveSenda = "padre" | "hijo" | "espiritu";
export type CodigoEdad = "semillas" | "exploradores" | "embajadores";

export type DetalleSendaEdad = {
  etiquetaEdad: string;
  rangoEdad: string;
  claveSenda: ClaveSenda;
  nombreSenda: string;
  citaBiblica: string;
  versiculoClave: string;
  resumenSenda: string;
  pilares: Array<{
    clave: ClaveSenda;
    titulo: string;
    senda: string;
    versiculo: string;
    descripcion: string;
    aplicacion: string;
  }>;
};

type PasoCrecerSeed = {
  titulo: string;
  instruccion_corta: string;
  cuerpo: string;
  pregunta_reflexion?: string;
};

const CATALOGO_SENDAS_POR_EDAD: Record<
  ClaveSenda,
  Record<
    CodigoEdad,
    {
      detalle: DetalleSendaEdad;
      pasos: Record<
        "conectar" | "relatar" | "ensenar" | "comprobar" | "experimentar" | "recompensar",
        PasoCrecerSeed
      >;
    }
  >
> = {
  padre: {
    semillas: {
      detalle: {
        etiquetaEdad: "Semillas",
        rangoEdad: "5 a 8 años",
        claveSenda: "padre",
        nombreSenda: "Senda del Padre",
        citaBiblica: "Juan 3:16 TLA",
        versiculoClave:
          "«Dios amó tanto a la gente de este mundo, que me entregó a mí, que soy su único Hijo, para que todo el que crea en mí no muera, sino que tenga vida eterna.» (Juan 3:16 TLA)",
        resumenSenda:
          "En la Senda del Padre para Semillas (5 a 8 años), los niños descubren a través de los 6 pasos CRECER que Dios Padre nos creó con amor, nos cuida cada día y nunca nos deja solos.",
        pilares: [
          {
            clave: "padre",
            titulo: "1. Dios Padre nos creó con amor",
            senda: "Senda del Padre · Paso 1 CRECER",
            versiculo: "Génesis 1:1 TLA · 1 Juan 4:8 TLA — «Dios es amor»",
            descripcion:
              "Dios Padre hizo el sol, las estrellas, los animales y te formó a ti con mucho cariño porque eres muy especial para Él.",
            aplicacion: "Al despertar hoy, dale gracias a Dios Padre por el regalo de la vida y la creación.",
          },
          {
            clave: "padre",
            titulo: "2. El abrazo protector de nuestro Padre",
            senda: "Senda del Padre · Cuidado paternal",
            versiculo: "Salmos 23:1 TLA — «Dios es mi pastor, nada me faltará»",
            descripcion:
              "Así como un papá bueno abraza y protege a sus hijos, Dios Padre escucha tus oraciones y te cuida cuando estás alegre o cuando tienes miedo.",
            aplicacion: "Habla con Dios Padre en oración sabiendo que Él siempre te escucha con ternura.",
          },
          {
            clave: "padre",
            titulo: "3. El regalo más grande del Padre",
            senda: "Senda del Padre · Promesa fiel",
            versiculo: "Juan 3:16 TLA — «Dios amó tanto a la gente de este mundo»",
            descripcion:
              "El amor de Dios Padre es tan grande que nunca se acaba: somos sus hijos amados y Él siempre cumple sus promesas.",
            aplicacion: "Comparte un abrazo y una palabra amable con tu familia recordando el amor del Padre.",
          },
        ],
      },
      pasos: {
        conectar: {
          titulo: "El abrazo gigante de Dios Padre (Semillas · 5 a 8 años)",
          instruccion_corta:
            "Senda del Padre · Semillas (5-8 años) · Imagina el abrazo más grande del mundo: así te ama y te cuida Dios Padre cada día.",
          cuerpo:
            "¿Sabías que Dios Padre te conoce por tu nombre y te ama muchísimo? No importa lo que pase, su amor es como un abrazo gigante que nunca termina.\n\nEn esta Senda del Padre recorremos la metodología CRECER para descubrir tres verdades hermosas:\n• Dios Padre es nuestro Creador amoroso: Él hizo el cielo, la tierra y te creó a ti con un propósito especial.\n• Dios Padre nos cuida siempre: así como unos papás amorosos protegen a sus hijos, nuestro Padre celestial vela por nosotros día y noche.\n• Su amor es para siempre: no tienes que tener miedo, porque eres un hijo muy amado de Dios Padre.",
        },
        relatar: {
          titulo: "La historia del amor de Dios Padre (Juan 3:16 TLA)",
          instruccion_corta: "Escucha con atención cómo Dios Padre nos muestra su amor desde la creación (Juan 3:16 TLA).",
          cuerpo:
            "La Biblia dice en Juan 3:16 TLA: «Dios amó tanto a la gente de este mundo, que me entregó a mí, que soy su único Hijo». Desde el principio del mundo, Dios Padre demostró su amor creando un hogar hermoso para nosotros, cuidando a su pueblo y cumpliendo siempre sus promesas.",
        },
        ensenar: {
          titulo: "Dios Padre siempre te ama (1 Juan 4:8 TLA)",
          instruccion_corta: "Versículo clave para memorizar: «Dios es amor» (1 Juan 4:8 TLA).",
          cuerpo:
            "Así como el sol sale cada mañana, el amor de Dios Padre está contigo todos los días (1 Juan 4:8 TLA). Él se alegra cuando hablas con Él y siempre tiene sus brazos abiertos para ti.",
        },
        comprobar: {
          titulo: "Comprobemos lo aprendido en la Senda del Padre",
          instruccion_corta: "Completa las actividades (Quiz, Flashcards y Completar versículo) para avanzar.",
          cuerpo: "Demuestra cuánto aprendiste sobre el amor y el cuidado de Dios Padre.",
        },
        experimentar: {
          titulo: "Viviendo como hijos amados del Padre",
          instruccion_corta: "Reflexiona y pon en práctica el amor de Dios Padre en tu casa.",
          cuerpo:
            "Cuando sabemos que Dios Padre nos ama tanto, nuestro corazón se llena de gratitud y queremos compartir ese cariño con nuestra familia y amigos.",
          pregunta_reflexion: "¿Cómo te hace sentir saber que Dios Padre te cuida y te ama siempre?",
        },
        recompensar: {
          titulo: "¡Senda del Padre completada!",
          instruccion_corta: "¡Felicidades por completar los 6 pasos CRECER de la Senda del Padre!",
          cuerpo:
            "¡Lo hiciste muy bien! Has completado la metodología CRECER en la Senda del Padre para Semillas. Recuerda siempre que Dios Padre te ama muchísimo.",
        },
      },
    },
    exploradores: {
      detalle: {
        etiquetaEdad: "Exploradores",
        rangoEdad: "9 a 12 años",
        claveSenda: "padre",
        nombreSenda: "Senda del Padre",
        citaBiblica: "1 Juan 4:8-10 TLA",
        versiculoClave:
          "«El amor consiste en esto: no en que nosotros hayamos amado a Dios, sino en que él nos amó a nosotros y envió a su Hijo.» (1 Juan 4:10 TLA)",
        resumenSenda:
          "En la Senda del Padre para Exploradores (9 a 12 años), profundizamos mediante los 6 pasos CRECER en el carácter fiel, creador e incondicional de Dios Padre.",
        pilares: [
          {
            clave: "padre",
            titulo: "1. Dios Padre · El origen de todo amor verdadero",
            senda: "Senda del Padre · Paso 1 CRECER",
            versiculo: "1 Juan 4:10 TLA — «Él nos amó a nosotros primero»",
            descripcion:
              "El amor de Dios Padre no es una emoción pasajera: Él tomó la iniciativa de crearnos, buscarnos y establecernos como hijos suyos.",
            aplicacion: "Reconoce cada día las muestras del cuidado y la provisión de Dios Padre en tu vida.",
          },
          {
            clave: "padre",
            titulo: "2. La fidelidad y las promesas del Padre",
            senda: "Senda del Padre · Pacto y Promesa",
            versiculo: "Salmos 103:13 TLA — «Dios es tan tierno con los que lo honran como es un padre con sus hijos»",
            descripcion:
              "A lo largo de toda la historia bíblica vemos que Dios Padre nunca falla a su palabra: Él corrige con ternura, perdona y guía nuestros pasos.",
            aplicacion: "Confía en las promesas de Dios Padre cuando enfrentes dudas o retos en la escuela.",
          },
          {
            clave: "padre",
            titulo: "3. Llamados hijos de Dios",
            senda: "Senda del Padre · Identidad",
            versiculo: "1 Juan 3:1 TLA — «Miren cuánto nos ama Dios el Padre, que se nos puede llamar hijos de Dios»",
            descripcion:
              "No tenemos que ganarnos el amor del Padre por méritos; lo recibimos con fe y gratitud viviendo como sus hijos.",
            aplicacion: "Refleja el carácter de tu Padre celestial tratando a los demás con respeto y generosidad.",
          },
        ],
      },
      pasos: {
        conectar: {
          titulo: "¿Cómo es el amor de Dios Padre? (Exploradores · 9 a 12 años)",
          instruccion_corta:
            "Senda del Padre · Exploradores (9-12 años) · Descubre cómo el amor incondicional de Dios Padre da inicio a nuestro recorrido CRECER.",
          cuerpo:
            "Todos hablamos del amor, pero en la Biblia aprendemos que el amor verdadero no es solo un sentimiento pasajero: es una decisión fiel y constante. Dios Padre nos amó primero sin que tuviéramos que ganárnoslo.\n\nEn esta Senda del Padre exploramos tres pilares fundamentales para tu edad:\n• El Padre como Creador y Fuente de vida: todo lo bueno que existe nace de su sabiduría y bondad (Santiago 1:17 TLA).\n• Un amor sin condiciones: mientras el mundo suele amar por conveniencia, el Padre nos ama con fidelidad eterna (1 Juan 4:9-10 TLA).\n• Nuestra identidad como hijos: conocer al Padre cambia la forma en que nos vemos a nosotros mismos y a nuestro prójimo.",
        },
        relatar: {
          titulo: "Dios Padre es amor (1 Juan 4:8-10 TLA)",
          instruccion_corta: "Lee y escucha 1 Juan 4:8-10 TLA: ¿por qué dice la Biblia que Dios ES amor?",
          cuerpo:
            "El apóstol Juan escribió una verdad extraordinaria en 1 Juan 4:8-10 TLA: «Dios es amor». Eso significa que todo lo que Dios Padre hace —su creación, sus leyes, su perdón y sus promesas— brota de su amor paternal por nosotros.",
        },
        ensenar: {
          titulo: "El amor incondicional del Padre (Juan 3:16 TLA)",
          instruccion_corta: "Memoriza 1 Juan 4:10 TLA y Juan 3:16 TLA como fundamento de la Senda del Padre.",
          cuerpo:
            "El amor de Dios Padre no depende de que seamos perfectos; Él nos espera siempre con brazos abiertos para perdonarnos, enseñarnos y ayudarnos a crecer en fe.",
        },
        comprobar: {
          titulo: "Comprobemos nuestro recorrido en la Senda del Padre",
          instruccion_corta: "Resuelve las actividades de comprobación (Quiz, Flashcards y Completar versículo) para avanzar.",
          cuerpo: "Pon a prueba lo que has aprendido sobre la naturaleza y las promesas de Dios Padre.",
        },
        experimentar: {
          titulo: "Compartiendo el amor del Padre esta semana",
          instruccion_corta: "Escribe cómo aplicarás lo aprendido en la Senda del Padre.",
          cuerpo:
            "Como hijos de Dios Padre, estamos llamados a demostrar su bondad y paciencia con quienes nos rodean.",
          pregunta_reflexion:
            "Esta semana, ¿con qué acción concreta puedes demostrar el amor y la bondad de Dios Padre a alguien que lo necesita?",
        },
        recompensar: {
          titulo: "¡Excelente! Completaste la Senda del Padre",
          instruccion_corta: "Has cumplido los 6 pasos CRECER de la Senda del Padre.",
          cuerpo:
            "Excelente trabajo, Explorador. Has completado los 6 pasos CRECER de la Senda del Padre y fortalecido tu fe en su amor incondicional.",
        },
      },
    },
    embajadores: {
      detalle: {
        etiquetaEdad: "Embajadores",
        rangoEdad: "13 a 17 años",
        claveSenda: "padre",
        nombreSenda: "Senda del Padre",
        citaBiblica: "Romanos 8:38-39 TLA",
        versiculoClave:
          "«Nada en todo el mundo podrá separarnos del amor que Dios nos ha mostrado por medio de Cristo Jesús.» (Romanos 8:39 TLA)",
        resumenSenda:
          "En la Senda del Padre para Embajadores (13 a 17 años), la metodología CRECER profundiza en la paternidad de Dios, la gracia soberana y nuestra identidad firme frente a los desafíos actuales.",
        pilares: [
          {
            clave: "padre",
            titulo: "1. El amor como esencia misma de Dios Padre",
            senda: "Senda del Padre · Paso 1 CRECER",
            versiculo: "1 Juan 4:8-10 TLA — «Dios es amor y nos amó primero»",
            descripcion:
              "La soberanía, la justicia y la gracia del Padre no se contradicen: todas fluyen de su esencia amorosa y eterna.",
            aplicacion: "Construye tu cosmovisión sobre el carácter inmutable de Dios Padre.",
          },
          {
            clave: "padre",
            titulo: "2. Adopción e identidad frente a la presión social",
            senda: "Senda del Padre · Identidad en el Padre",
            versiculo: "1 Juan 3:1 TLA — «Miren cuánto nos ama Dios el Padre, que se nos puede llamar hijos de Dios»",
            descripcion:
              "En una etapa donde muchos buscan validación en redes o apariencias, el Padre define tu valor real e inquebrantable como su hijo.",
            aplicacion: "Descansa en la aceptación del Padre por encima de la aprobación pasajera del entorno.",
          },
          {
            clave: "padre",
            titulo: "3. Un amor del que nada nos puede separar",
            senda: "Senda del Padre · Seguridad eterna",
            versiculo: "Romanos 8:38-39 TLA — «Nada podrá separarnos del amor de Dios»",
            descripcion:
              "Ni las dudas, ni las pruebas, ni el futuro pueden romper el pacto de amor con el que el Padre nos sostiene.",
            aplicacion: "Sé un embajador del amor del Padre llevando esperanza y firmeza a tu comunidad.",
          },
        ],
      },
      pasos: {
        conectar: {
          titulo: "Paternidad divina e identidad firme (Embajadores · 13 a 17 años)",
          instruccion_corta:
            "Senda del Padre · Embajadores (13-17 años) · Reflexiona sobre cómo el amor eterno de Dios Padre transforma tu identidad y propósito.",
          cuerpo:
            "En un mundo donde el afecto y la aceptación suelen ser condicionales y depender de logros o apariencias, la Palabra de Dios nos revela un amor radicalmente diferente: el amor eterno de Dios Padre.\n\nEn este primer paso de la Senda del Padre profundizamos en tres dimensiones clave para Embajadores:\n• El amor que toma la iniciativa: Dios Padre no esperó a que fuéramos perfectos para amarnos; su gracia nos alcanzó primero (1 Juan 4:10 TLA).\n• Identidad de hijos amados: cuando comprendemos quién es nuestro Padre celestial (1 Juan 3:1 TLA), dejamos de depender de etiquetas externas.\n• Propósito y misión: el amor del Padre nos sostiene en medio de cualquier circunstancia (Romanos 8:38-39 TLA) y nos impulsa a amar con integridad.",
        },
        relatar: {
          titulo: "Nada nos separa del amor del Padre (Romanos 8:38-39 TLA)",
          instruccion_corta: "Analiza y escucha Romanos 8:38-39 TLA dentro de la Senda del Padre.",
          cuerpo:
            "Pablo declara en Romanos 8:38-39 TLA con total convicción que ni la muerte, ni la vida, ni lo presente, ni lo por venir podrá separarnos del amor de Dios. Esta promesa revela la fidelidad inquebrantable del Padre hacia sus hijos.",
        },
        ensenar: {
          titulo: "El amor como esencia de Dios Padre (1 Juan 3:1 TLA)",
          instruccion_corta: "Memoriza Romanos 8:38-39 TLA: nada nos separa del amor del Padre.",
          cuerpo:
            "El amor no es solo algo que Dios hace; es su esencia. Su corrección, su gracia y su dirección buscan siempre formarnos y darnos un futuro de esperanza.",
        },
        comprobar: {
          titulo: "Comprobación doctrinal · Senda del Padre",
          instruccion_corta: "Completa los retos de comprobación (Quiz, Flashcards y Completar versículo) para avanzar.",
          cuerpo: "Verifica tu comprensión bíblica sobre el amor y las promesas de Dios Padre.",
        },
        experimentar: {
          titulo: "Viviendo como Embajadores del Padre",
          instruccion_corta: "Reflexiona con honestidad y escribe tu compromiso personal.",
          cuerpo:
            "Si el amor de Dios Padre es incondicional e inquebrantable, nuestra vida debe reflejar seguridad interior, compasión y liderazgo íntegro.",
          pregunta_reflexion:
            "Si el amor de Dios Padre es incondicional e inquebrantable, ¿cómo debería impactar eso en tu identidad y en cómo tratas a los demás?",
        },
        recompensar: {
          titulo: "¡Senda del Padre cumplida con éxito!",
          instruccion_corta: "Completaste los 6 pasos CRECER de la Senda del Padre.",
          cuerpo:
            "¡Bien hecho, Embajador! Has completado la metodología CRECER de la Senda del Padre. Que Romanos 8:38-39 TLA sea siempre un ancla para tu identidad y tu fe.",
        },
      },
    },
  },
  hijo: {
    semillas: {
      detalle: {
        etiquetaEdad: "Semillas",
        rangoEdad: "5 a 8 años",
        claveSenda: "hijo",
        nombreSenda: "Senda del Hijo",
        citaBiblica: "Lucas 10:27 TLA",
        versiculoClave:
          "«Ama a tu Dios con todo lo que piensas y con todo lo que eres, y ama a tu prójimo como a ti mismo.» (Lucas 10:27 TLA)",
        resumenSenda:
          "En la Senda del Hijo para Semillas (5 a 8 años), los niños aprenden con los 6 pasos CRECER cómo Jesús, nuestro Salvador y mejor amigo, nos enseña con hermosas parábolas.",
        pilares: [
          {
            clave: "hijo",
            titulo: "1. Jesús, el Maestro que ama a los niños",
            senda: "Senda del Hijo · Paso 1 CRECER",
            versiculo: "Marcos 10:14 TLA — «Dejen que los niños se acerquen a mí»",
            descripcion:
              "Jesús contaba historias sencillas llamadas parábolas sobre semillas, ovejas y tesoros para que todos pudiéramos entender el amor de Dios.",
            aplicacion: "Escucha con alegría las historias de Jesús en la Biblia.",
          },
          {
            clave: "hijo",
            titulo: "2. La historia del Buen Samaritano",
            senda: "Senda del Hijo · Compasión en acción",
            versiculo: "Lucas 10:33 TLA — «Al verlo, tuvo compasión de él»",
            descripcion:
              "Con esta parábola, Jesús nos enseñó que amar a los demás significa ayudar a quien está triste o herido sin importar quién sea.",
            aplicacion: "Ayuda hoy a un compañero o familiar que necesite una mano amiga.",
          },
          {
            clave: "hijo",
            titulo: "3. La buena semilla en nuestro corazón",
            senda: "Senda del Hijo · Parábola del Sembrador",
            versiculo: "Mateo 13:23 TLA — «Escuchan el mensaje, lo entienden y producen fruto»",
            descripcion:
              "Cuando escuchamos a Jesús y obedecemos sus enseñanzas con alegría, nuestro corazón es como tierra buena donde crecen cosas hermosas.",
            aplicacion: "Guarda las palabras de Jesús en tu corazón y compártelas en casa.",
          },
        ],
      },
      pasos: {
        conectar: {
          titulo: "Las historias maravillosas de Jesús (Semillas · 5 a 8 años)",
          instruccion_corta:
            "Senda del Hijo · Semillas (5-8 años) · ¿Te gustan los cuentos? Descubre cómo Jesús usaba historias llamadas parábolas para enseñarnos.",
          cuerpo:
            "A todos nos encanta escuchar historias bonitas. Cuando Jesús caminaba por la tierra, la gente se sentaba a su alrededor porque Él era el mejor Maestro del mundo y contaba historias especiales llamadas parábolas.\n\nEn esta Senda del Hijo aprenderemos con la metodología CRECER:\n• Qué es una parábola: es una historia con cosas que conocemos (semillas, ovejas, casas) que nos enseña una gran verdad del Reino de Dios.\n• El ejemplo de Jesús: Él no solo hablaba bonito, sino que abrazaba a los niños, sanaba a los enfermos y nos salvó por amor.\n• Cómo seguir a Jesús: cada parábola nos invita a amar, ayudar y perdonar como Él lo hizo.",
        },
        relatar: {
          titulo: "El Sembrador y el Buen Samaritano (Lucas 8:8 TLA y Lucas 10:33 TLA)",
          instruccion_corta: "Escucha cómo Jesús enseñó a cuidar su Palabra y a ayudar al prójimo (Lucas 10:30-37 TLA).",
          cuerpo:
            "Un día Jesús contó la historia de un sembrador que lanzó semillas en el campo: las semillas que cayeron en tierra buena crecieron fuertes y dieron mucho fruto (Lucas 8:8 TLA). También contó la historia del Buen Samaritano, un viajero bondadoso que curó y cuidó a un hombre herido en el camino (Lucas 10:30-35 TLA). Así nos enseña Jesús a tener un corazón bueno y compasivo.",
        },
        ensenar: {
          titulo: "Escuchar a Jesús y hacer el bien (Lucas 10:27 TLA)",
          instruccion_corta: "Versículo clave para memorizar: «Ama a tu prójimo como a ti mismo» (Lucas 10:27 TLA).",
          cuerpo:
            "Jesús dijo en Lucas 10:37 TLA: «Ve y haz tú lo mismo». Cuando escuchamos las enseñanzas de Jesús y ayudamos con amor a los demás, brillamos como pequeños discípulos suyos.",
        },
        comprobar: {
          titulo: "Comprobemos lo aprendido en la Senda del Hijo",
          instruccion_corta: "Completa las actividades sobre las parábolas de Jesús para poder continuar.",
          cuerpo: "Demuestra lo que aprendiste sobre las historias que contaba Jesús.",
        },
        experimentar: {
          titulo: "Siguiendo los pasos de Jesús hoy",
          instruccion_corta: "Piensa cómo puedes imitar a Jesús y al Buen Samaritano.",
          cuerpo:
            "Jesús quiere que pongamos en práctica sus historias compartiendo, ayudando y tratando con cariño a todos.",
          pregunta_reflexion:
            "¿A quién puedes ayudar hoy con cariño como lo enseñó Jesús en la parábola del Buen Samaritano?",
        },
        recompensar: {
          titulo: "¡Senda del Hijo completada!",
          instruccion_corta: "¡Felicidades por terminar los 6 pasos CRECER de la Senda del Hijo!",
          cuerpo:
            "¡Excelente trabajo! Completaste los 6 pasos CRECER de la Senda del Hijo para Semillas. Sigue escuchando y viviendo las enseñanzas de Jesús cada día.",
        },
      },
    },
    exploradores: {
      detalle: {
        etiquetaEdad: "Exploradores",
        rangoEdad: "9 a 12 años",
        claveSenda: "hijo",
        nombreSenda: "Senda del Hijo",
        citaBiblica: "Mateo 13:23 TLA",
        versiculoClave:
          "«Las semillas que cayeron en buena tierra representan a los que escuchan el mensaje y lo entienden, y dan mucho fruto.» (Mateo 13:23 TLA)",
        resumenSenda:
          "En la Senda del Hijo para Exploradores (9 a 12 años), recorremos los 6 pasos CRECER descubriendo el significado espiritual de las parábolas de Jesús y el llamado al discipulado.",
        pilares: [
          {
            clave: "hijo",
            titulo: "1. ¿Por qué enseñaba Jesús con parábolas?",
            senda: "Senda del Hijo · Paso 1 CRECER",
            versiculo: "Mateo 13:34 TLA — «Jesús usó ejemplos para enseñar todo esto a la gente»",
            descripcion:
              "Las parábolas son espejos del corazón: usan escenas cotidianas de Galilea para revelar los secretos del Reino de los Cielos a quienes tienen hambre de aprender.",
            aplicacion: "Pídele a Jesús entendimiento cada vez que abras los Evangelios.",
          },
          {
            clave: "hijo",
            titulo: "2. El Sembrador y los cuatro terrenos",
            senda: "Senda del Hijo · Mateo 13:3-23 TLA",
            versiculo: "Lucas 8:15 TLA — «Escuchan el mensaje con un corazón bueno y sincero, y producen fruto»",
            descripcion:
              "La semilla es la Palabra de Dios y el terreno es nuestro corazón: Jesús nos invita a quitar las distracciones para dar fruto verdadero.",
            aplicacion: "Identifica qué distracciones te impiden escuchar a Jesús y apártalas esta semana.",
          },
          {
            clave: "hijo",
            titulo: "3. Misericordia y perdón sin fronteras",
            senda: "Senda del Hijo · Lucas 10 y Lucas 15 TLA",
            versiculo: "Lucas 10:27 TLA — «Ama a tu prójimo como a ti mismo»",
            descripcion:
              "En el Buen Samaritano y el Hijo Pródigo, Jesús rompe prejuicios y nos muestra un Reino basado en la compasión activa y el perdón restaurador.",
            aplicacion: "Sé un amigo que incluye, perdona y defiende a quien lo necesita.",
          },
        ],
      },
      pasos: {
        conectar: {
          titulo: "Secretos del Reino en las parábolas de Jesús (Exploradores · 9 a 12 años)",
          instruccion_corta:
            "Senda del Hijo · Exploradores (9-12 años) · Descubre cómo Jesús transformaba escenas de la vida diaria en lecciones eternas.",
          cuerpo:
            "¿Por qué el Hijo de Dios eligió enseñar con historias sobre sembradores, ovejas perdidas, perlas preciosas y viajeros en el camino? Porque Jesús quería que la verdad del Reino de Dios no solo se memorizara, sino que tocara nuestro corazón y transformara nuestras decisiones.\n\nEn esta Senda del Hijo exploramos tres grandes enseñanzas para tu edad:\n• La Parábola del Sembrador (Mateo 13 TLA): cómo preparar nuestra mente y corazón para que la Palabra dé fruto verdadero.\n• La Parábola del Buen Samaritano (Lucas 10 TLA): el amor al prójimo demostrado con hechos y no solo con palabras.\n• La Parábola del Hijo Pródigo (Lucas 15 TLA): la gracia de Jesús que busca, perdona y restaura.",
        },
        relatar: {
          titulo: "Historias que cambian vidas (Mateo 13:3-23 TLA y Lucas 10:25-37 TLA)",
          instruccion_corta: "Lee y escucha las parábolas del Sembrador y del Buen Samaritano.",
          cuerpo:
            "En Mateo 13:3-9 y 18-23 TLA, Jesús explica que la semilla de la Palabra cae en cuatro tipos de suelo: junto al camino, en pedregales, entre espinos y en buena tierra. Y en Lucas 10:25-37 TLA, ante la pregunta «¿Y quién es mi prójimo?», Jesús relata cómo un samaritano tuvo compasión de un herido al que otros ignoraron, concluyendo: «Ve, y haz tú lo mismo».",
        },
        ensenar: {
          titulo: "Oidores y hacedores de la enseñanza de Jesús (Mateo 13:23 TLA)",
          instruccion_corta: "Memoriza Mateo 13:23 TLA y Lucas 10:27 TLA en la Senda del Hijo.",
          cuerpo:
            "Entender una parábola de Jesús implica responder con nuestra vida. Jesús enseña que el verdadero discípulo es aquel que oye su Palabra, la comprende y la pone por obra con amor y valentía (Mateo 7:24 TLA).",
        },
        comprobar: {
          titulo: "Comprobemos nuestro aprendizaje en la Senda del Hijo",
          instruccion_corta: "Resuelve las actividades sobre las parábolas de Jesús para desbloquear el siguiente paso.",
          cuerpo: "Comprueba cuánto aprendiste sobre el significado de las parábolas en la Senda del Hijo.",
        },
        experimentar: {
          titulo: "Practicando las parábolas en nuestra vida diaria",
          instruccion_corta: "Responde la pregunta de reflexión para tu franja de Exploradores.",
          cuerpo:
            "Las parábolas de Jesús nos retan a actuar con compasión en el colegio, en casa y con nuestros amigos.",
          pregunta_reflexion:
            "¿Qué puedes hacer esta semana para que tu corazón sea «buena tierra» y para actuar como el Buen Samaritano con tus compañeros?",
        },
        recompensar: {
          titulo: "¡Excelente! Completaste la Senda del Hijo",
          instruccion_corta: "Has cumplido los 6 pasos CRECER de la Senda del Hijo.",
          cuerpo:
            "¡Gran trabajo, Explorador! Completaste la metodología CRECER en la Senda del Hijo. Sigue caminando cada día junto a Jesús, nuestro Maestro y Salvador.",
        },
      },
    },
    embajadores: {
      detalle: {
        etiquetaEdad: "Embajadores",
        rangoEdad: "13 a 17 años",
        claveSenda: "hijo",
        nombreSenda: "Senda del Hijo",
        citaBiblica: "Lucas 10:27-37 TLA",
        versiculoClave:
          "«Ama a tu Dios con todo lo que piensas, con todo lo que eres y con todo lo que vales, y ama a tu prójimo como a ti mismo. Ve y haz tú lo mismo.» (Lucas 10:27, 37 TLA)",
        resumenSenda:
          "En la Senda del Hijo para Embajadores (13 a 17 años), los 6 pasos CRECER analizan la ética contracultural del Reino de Dios en las parábolas de Jesucristo.",
        pilares: [
          {
            clave: "hijo",
            titulo: "1. Las parábolas como desafío contracultural del Reino",
            senda: "Senda del Hijo · Paso 1 CRECER",
            versiculo: "Mateo 13:11 TLA — «A ustedes Dios les permite conocer los secretos de su reino»",
            descripcion:
              "Jesús utilizaba parábolas para confrontar la religiosidad superficial y revelar un Reino donde los últimos son primeros y el liderazgo se mide por el servicio.",
            aplicacion: "Evalúa tus prioridades a la luz de los valores del Reino de Jesús.",
          },
          {
            clave: "hijo",
            titulo: "2. Gracia radical y reconciliación",
            senda: "Senda del Hijo · Lucas 15:11-32 TLA",
            versiculo: "Lucas 15:20 TLA — «Todavía estaba lejos cuando su padre lo vio y sintió compasión»",
            descripcion:
              "Tanto el hijo menor rebelde como el hijo mayor orgulloso necesitaban comprender la gracia: Jesús nos llama a abandonar el juicio y abrazar la restauración.",
            aplicacion: "Sé un puente de reconciliación y gracia entre tus amigos y tu comunidad.",
          },
          {
            clave: "hijo",
            titulo: "3. Mayordomía, carácter y frutos duraderos",
            senda: "Senda del Hijo · Mateo 13 y Mateo 25 TLA",
            versiculo: "Juan 15:14 TLA — «Ustedes son mis amigos, si hacen lo que yo les mando»",
            descripcion:
              "Las parábolas del Sembrador y de los Talentos nos llaman a una fe perseverante que no se ahoga en las presiones del mundo y pone sus dones al servicio de Cristo.",
            aplicacion: "Usa tus talentos y tu voz para representar a Cristo con integridad.",
          },
        ],
      },
      pasos: {
        conectar: {
          titulo: "La cosmovisión del Reino en las parábolas de Jesús (Embajadores · 13 a 17 años)",
          instruccion_corta:
            "Senda del Hijo · Embajadores (13-17 años) · Analiza cómo las parábolas de Jesús desafían nuestra forma de pensar, amar y servir.",
          cuerpo:
            "Las parábolas de Jesús no eran simples fábulas morales; eran relatos incisivos que invertían las categorías de poder, mérito y estatus de su época para revelar el corazón de Dios y la ética del Reino.\n\nEn este recorrido CRECER de la Senda del Hijo profundizamos en tres ejes para Embajadores:\n• Discernimiento espiritual (Mateo 13 TLA): por qué un corazón receptivo comprende la verdad mientras el orgullo la rechaza.\n• Compasión que rompe barreras (Lucas 10 TLA): el Buen Samaritano redefine al prójimo por encima de prejuicios sociales o culturales.\n• Gracia frente a legalismo (Lucas 15 TLA): el llamado de Jesús a vivir desde la redención y el servicio humilde.",
        },
        relatar: {
          titulo: "El Reino que confronta y transforma (Mateo 13:18-23 TLA y Lucas 10:30-37 TLA)",
          instruccion_corta: "Estudia y escucha el trasfondo bíblico de las parábolas centrales de Jesús.",
          cuerpo:
            "En los Evangelios, Jesús presenta el Reino como una semilla que vence obstáculos (Mateo 13:18-23 TLA), como una compasión costosa hacia el herido (Lucas 10:30-37 TLA) y como una fiesta de gracia para el que regresa arrepentido (Lucas 15:11-32 TLA). En todas ellas, Cristo mismo es el cumplimiento vivo de lo que enseña.",
        },
        ensenar: {
          titulo: "Cristo, el centro de las parábolas (Lucas 10:27 TLA)",
          instruccion_corta: "Memoriza Lucas 10:27 TLA: amar a Dios y al prójimo con hechos y verdad.",
          cuerpo:
            "Seguir la Senda del Hijo significa permitir que las palabras de Jesús confronten nuestra comodidad, moldeen nuestro carácter y nos conviertan en discípulos que aman con hechos y verdad (1 Juan 3:18 TLA).",
        },
        comprobar: {
          titulo: "Comprobación bíblica · Senda del Hijo",
          instruccion_corta: "Completa las actividades de comprobación de la Senda del Hijo.",
          cuerpo: "Pon a prueba tu comprensión sobre el mensaje teológico y práctico de las parábolas de Jesús.",
        },
        experimentar: {
          titulo: "Liderazgo y compasión al estilo de Jesús",
          instruccion_corta: "Reflexiona sobre cómo aplicar la enseñanza de Jesús en tu entorno.",
          cuerpo:
            "Como Embajador de Cristo, estás llamado a encarnar los valores del Reino en tu colegio, familia e iglesia.",
          pregunta_reflexion:
            "¿Qué prejuicio, distracción o comodidad te desafía Jesús a dejar atrás hoy a través de sus parábolas para servir mejor a tu prójimo?",
        },
        recompensar: {
          titulo: "¡Senda del Hijo cumplida con éxito!",
          instruccion_corta: "Completaste los 6 pasos CRECER de la Senda del Hijo.",
          cuerpo:
            "¡Excelente, Embajador! Has completado los 6 pasos CRECER de la Senda del Hijo. Que las enseñanzas y el ejemplo de Jesús guíen tu liderazgo y servicio.",
        },
      },
    },
  },
  espiritu: {
    semillas: {
      detalle: {
        etiquetaEdad: "Semillas",
        rangoEdad: "5 a 8 años",
        claveSenda: "espiritu",
        nombreSenda: "Senda del Espíritu Santo",
        citaBiblica: "Gálatas 5:22-23 TLA",
        versiculoClave:
          "«En cambio, el Espíritu de Dios nos hace amar a los demás, estar siempre alegres y vivir en paz con todos.» (Gálatas 5:22 TLA)",
        resumenSenda:
          "En la Senda del Espíritu Santo para Semillas (5 a 8 años), los niños descubren con los 6 pasos CRECER cómo el Espíritu Santo llena nuestro corazón de amor, alegría, paz y bondad.",
        pilares: [
          {
            clave: "espiritu",
            titulo: "1. El Espíritu Santo vive en nuestro corazón",
            senda: "Senda del Espíritu Santo · Paso 1 CRECER",
            versiculo: "Juan 14:26 TLA — «El Espíritu Santo les enseñará todas las cosas»",
            descripcion:
              "Aunque no lo vemos con los ojos, el Espíritu Santo es nuestro amigo y ayudador que está siempre con nosotros para guiarnos.",
            aplicacion: "Pídele hoy al Espíritu Santo que te acompañe en todo lo que hagas.",
          },
          {
            clave: "espiritu",
            titulo: "2. Semillas de amor, gozo y paz",
            senda: "Senda del Espíritu Santo · Gálatas 5:22 TLA",
            versiculo: "Gálatas 5:22 TLA — «El Espíritu de Dios nos hace amar, estar alegres y vivir en paz»",
            descripcion:
              "Como un árbol que da frutas dulces y ricas, el Espíritu Santo hace crecer en nosotros amor, alegría y mucha paz.",
            aplicacion: "Regala una sonrisa y comparte paz cuando alguien esté enojado o triste.",
          },
          {
            clave: "espiritu",
            titulo: "3. Paciencia, bondad y dominio propio",
            senda: "Senda del Espíritu Santo · Gálatas 5:22-23 TLA",
            versiculo: "Gálatas 5:22-23 TLA — «Nos hace ser pacientes y amables, y tratar bien a los demás»",
            descripcion:
              "El Espíritu Santo nos ayuda a esperar nuestro turno con paciencia, a ser amables y a portarnos bien.",
            aplicacion: "Practica la paciencia y la amabilidad al jugar con tus amigos.",
          },
        ],
      },
      pasos: {
        conectar: {
          titulo: "Un árbol lleno de frutos hermosos (Semillas · 5 a 8 años)",
          instruccion_corta:
            "Senda del Espíritu Santo · Semillas (5-8 años) · ¿Cuál es tu fruta favorita? Descubre los frutos dulces que el Espíritu Santo hace crecer en ti.",
          cuerpo:
            "Imagina un árbol grande y verde lleno de frutas deliciosas. En la Biblia aprendemos que cuando el Espíritu Santo vive en nuestro corazón, hace crecer frutos hermosos en nuestra vida para que compartamos alegría y cariño con todos.\n\nEn esta Senda del Espíritu Santo recorremos la metodología CRECER para conocer:\n• Quién es el Espíritu Santo: es el ayudador amoroso que Dios nos envió para acompañarnos siempre.\n• Cuáles son sus frutos (Gálatas 5:22-23 TLA): amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre y templanza.\n• Cómo mostrar esos frutos: siendo niños amables, alegres, pacientes y llenos de paz.",
        },
        relatar: {
          titulo: "Los nueve frutos del Espíritu (Gálatas 5:22-23 TLA)",
          instruccion_corta: "Escucha cuáles son los frutos que el Espíritu Santo siembra en nosotros (Gálatas 5:22-23 TLA).",
          cuerpo:
            "El apóstol Pablo escribió en Gálatas 5:22-23 TLA que el Espíritu de Dios nos hace amar a los demás, estar siempre alegres, vivir en paz con todos, ser pacientes y amables, tratar bien a los demás, tener confianza en Dios, ser humildes y saber dominar nuestros malos deseos.",
        },
        ensenar: {
          titulo: "El Espíritu Santo nos ayuda a ser como Jesús (Gálatas 5:22 TLA)",
          instruccion_corta: "Versículo clave para memorizar: «El fruto del Espíritu es amor, gozo y paz» (Gálatas 5:22 TLA).",
          cuerpo:
            "No tenemos que esforzarnos solos: cuando le pedimos ayuda al Espíritu Santo en oración, Él nos da paciencia, valentía y bondad para cada día.",
        },
        comprobar: {
          titulo: "Comprobemos lo aprendido en la Senda del Espíritu Santo",
          instruccion_corta: "Completa las actividades sobre los frutos del Espíritu para avanzar.",
          cuerpo: "Demuestra cuánto aprendiste sobre los frutos del Espíritu Santo.",
        },
        experimentar: {
          titulo: "Compartiendo los frutos del Espíritu en casa",
          instruccion_corta: "Elige qué fruto del Espíritu vas a practicar hoy.",
          cuerpo:
            "Nuestras palabras y acciones son la forma en que los demás pueden ver el amor, la alegría y la paz del Espíritu Santo en nosotros.",
          pregunta_reflexion:
            "¿Cuál de los frutos del Espíritu Santo (amor, alegría, paz, paciencia o bondad) quieres compartir hoy con tu familia?",
        },
        recompensar: {
          titulo: "¡Senda del Espíritu Santo completada!",
          instruccion_corta: "¡Felicidades por completar los 6 pasos CRECER de la Senda del Espíritu Santo!",
          cuerpo:
            "¡Maravilloso trabajo! Completaste la metodología CRECER de la Senda del Espíritu Santo para Semillas. Sigue dando frutos de amor, alegría y paz todos los días.",
        },
      },
    },
    exploradores: {
      detalle: {
        etiquetaEdad: "Exploradores",
        rangoEdad: "9 a 12 años",
        claveSenda: "espiritu",
        nombreSenda: "Senda del Espíritu Santo",
        citaBiblica: "Gálatas 5:22-23 TLA",
        versiculoClave:
          "«El Espíritu de Dios nos hace amar a los demás, estar siempre alegres y vivir en paz con todos; nos hace ser pacientes y amables, y saber dominar nuestros malos deseos.» (Gálatas 5:22-23 TLA)",
        resumenSenda:
          "En la Senda del Espíritu Santo para Exploradores (9 a 12 años), la metodología CRECER nos enseña a cultivar los 9 frutos del Espíritu en nuestro carácter y relaciones diarias.",
        pilares: [
          {
            clave: "espiritu",
            titulo: "1. Guiados por el Espíritu Santo",
            senda: "Senda del Espíritu Santo · Paso 1 CRECER",
            versiculo: "Gálatas 5:25 TLA — «El Espíritu nos ha dado una vida nueva; por tanto, sigamos sus enseñanzas»",
            descripcion:
              "El Espíritu Santo no es una fuerza lejana: es Dios mismo habitando en nosotros, aconsejándonos con la verdad bíblica y fortaleciendo nuestra fe.",
            aplicacion: "Escucha la voz del Espíritu Santo antes de reaccionar con enojo o impaciencia.",
          },
          {
            clave: "espiritu",
            titulo: "2. Frutos hacia Dios y hacia los demás",
            senda: "Senda del Espíritu Santo · Gálatas 5:22 TLA",
            versiculo: "Gálatas 5:22 TLA — «Amor, gozo, paz, paciencia, benignidad, bondad...»",
            descripcion:
              "El amor, el gozo y la paz transforman nuestro interior; la paciencia, la benignidad y la bondad transforman cómo tratamos a nuestros compañeros y familia.",
            aplicacion: "Sé un pacificador en tu escuela o club demostrando amabilidad y bondad.",
          },
          {
            clave: "espiritu",
            titulo: "3. Fidelidad, mansedumbre y dominio propio",
            senda: "Senda del Espíritu Santo · Gálatas 5:23 TLA",
            versiculo: "Gálatas 5:23 TLA — «...fe, mansedumbre, templanza; contra tales cosas no hay ley»",
            descripcion:
              "La templanza (dominio propio) y la mansedumbre nos dan la fuerza para controlar nuestras palabras, cumplir nuestras promesas y elegir lo correcto.",
            aplicacion: "Ejercita el dominio propio en lo que dices, ves y haces durante esta semana.",
          },
        ],
      },
      pasos: {
        conectar: {
          titulo: "¿Cómo transforma el Espíritu Santo nuestro carácter? (Exploradores · 9 a 12 años)",
          instruccion_corta:
            "Senda del Espíritu Santo · Exploradores (9-12 años) · Descubre cómo los 9 frutos del Espíritu crecen cuando caminamos con Dios.",
          cuerpo:
            "Un árbol se conoce por su fruto. De la misma manera, cuando caminamos junto al Espíritu Santo, nuestra vida empieza a reflejar un carácter distinto: lleno de paz en medio de los problemas, paciente con los demás y firme para hacer el bien.\n\nEn esta Senda del Espíritu Santo exploramos tres dimensiones clave de Gálatas 5:22-23 TLA:\n• Frutos en nuestro corazón: amor, gozo y paz que nacen de nuestra comunión con Dios.\n• Frutos hacia nuestro prójimo: paciencia, benignidad (amabilidad) y bondad en nuestras relaciones diarias.\n• Frutos de carácter firme: fe (fidelidad), mansedumbre y templanza (dominio propio) para tomar buenas decisiones.",
        },
        relatar: {
          titulo: "El fruto del Espíritu en Gálatas 5:22-25 TLA",
          instruccion_corta: "Lee y escucha Gálatas 5:22-25 TLA: un solo fruto con nueve cualidades.",
          cuerpo:
            "En su carta a los Gálatas (Gálatas 5:22-25 TLA), Pablo explica que el fruto del Espíritu es uno solo pero se manifiesta en nueve virtudes inseparables: amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre y templanza. No se fabrican por orgullo humano, sino permaneciendo unidos a Dios cada día.",
        },
        ensenar: {
          titulo: "Andar en el Espíritu cada día (Gálatas 5:22-23 TLA)",
          instruccion_corta: "Memoriza los 9 frutos del Espíritu en Gálatas 5:22-23 TLA.",
          cuerpo:
            "Andar en el Espíritu (Gálatas 5:25 TLA) significa dejar que Él dirija nuestros pensamientos, actitudes y reacciones. Donde antes había impaciencia o enojo, el Espíritu Santo produce paz y dominio propio.",
        },
        comprobar: {
          titulo: "Comprobemos nuestro recorrido en la Senda del Espíritu Santo",
          instruccion_corta: "Resuelve las actividades de comprobación sobre los frutos del Espíritu.",
          cuerpo: "Pon a prueba tu memoria y comprensión bíblica sobre la obra y los frutos del Espíritu Santo.",
        },
        experimentar: {
          titulo: "Cultivando los frutos del Espíritu esta semana",
          instruccion_corta: "Reflexiona y escribe tu reto práctico de la semana.",
          cuerpo:
            "Cada situación difícil de la semana es una oportunidad para que el Espíritu Santo muestre su fruto a través de ti.",
          pregunta_reflexion:
            "¿Cuál de los nueve frutos del Espíritu (como paciencia, paz o dominio propio) necesitas pedirle más a Dios esta semana y cómo lo pondrás en práctica?",
        },
        recompensar: {
          titulo: "¡Excelente! Completaste la Senda del Espíritu Santo",
          instruccion_corta: "Has cumplido los 6 pasos CRECER de la Senda del Espíritu Santo.",
          cuerpo:
            "¡Felicidades, Explorador! Completaste los 6 pasos CRECER de la Senda del Espíritu Santo. Sigue caminando guiado por el Espíritu cada día.",
        },
      },
    },
    embajadores: {
      detalle: {
        etiquetaEdad: "Embajadores",
        rangoEdad: "13 a 17 años",
        claveSenda: "espiritu",
        nombreSenda: "Senda del Espíritu Santo",
        citaBiblica: "Gálatas 5:22-25 TLA",
        versiculoClave:
          "«Dios no nos dio un espíritu de timidez, sino un espíritu de poder, de amor y de dominio propio.» (2 Timoteo 1:7 TLA · Gálatas 5:22-23 TLA)",
        resumenSenda:
          "En la Senda del Espíritu Santo para Embajadores (13 a 17 años), la metodología CRECER profundiza en la vida en el Espíritu, la transformación del carácter y el dominio propio.",
        pilares: [
          {
            clave: "espiritu",
            titulo: "1. Vida en el Espíritu vs. impulsos egoístas",
            senda: "Senda del Espíritu Santo · Paso 1 CRECER",
            versiculo: "Gálatas 5:16 TLA — «Dejen que el Espíritu de Dios dirija sus vidas»",
            descripcion:
              "La verdadera libertad cristiana no consiste en dejarnos llevar por cada impulso, sino en ser gobernados por el Espíritu Santo para amar y servir con propósito.",
            aplicacion: "Toma decisiones diarias guiadas por convicciones eternas y no por impulsos del momento.",
          },
          {
            clave: "espiritu",
            titulo: "2. La unidad orgánica del fruto del Espíritu",
            senda: "Senda del Espíritu Santo · Gálatas 5:22-23 TLA",
            versiculo: "Gálatas 5:22-23 TLA — «Amor, gozo, paz, paciencia, benignidad, bondad, fe, mansedumbre, templanza»",
            descripcion:
              "Pablo usa el singular «el fruto» porque todas estas virtudes crecen juntas como expresión del carácter de Cristo formado en nosotros por el Espíritu.",
            aplicacion: "Evalúa con honestidad qué áreas de tu carácter necesitan madurar bajo la guía del Espíritu.",
          },
          {
            clave: "espiritu",
            titulo: "3. Poder, amor y dominio propio para la misión",
            senda: "Senda del Espíritu Santo · 2 Timoteo 1:7 TLA",
            versiculo: "2 Timoteo 1:7 TLA — «Espíritu de poder, de amor y de dominio propio»",
            descripcion:
              "El Espíritu Santo nos capacita para mantener la integridad bajo presión, responder con mansedumbre ante el conflicto y liderar con valentía.",
            aplicacion: "Sé un ejemplo de templanza, paz e integridad en tus estudios, redes y amistades.",
          },
        ],
      },
      pasos: {
        conectar: {
          titulo: "Carácter transformado por el Espíritu Santo (Embajadores · 13 a 17 años)",
          instruccion_corta:
            "Senda del Espíritu Santo · Embajadores (13-17 años) · Reflexiona sobre cómo el Espíritu Santo forma el carácter de Cristo en nuestra vida.",
          cuerpo:
            "En una cultura que exalta la reacción impulsiva y la búsqueda de validación inmediata, Gálatas 5 nos presenta una revolución interior: la obra del Espíritu Santo que transforma nuestra mente, nuestras emociones y nuestra voluntad desde la raíz.\n\nEn este recorrido CRECER de la Senda del Espíritu Santo profundizamos en tres pilares para Embajadores:\n• Libertad con propósito (Gálatas 5:13-16 TLA): vivir guiados por el Espíritu nos libera del egoísmo para servir por amor.\n• Madurez integral (Gálatas 5:22-23 TLA): amor, gozo, paz, paciencia, benignidad, bondad, fidelidad, mansedumbre y dominio propio como sello de madurez espiritual.\n• Valentía y templanza (2 Timoteo 1:7 TLA): el Espíritu nos da firmeza interior para influir positivamente en nuestra generación.",
        },
        relatar: {
          titulo: "Andar por el Espíritu (Gálatas 5:16-25 TLA)",
          instruccion_corta: "Analiza y escucha Gálatas 5:16-25 TLA dentro de la Senda del Espíritu Santo.",
          cuerpo:
            "Pablo contrasta las obras del egoísmo humano (enemistades, pleitos, celos, iras, divisiones) con el fruto del Espíritu Santo (Gálatas 5:19-23 TLA). La transformación no ocurre por simple fuerza de voluntad, sino por permanecer en comunión constante con el Espíritu y dejar que Él guíe cada paso (Gálatas 5:25 TLA).",
        },
        ensenar: {
          titulo: "Santificación y dominio propio (Gálatas 5:22-23 TLA y 2 Timoteo 1:7 TLA)",
          instruccion_corta: "Memoriza Gálatas 5:22-23 TLA y 2 Timoteo 1:7 TLA.",
          cuerpo:
            "La mansedumbre no es debilidad, sino fuerza bajo control; y la templanza (dominio propio) es la capacidad dada por el Espíritu para gobernar nuestros pensamientos, palabras y hábitos para la gloria de Dios.",
        },
        comprobar: {
          titulo: "Comprobación bíblica · Senda del Espíritu Santo",
          instruccion_corta: "Completa los retos de comprobación de la Senda del Espíritu Santo.",
          cuerpo: "Verifica tu comprensión bíblica y práctica sobre los frutos y la guía del Espíritu Santo.",
        },
        experimentar: {
          titulo: "Evidenciando el fruto del Espíritu en tu entorno",
          instruccion_corta: "Escribe tu reflexión personal para cerrar el paso de aplicación.",
          cuerpo:
            "Un Embajador de Cristo demuestra madurez espiritual cuando sus reacciones en momentos de tensión reflejan el fruto del Espíritu Santo.",
          pregunta_reflexion:
            "¿En qué área concreta de tu vida diaria (familia, estudios, redes sociales o amistades) necesitas que el Espíritu Santo fortalezca hoy tu paz, mansedumbre o dominio propio?",
        },
        recompensar: {
          titulo: "¡Senda del Espíritu Santo cumplida con éxito!",
          instruccion_corta: "Completaste los 6 pasos CRECER de la Senda del Espíritu Santo.",
          cuerpo:
            "¡Excelente trabajo, Embajador! Has completado los 6 pasos CRECER de la Senda del Espíritu Santo. Que tu vida refleje siempre el amor, la paz y el dominio propio del Espíritu.",
        },
      },
    },
  },
};

export function construirActividadesFallback(
  temaId: string,
  pasoId: string,
  grupoEdadId: string,
  senda: ClaveSenda,
  edad: CodigoEdad,
): Actividad[] {
  const ahora = new Date().toISOString();
  const dificultad = edad === "semillas" ? "facil" : edad === "exploradores" ? "normal" : "dificil";

  if (senda === "padre") {
    const porEdad = {
      semillas: {
        pregunta: "¿Qué nos enseña la Senda del Padre sobre el amor de Dios?",
        retro: "¡Muy bien! Dios Padre nos creó, nos cuida siempre y nos dio a su Hijo Jesús por amor.",
        opciones: [
          { etiqueta: "A", texto: "Que Dios Padre nos creó y nos ama siempre", correcta: true, retro: "¡Correcto! Eres un hijo muy amado de Dios Padre." },
          { etiqueta: "B", texto: "Que Dios solo nos quiere cuando no nos equivocamos", correcta: false, retro: "El amor de Dios Padre nunca se acaba y siempre nos cuida." },
          { etiqueta: "C", texto: "Que Dios está lejos y no nos escucha", correcta: false, retro: "Dios Padre está siempre cerca y escucha nuestras oraciones." },
        ],
        versiculoHuecos: "Porque Dios [amó] tanto al [mundo] que dio a su Hijo único (Juan 3:16 TLA)",
        distractores: ["olvidó", "templo"],
      },
      exploradores: {
        pregunta: "Según 1 Juan 4:8-10 TLA en la Senda del Padre, ¿cómo es el amor de Dios Padre?",
        retro: "«Dios es amor» y Él nos amó primero de manera incondicional.",
        opciones: [
          { etiqueta: "A", texto: "Incondicional: Dios es amor y nos amó primero", correcta: true, retro: "¡Exacto! El amor es la esencia de Dios Padre." },
          { etiqueta: "B", texto: "Un premio que ganamos solo por nuestras obras", correcta: false, retro: "Su amor no se compra; es un regalo de su gracia paternal." },
          { etiqueta: "C", texto: "Un sentimiento pasajero que cambia cada día", correcta: false, retro: "El amor del Padre es eterno y fiel." },
        ],
        versiculoHuecos: "En esto consiste el [amor]: no en que nosotros hayamos amado a Dios, sino en que él nos [amó] primero (1 Juan 4:10 TLA)",
        distractores: ["orgullo", "juzgó"],
      },
      embajadores: {
        pregunta: "Según Romanos 8:38-39 TLA y 1 Juan 3:1 TLA en la Senda del Padre, ¿qué afirma la Escritura?",
        retro: "Somos llamados hijos de Dios y absolutamente nada creado puede separarnos de su amor.",
        opciones: [
          { etiqueta: "A", texto: "Que somos adoptados como hijos suyos y nada nos separa de su amor", correcta: true, retro: "¡Correcto! Nuestra identidad descansa en el amor eterno del Padre." },
          { etiqueta: "B", texto: "Que las pruebas pueden anular las promesas del Padre", correcta: false, retro: "Romanos 8:38-39 asegura que ninguna tribulación nos separa de su amor." },
          { etiqueta: "C", texto: "Que nuestro valor depende de la aprobación del mundo", correcta: false, retro: "1 Juan 3:1 enseña que nuestra identidad proviene del amor del Padre." },
        ],
        versiculoHuecos: "Ninguna cosa creada podrá [separarnos] del [amor] de Dios en Cristo Jesús (Romanos 8:39 TLA)",
        distractores: ["alejarnos", "poder"],
      },
    }[edad];

    return [
      {
        id: `fallback-quiz-padre-${edad}`,
        tema_id: temaId,
        paso_id: pasoId,
        grupo_edad_id: grupoEdadId,
        tipo_actividad_id: "cuestionario",
        titulo: "Quiz · Senda del Padre",
        consigna: porEdad.pregunta,
        orden: 1,
        xp_recompensa: 15,
        dificultad,
        limite_tiempo_seg: null,
        obligatorio: true,
        retroalimentacion: porEdad.retro,
        configuracion: { kind: "single_choice" },
        creado_en: ahora,
        actualizado_en: ahora,
        tipo_actividad: {
          id: "cuestionario",
          codigo: "cuestionario",
          nombre: "Quiz",
          descripcion: "Preguntas de opción múltiple.",
          es_juego: true,
          activo: true,
          creado_en: ahora,
        },
        opciones: porEdad.opciones.map((op, idx) => ({
          id: `fallback-op-padre-${edad}-${idx + 1}`,
          actividad_id: `fallback-quiz-padre-${edad}`,
          etiqueta: op.etiqueta,
          texto: op.texto,
          orden: idx + 1,
          correcta: op.correcta,
          retroalimentacion: op.retro,
        })),
      },
      {
        id: `fallback-flash-padre-${edad}`,
        tema_id: temaId,
        paso_id: pasoId,
        grupo_edad_id: grupoEdadId,
        tipo_actividad_id: "tarjetas_memoria",
        titulo: "Flashcards · Promesas de Dios Padre",
        consigna: "Encuentra los pares sobre el amor y el cuidado de Dios Padre.",
        orden: 2,
        xp_recompensa: 15,
        dificultad,
        limite_tiempo_seg: null,
        obligatorio: true,
        retroalimentacion: "¡Excelente memoria! Dios Padre siempre cumple sus promesas.",
        configuracion: {
          pares: [
            { id: 1, izquierda: "Dios Padre", derecha: "Nuestro Creador amoroso (Génesis 1:1 TLA)" },
            { id: 2, izquierda: "1 Juan 4:8 TLA", derecha: "Dios es amor" },
            { id: 3, izquierda: "Juan 3:16 TLA", derecha: "Entregó a su Hijo por amor al mundo" },
            { id: 4, izquierda: "Romanos 8:39 TLA", derecha: "Nada nos separa del amor de Dios" },
          ],
        },
        creado_en: ahora,
        actualizado_en: ahora,
        tipo_actividad: {
          id: "tarjetas_memoria",
          codigo: "tarjetas_memoria",
          nombre: "Flashcards",
          descripcion: "Tarjetas de memorización.",
          es_juego: true,
          activo: true,
          creado_en: ahora,
        },
        opciones: [],
      },
      {
        id: `fallback-vers-padre-${edad}`,
        tema_id: temaId,
        paso_id: pasoId,
        grupo_edad_id: grupoEdadId,
        tipo_actividad_id: "completar_versiculo",
        titulo: "Completar el versículo · Senda del Padre",
        consigna: "Selecciona las palabras correctas para completar el versículo clave.",
        orden: 3,
        xp_recompensa: 15,
        dificultad,
        limite_tiempo_seg: null,
        obligatorio: true,
        retroalimentacion: "¡Muy bien! Guardaste el versículo clave de la Senda del Padre en tu corazón.",
        configuracion: {
          versiculo_con_huecos: porEdad.versiculoHuecos,
          distractores: porEdad.distractores,
        },
        creado_en: ahora,
        actualizado_en: ahora,
        tipo_actividad: {
          id: "completar_versiculo",
          codigo: "completar_versiculo",
          nombre: "Completar versículo",
          descripcion: "Completar palabras faltantes.",
          es_juego: true,
          activo: true,
          creado_en: ahora,
        },
        opciones: [],
      },
    ];
  }

  if (senda === "hijo") {
    const porEdad = {
      semillas: {
        pregunta: "¿Qué nos enseñó Jesús en la parábola del Buen Samaritano (Lucas 10 TLA)?",
        retro: "¡Muy bien! Jesús nos enseñó a ayudar con amor y compasión a quien lo necesita.",
        opciones: [
          { etiqueta: "A", texto: "A ayudar y cuidar con amor a nuestro prójimo", correcta: true, retro: "¡Correcto! Así seguimos el ejemplo de Jesús." },
          { etiqueta: "B", texto: "A pasar de largo sin ayudar a nadie", correcta: false, retro: "Jesús nos enseña a ser compasivos como el Buen Samaritano." },
          { etiqueta: "C", texto: "A ayudar solamente a quienes nos dan regalos", correcta: false, retro: "Jesús nos invita a amar a todos sin interés." },
        ],
        versiculoHuecos: "Ama a tu [Dios] con todo lo que eres y ama a tu [prójimo] como a ti mismo (Lucas 10:27 TLA)",
        distractores: ["enemigo", "tesoro"],
      },
      exploradores: {
        pregunta: "En la parábola del Sembrador (Mateo 13:23 TLA), ¿qué representa la «buena tierra»?",
        retro: "¡Exacto! Representa a quienes escuchan la Palabra de Dios, la entienden y dan fruto.",
        opciones: [
          { etiqueta: "A", texto: "El corazón que escucha la Palabra de Dios, la comprende y da fruto", correcta: true, retro: "¡Muy bien! Ese es el corazón de un verdadero discípulo de Jesús." },
          { etiqueta: "B", texto: "Las personas que olvidan enseguida lo que aprendieron", correcta: false, retro: "Eso representa la semilla que cayó junto al camino." },
          { etiqueta: "C", texto: "Las preocupaciones que ahogan la enseñanza", correcta: false, retro: "Eso representa la semilla que cayó entre espinos." },
        ],
        versiculoHuecos: "Las semillas en buena [tierra] son los que escuchan el [mensaje], lo entienden y dan fruto (Mateo 13:23 TLA)",
        distractores: ["piedra", "camino"],
      },
      embajadores: {
        pregunta: "¿Cuál es el mensaje central de Jesús al enseñar mediante las parábolas del Reino (Mateo 13, Lucas 10 y 15 TLA)?",
        retro: "Las parábolas revelan la gracia redentora de Dios y nos llaman a una fe que se demuestra en compasión, perdón y fruto.",
        opciones: [
          { etiqueta: "A", texto: "Transformar el corazón para vivir la gracia, la misericordia y la obediencia del Reino", correcta: true, retro: "¡Correcto! Las parábolas confrontan la indiferencia y nos llaman a vivir como Cristo." },
          { etiqueta: "B", texto: "Cumplir apariencias externas sin amar al prójimo", correcta: false, retro: "Jesús confrontó precisamente la religiosidad sin compasión." },
          { etiqueta: "C", texto: "Guardar los talentos por miedo sin servir a nadie", correcta: false, retro: "Jesús nos llama a multiplicar nuestros dones al servicio del Reino." },
        ],
        versiculoHuecos: "Ama a tu [prójimo] como a ti mismo; ve y haz tú lo [mismo] con misericordia (Lucas 10:27, 37 TLA)",
        distractores: ["orgullo", "contrario"],
      },
    }[edad];

    return [
      {
        id: `fallback-quiz-hijo-${edad}`,
        tema_id: temaId,
        paso_id: pasoId,
        grupo_edad_id: grupoEdadId,
        tipo_actividad_id: "cuestionario",
        titulo: "Quiz · Senda del Hijo",
        consigna: porEdad.pregunta,
        orden: 1,
        xp_recompensa: 15,
        dificultad,
        limite_tiempo_seg: null,
        obligatorio: true,
        retroalimentacion: porEdad.retro,
        configuracion: { kind: "single_choice" },
        creado_en: ahora,
        actualizado_en: ahora,
        tipo_actividad: {
          id: "cuestionario",
          codigo: "cuestionario",
          nombre: "Quiz",
          descripcion: "Preguntas de opción múltiple.",
          es_juego: true,
          activo: true,
          creado_en: ahora,
        },
        opciones: porEdad.opciones.map((op, idx) => ({
          id: `fallback-op-hijo-${edad}-${idx + 1}`,
          actividad_id: `fallback-quiz-hijo-${edad}`,
          etiqueta: op.etiqueta,
          texto: op.texto,
          orden: idx + 1,
          correcta: op.correcta,
          retroalimentacion: op.retro,
        })),
      },
      {
        id: `fallback-flash-hijo-${edad}`,
        tema_id: temaId,
        paso_id: pasoId,
        grupo_edad_id: grupoEdadId,
        tipo_actividad_id: "tarjetas_memoria",
        titulo: "Flashcards · Parábolas de Jesús",
        consigna: "Une cada parábola de Jesús con su enseñanza principal.",
        orden: 2,
        xp_recompensa: 15,
        dificultad,
        limite_tiempo_seg: null,
        obligatorio: true,
        retroalimentacion: "¡Muy bien! Recordaste las enseñanzas de Jesús en sus parábolas.",
        configuracion: {
          pares: [
            { id: 1, izquierda: "El Sembrador (Mateo 13 TLA)", derecha: "Recibir la Palabra en buena tierra" },
            { id: 2, izquierda: "El Buen Samaritano (Lucas 10 TLA)", derecha: "Amar y ayudar al prójimo con compasión" },
            { id: 3, izquierda: "El Hijo Pródigo (Lucas 15 TLA)", derecha: "El perdón y abrazo restaurador de Dios" },
            { id: 4, izquierda: "La Oveja Perdida (Lucas 15 TLA)", derecha: "Jesús nos busca y se alegra al salvarnos" },
          ],
        },
        creado_en: ahora,
        actualizado_en: ahora,
        tipo_actividad: {
          id: "tarjetas_memoria",
          codigo: "tarjetas_memoria",
          nombre: "Flashcards",
          descripcion: "Tarjetas de memorización.",
          es_juego: true,
          activo: true,
          creado_en: ahora,
        },
        opciones: [],
      },
      {
        id: `fallback-vers-hijo-${edad}`,
        tema_id: temaId,
        paso_id: pasoId,
        grupo_edad_id: grupoEdadId,
        tipo_actividad_id: "completar_versiculo",
        titulo: "Completar el versículo · Senda del Hijo",
        consigna: "Completa las palabras del versículo clave enseñado por Jesús.",
        orden: 3,
        xp_recompensa: 15,
        dificultad,
        limite_tiempo_seg: null,
        obligatorio: true,
        retroalimentacion: "¡Excelente! Guardaste la enseñanza de Jesús en tu corazón.",
        configuracion: {
          versiculo_con_huecos: porEdad.versiculoHuecos,
          distractores: porEdad.distractores,
        },
        creado_en: ahora,
        actualizado_en: ahora,
        tipo_actividad: {
          id: "completar_versiculo",
          codigo: "completar_versiculo",
          nombre: "Completar versículo",
          descripcion: "Completar palabras faltantes.",
          es_juego: true,
          activo: true,
          creado_en: ahora,
        },
        opciones: [],
      },
    ];
  }

  // Senda del Espíritu Santo
  const porEdad = {
    semillas: {
      pregunta: "Según Gálatas 5:22 TLA, ¿cuáles son frutos que el Espíritu Santo produce en nuestro corazón?",
      retro: "¡Excelente! El Espíritu Santo llena nuestro corazón de amor, gozo, paz, paciencia y bondad.",
      opciones: [
        { etiqueta: "A", texto: "Amor, gozo, paz, paciencia y bondad", correcta: true, retro: "¡Muy bien! Esos son los frutos hermosos del Espíritu Santo." },
        { etiqueta: "B", texto: "Enojo, peleas y egoísmo", correcta: false, retro: "Esas no son actitudes del Espíritu Santo." },
        { etiqueta: "C", texto: "Miedo y tristeza todo el tiempo", correcta: false, retro: "El Espíritu Santo nos da paz y alegría." },
      ],
      versiculoHuecos: "El Espíritu de Dios nos hace [amar] a los demás, estar alegres y vivir en [paz] (Gálatas 5:22 TLA)",
      distractores: ["pelear", "enojo"],
    },
    exploradores: {
      pregunta: "Según Gálatas 5:22-23 TLA, ¿cuántas cualidades forman el fruto del Espíritu Santo y cuál nos ayuda a gobernarnos a nosotros mismos?",
      retro: "Son 9 cualidades en Gálatas 5:22-23 TLA, y la templanza (dominio propio) nos ayuda a controlar nuestras reacciones.",
      opciones: [
        { etiqueta: "A", texto: "9 cualidades, incluyendo la mansedumbre y la templanza (dominio propio)", correcta: true, retro: "¡Exacto! El Espíritu Santo forma esas 9 virtudes en nosotros." },
        { etiqueta: "B", texto: "Solo 2 cualidades que dependen de nuestra fuerza", correcta: false, retro: "En Gálatas 5:22-23 se mencionan 9 virtudes producidas por el Espíritu." },
        { etiqueta: "C", texto: "Ninguna que tenga que ver con la paciencia", correcta: false, retro: "La paciencia es uno de los frutos centrales del Espíritu." },
      ],
      versiculoHuecos: "El fruto del [Espíritu] es amor, gozo, [paz], paciencia, benignidad y bondad (Gálatas 5:22 TLA)",
      distractores: ["mundo", "orgullo"],
    },
    embajadores: {
      pregunta: "Según Gálatas 5:16-25 TLA y 2 Timoteo 1:7 TLA, ¿qué significa «andar en el Espíritu»?",
      retro: "Significa vivir bajo la dirección diaria del Espíritu Santo, manifestando amor, poder y dominio propio frente al egoísmo.",
      opciones: [
        { etiqueta: "A", texto: "Permitir que el Espíritu gobierne nuestro carácter, decisiones y relaciones con amor y dominio propio", correcta: true, retro: "¡Correcto! Quienes viven por el Espíritu también andan guiados por Él." },
        { etiqueta: "B", texto: "Dejarse llevar por cada impulso de ira o rivalidad", correcta: false, retro: "Pablo enseña que el Espíritu vence precisamente esos impulsos." },
        { etiqueta: "C", texto: "Vivir con espíritu de cobardía ante las presiones del entorno", correcta: false, retro: "2 Timoteo 1:7 afirma que Dios nos dio espíritu de poder, amor y dominio propio." },
      ],
      versiculoHuecos: "Dios no nos dio espíritu de timidez, sino de [poder], de amor y de [dominio] propio (2 Timoteo 1:7 TLA)",
      distractores: ["temor", "orgullo"],
    },
  }[edad];

  return [
    {
      id: `fallback-quiz-espiritu-${edad}`,
      tema_id: temaId,
      paso_id: pasoId,
      grupo_edad_id: grupoEdadId,
      tipo_actividad_id: "cuestionario",
      titulo: "Quiz · Senda del Espíritu Santo",
      consigna: porEdad.pregunta,
      orden: 1,
      xp_recompensa: 15,
      dificultad,
      limite_tiempo_seg: null,
      obligatorio: true,
      retroalimentacion: porEdad.retro,
      configuracion: { kind: "single_choice" },
      creado_en: ahora,
      actualizado_en: ahora,
      tipo_actividad: {
        id: "cuestionario",
        codigo: "cuestionario",
        nombre: "Quiz",
        descripcion: "Preguntas de opción múltiple.",
        es_juego: true,
        activo: true,
        creado_en: ahora,
      },
      opciones: porEdad.opciones.map((op, idx) => ({
        id: `fallback-op-espiritu-${edad}-${idx + 1}`,
        actividad_id: `fallback-quiz-espiritu-${edad}`,
        etiqueta: op.etiqueta,
        texto: op.texto,
        orden: idx + 1,
        correcta: op.correcta,
        retroalimentacion: op.retro,
      })),
    },
    {
      id: `fallback-flash-espiritu-${edad}`,
      tema_id: temaId,
      paso_id: pasoId,
      grupo_edad_id: grupoEdadId,
      tipo_actividad_id: "tarjetas_memoria",
      titulo: "Flashcards · Los 9 Frutos del Espíritu",
      consigna: "Une cada grupo de frutos del Espíritu con su significado en nuestra vida.",
      orden: 2,
      xp_recompensa: 15,
      dificultad,
      limite_tiempo_seg: null,
      obligatorio: true,
      retroalimentacion: "¡Excelente! Conoces muy bien los frutos del Espíritu Santo.",
      configuracion: {
        pares: [
          { id: 1, izquierda: "Amor y Gozo", derecha: "Afecto sincero y alegría del Espíritu (Gálatas 5:22 TLA)" },
          { id: 2, izquierda: "Paz y Paciencia", derecha: "Calma interior y saber esperar con amor" },
          { id: 3, izquierda: "Benignidad y Bondad", derecha: "Amabilidad y generosidad hacia el prójimo" },
          { id: 4, izquierda: "Mansedumbre y Templanza", derecha: "Humildad y dominio propio cada día" },
        ],
      },
      creado_en: ahora,
      actualizado_en: ahora,
      tipo_actividad: {
        id: "tarjetas_memoria",
        codigo: "tarjetas_memoria",
        nombre: "Flashcards",
        descripcion: "Tarjetas de memorización.",
        es_juego: true,
        activo: true,
        creado_en: ahora,
      },
      opciones: [],
    },
    {
      id: `fallback-vers-espiritu-${edad}`,
      tema_id: temaId,
      paso_id: pasoId,
      grupo_edad_id: grupoEdadId,
      tipo_actividad_id: "completar_versiculo",
      titulo: "Completar el versículo · Senda del Espíritu Santo",
      consigna: "Completa las palabras del versículo clave de la Senda del Espíritu Santo.",
      orden: 3,
      xp_recompensa: 15,
      dificultad,
      limite_tiempo_seg: null,
      obligatorio: true,
      retroalimentacion: "¡Muy bien! Memorizaste la Palabra sobre el Espíritu Santo.",
      configuracion: {
        versiculo_con_huecos: porEdad.versiculoHuecos,
        distractores: porEdad.distractores,
      },
      creado_en: ahora,
      actualizado_en: ahora,
      tipo_actividad: {
        id: "completar_versiculo",
        codigo: "completar_versiculo",
        nombre: "Completar versículo",
        descripcion: "Completar palabras faltantes.",
        es_juego: true,
        activo: true,
        creado_en: ahora,
      },
      opciones: [],
    },
  ];
}

export function resolverCodigoGrupoEdad(
  grupoEdadId?: string | null,
  gruposEdad?: Array<{ id: string; codigo: string; nombre: string }>,
): CodigoEdad {
  if (!grupoEdadId) return "semillas";
  const encontrado = gruposEdad?.find((g) => g.id === grupoEdadId);
  const codigo = (encontrado?.codigo ?? "").toLowerCase();
  if (codigo.includes("embajador")) return "embajadores";
  if (codigo.includes("explorador")) return "exploradores";
  if (codigo.includes("semilla")) return "semillas";

  if (grupoEdadId.endsWith("0003")) return "embajadores";
  if (grupoEdadId.endsWith("0002")) return "exploradores";
  return "semillas";
}

export function resolverClaveSendaTema(tema?: {
  slug?: string | null;
  titulo?: string | null;
  senda?: { codigo?: string | null; nombre?: string | null } | null;
} | null): ClaveSenda {
  const sendaCodigo = (tema?.senda?.codigo ?? "").toLowerCase();
  const sendaNombre = (tema?.senda?.nombre ?? "").toLowerCase();
  const slug = (tema?.slug ?? "").toLowerCase();
  const titulo = (tema?.titulo ?? "").toLowerCase();

  if (
    sendaCodigo.includes("hijo") ||
    sendaNombre.includes("hijo") ||
    slug.includes("parabola") ||
    slug.includes("jesus") ||
    titulo.includes("parábola") ||
    titulo.includes("parabola") ||
    titulo.includes("jesús") ||
    titulo.includes("jesus")
  ) {
    return "hijo";
  }

  if (
    sendaCodigo.includes("espiritu") ||
    sendaCodigo.includes("espíritu") ||
    sendaNombre.includes("espiritu") ||
    sendaNombre.includes("espíritu") ||
    slug.includes("fruto") ||
    slug.includes("espiritu") ||
    titulo.includes("fruto") ||
    titulo.includes("espíritu") ||
    titulo.includes("espiritu")
  ) {
    return "espiritu";
  }

  return "padre";
}

export function obtenerSeedSendaEdad(senda: ClaveSenda, edad: CodigoEdad) {
  return CATALOGO_SENDAS_POR_EDAD[senda][edad];
}

export function useCrecerFase({ themeId, pasoCodigo }: UseCrecerFaseOptions) {
  const queryClient = useQueryClient();
  const eventSentRef = useRef(false);
  const [actividadesCompletadas, setActividadesCompletadas] = useState<Set<string>>(
    () => new Set(),
  );

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: obtenerMiPerfil,
  });

  const grupoEdadId = meQuery.data?.perfil?.grupo_edad_id ?? undefined;
  const codigoGrupoEdad = useMemo(
    () => resolverCodigoGrupoEdad(grupoEdadId, meQuery.data?.grupos_edad),
    [grupoEdadId, meQuery.data?.grupos_edad],
  );

  const themeQuery = useQuery({
    queryKey: ["theme", themeId],
    queryFn: () => obtenerTema(themeId),
  });
  const temaDbId = themeQuery.data?.id;

  const claveSenda = useMemo(
    () => resolverClaveSendaTema(themeQuery.data),
    [themeQuery.data],
  );

  const seedSendaEdad = useMemo(
    () => obtenerSeedSendaEdad(claveSenda, codigoGrupoEdad),
    [claveSenda, codigoGrupoEdad],
  );

  const stepsQuery = useQuery({
    queryKey: ["theme", temaDbId, "steps", grupoEdadId ?? "all"],
    queryFn: () => obtenerPasos(temaDbId!, grupoEdadId),
    enabled: !!temaDbId,
  });

  const activitiesQuery = useQuery({
    queryKey: ["theme", temaDbId, "activities", grupoEdadId ?? "all"],
    queryFn: () => obtenerActividades(temaDbId!, grupoEdadId),
    enabled: !!temaDbId,
  });

  // Reiniciar el seguimiento de actividades en pantalla al cambiar de paso, tema o rango de edad
  useEffect(() => {
    setActividadesCompletadas(new Set());
    eventSentRef.current = false;
  }, [themeId, pasoCodigo, grupoEdadId]);

  const pasoActual = useMemo<Paso | undefined>(() => {
    const paso = stepsQuery.data?.find((item) => item.tipo_paso?.codigo === pasoCodigo);
    const seedPaso =
      seedSendaEdad.pasos[
        (pasoCodigo as keyof typeof seedSendaEdad.pasos) ?? "conectar"
      ] ?? seedSendaEdad.pasos.conectar;

    if (!paso) {
      if (!temaDbId) return undefined;
      const ordenes: Record<string, number> = {
        conectar: 1,
        relatar: 2,
        ensenar: 3,
        comprobar: 4,
        experimentar: 5,
        recompensar: 6,
      };
      return {
        id: `fallback-paso-${claveSenda}-${pasoCodigo}`,
        tema_id: temaDbId,
        orden: ordenes[pasoCodigo] ?? 1,
        obligatorio: true,
        tipo_paso: {
          id: pasoCodigo,
          codigo: pasoCodigo,
          nombre: pasoCodigo.charAt(0).toUpperCase() + pasoCodigo.slice(1),
          descripcion: null,
          orden: ordenes[pasoCodigo] ?? 1,
          color_hex: null,
        },
        contenidos: [
          {
            id: `fallback-contenido-${claveSenda}-${pasoCodigo}-${codigoGrupoEdad}`,
            paso_id: `fallback-paso-${claveSenda}-${pasoCodigo}`,
            grupo_edad_id: grupoEdadId ?? "",
            titulo: seedPaso.titulo,
            instruccion_corta: seedPaso.instruccion_corta,
            cuerpo: seedPaso.cuerpo,
            recurso_id: null,
            recurso_audio_id: null,
            datos_extra: {},
          },
        ],
        preguntas: seedPaso.pregunta_reflexion
          ? [
              {
                id: `fallback-preg-${claveSenda}-${codigoGrupoEdad}`,
                paso_id: `fallback-paso-${claveSenda}-${pasoCodigo}`,
                grupo_edad_id: grupoEdadId ?? "",
                pregunta: seedPaso.pregunta_reflexion,
                orden: 1,
              },
            ]
          : [],
      };
    }

    let preguntasFinales = paso.preguntas ?? [];
    if (grupoEdadId && preguntasFinales.length > 0) {
      const filtradas = preguntasFinales.filter((p) => p.grupo_edad_id === grupoEdadId);
      if (filtradas.length > 0) {
        preguntasFinales = filtradas;
      }
    }
    if (preguntasFinales.length === 0 && seedPaso.pregunta_reflexion) {
      preguntasFinales = [
        {
          id: `fallback-preg-${claveSenda}-${codigoGrupoEdad}`,
          paso_id: paso.id,
          grupo_edad_id: grupoEdadId ?? "",
          pregunta: seedPaso.pregunta_reflexion,
          orden: 1,
        },
      ];
    }

    return { ...paso, preguntas: preguntasFinales };
  }, [stepsQuery.data, pasoCodigo, grupoEdadId, seedSendaEdad, temaDbId, claveSenda, codigoGrupoEdad]);

  const contenidoPaso = useMemo<
    (ContenidoPaso & {
      detalle_senda?: DetalleSendaEdad;
      cita_biblica?: string;
      versiculo_clave?: string;
    }) | undefined
  >(() => {
    const contenidos = pasoActual?.contenidos ?? [];
    const exactoPorEdad = grupoEdadId
      ? contenidos.find((c) => c.grupo_edad_id === grupoEdadId)
      : undefined;
    const base = exactoPorEdad ?? contenidos[0];

    const seedPaso =
      seedSendaEdad.pasos[
        (pasoCodigo as keyof typeof seedSendaEdad.pasos) ?? "conectar"
      ] ?? seedSendaEdad.pasos.conectar;

    if (pasoCodigo === "conectar") {
      const cuerpoDb = exactoPorEdad?.cuerpo?.trim() ?? "";
      const usarCuerpoDb =
        cuerpoDb.length >= 220 &&
        !(
          claveSenda === "padre" &&
          cuerpoDb.toLowerCase().includes("senda del hijo") &&
          cuerpoDb.toLowerCase().includes("senda del espíritu santo")
        );

      return {
        id: base?.id ?? `conectar-${claveSenda}-${codigoGrupoEdad}`,
        paso_id: base?.paso_id ?? pasoActual?.id ?? "",
        grupo_edad_id: grupoEdadId ?? base?.grupo_edad_id ?? "",
        titulo: usarCuerpoDb && exactoPorEdad?.titulo ? exactoPorEdad.titulo : seedPaso.titulo,
        instruccion_corta:
          usarCuerpoDb && exactoPorEdad?.instruccion_corta
            ? exactoPorEdad.instruccion_corta
            : seedPaso.instruccion_corta,
        cuerpo: usarCuerpoDb ? cuerpoDb : seedPaso.cuerpo,
        recurso_id: base?.recurso_id ?? null,
        recurso_audio_id: base?.recurso_audio_id ?? null,
        datos_extra: {
          ...(base?.datos_extra ?? {}),
          detalle_senda: seedSendaEdad.detalle,
          cita_biblica: seedSendaEdad.detalle.citaBiblica,
          versiculo_clave: seedSendaEdad.detalle.versiculoClave,
        },
        detalle_senda: seedSendaEdad.detalle,
        cita_biblica: seedSendaEdad.detalle.citaBiblica,
        versiculo_clave: seedSendaEdad.detalle.versiculoClave,
      };
    }

    if (!exactoPorEdad) {
      return {
        id: base?.id ?? `${pasoCodigo}-${claveSenda}-${codigoGrupoEdad}`,
        paso_id: base?.paso_id ?? pasoActual?.id ?? "",
        grupo_edad_id: grupoEdadId ?? base?.grupo_edad_id ?? "",
        titulo: seedPaso.titulo,
        instruccion_corta: seedPaso.instruccion_corta,
        cuerpo: seedPaso.cuerpo,
        recurso_id: base?.recurso_id ?? null,
        recurso_audio_id: base?.recurso_audio_id ?? null,
        datos_extra: {
          ...(base?.datos_extra ?? {}),
          cita_biblica: seedSendaEdad.detalle.citaBiblica,
          versiculo_clave: seedSendaEdad.detalle.versiculoClave,
        },
        cita_biblica: seedSendaEdad.detalle.citaBiblica,
        versiculo_clave: seedSendaEdad.detalle.versiculoClave,
      };
    }

    return {
      ...exactoPorEdad,
      cita_biblica: seedSendaEdad.detalle.citaBiblica,
      versiculo_clave: seedSendaEdad.detalle.versiculoClave,
    };
  }, [pasoActual, grupoEdadId, pasoCodigo, seedSendaEdad, claveSenda, codigoGrupoEdad]);

  const actividadesFase = useMemo(() => {
    const lista = activitiesQuery.data ?? [];
    let candidatas = lista.filter((actividad) => actividad.paso_id === pasoActual?.id);
    if (candidatas.length === 0) {
      const sinPasoId = lista.filter(
        (actividad) => actividad.paso_id === null || actividad.paso_id === undefined,
      );
      if (sinPasoId.length > 0 && pasoCodigo === "comprobar") {
        candidatas = sinPasoId;
      }
    }

    if (grupoEdadId && candidatas.length > 0) {
      const porGrupo = candidatas.filter((a) => a.grupo_edad_id === grupoEdadId);
      if (porGrupo.length > 0) {
        return porGrupo;
      }
    }

    if (candidatas.length === 0 && pasoCodigo === "comprobar" && temaDbId) {
      return construirActividadesFallback(
        temaDbId,
        pasoActual?.id ?? `fallback-paso-${claveSenda}-comprobar`,
        grupoEdadId ?? "",
        claveSenda,
        codigoGrupoEdad,
      );
    }

    return candidatas;
  }, [
    activitiesQuery.data,
    pasoActual?.id,
    pasoCodigo,
    grupoEdadId,
    temaDbId,
    claveSenda,
    codigoGrupoEdad,
  ]);

  const completedActivityCount = useMemo(
    () => actividadesFase.filter((a) => actividadesCompletadas.has(a.id)).length,
    [actividadesFase, actividadesCompletadas],
  );

  const allActivitiesCompleted = useMemo(
    () =>
      actividadesFase.length === 0 ||
      actividadesFase.every((actividad) => actividadesCompletadas.has(actividad.id)),
    [actividadesFase, actividadesCompletadas],
  );

  const isLoading =
    meQuery.isLoading ||
    themeQuery.isLoading ||
    (!!temaDbId && (stepsQuery.isLoading || activitiesQuery.isLoading));
  const isError = themeQuery.isError && !themeQuery.data && !contenidoPaso;

  const invalidarProgreso = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["progress"] });
    void queryClient.invalidateQueries({ queryKey: ["sync"] });
    void queryClient.invalidateQueries({ queryKey: ["gamification", "me"] });
    void queryClient.invalidateQueries({ queryKey: ["temas"] });
    void queryClient.invalidateQueries({ queryKey: ["theme"] });
    void queryClient.invalidateQueries({ queryKey: ["me"] });
  }, [queryClient]);

  const inicioMutation = useMutation({
    mutationFn: registrarEventosCrecer,
    onSuccess: invalidarProgreso,
  });

  const progresoMutation = useMutation({
    mutationFn: registrarEventosCrecer,
    onSuccess: invalidarProgreso,
  });

  useEffect(() => {
    if (
      isLoading ||
      isError ||
      !temaDbId ||
      !pasoActual?.id ||
      eventSentRef.current
    ) {
      return;
    }

    eventSentRef.current = true;
    const ocurridoEn = new Date().toISOString();
    const eventos: EventoProgreso[] = [
      ...(pasoCodigo === "conectar"
        ? [
            {
              evento_id_cliente: crypto.randomUUID(),
              tipo_evento: "tema_iniciado" as const,
              tema_id: temaDbId,
              ocurrido_en_cliente: ocurridoEn,
            },
          ]
        : []),
      {
        evento_id_cliente: crypto.randomUUID(),
        tipo_evento: "bloque_iniciado",
        tema_id: temaDbId,
        paso_id: pasoActual.id,
        ocurrido_en_cliente: ocurridoEn,
      },
    ];

    inicioMutation.mutate(eventos);
  }, [isLoading, isError, temaDbId, pasoActual?.id, pasoCodigo, inicioMutation]);

  const handleActivityComplete = useCallback(
    async (actividadId: string, xp?: number, puntaje?: number) => {
      setActividadesCompletadas((actuales) => {
        const siguiente = new Set(actuales);
        siguiente.add(actividadId);
        return siguiente;
      });

      if (!temaDbId) return;

      const xpFinal = xp ?? actividadesFase.find((a) => a.id === actividadId)?.xp_recompensa ?? 0;

      if (xpFinal > 0) {
        await playSound("insignia");
      }

      try {
        await progresoMutation.mutateAsync([
          {
            evento_id_cliente: crypto.randomUUID(),
            tipo_evento: "actividad_completada",
            tema_id: temaDbId,
            paso_id: pasoActual?.id && !pasoActual.id.startsWith("fallback-") ? pasoActual.id : undefined,
            actividad_id: actividadId,
            xp_otorgada: xpFinal,
            puntaje,
            ocurrido_en_cliente: new Date().toISOString(),
          },
        ]);
      } catch {
        // Mantener actividad completada en UI si falla la red
      }
    },
    [pasoActual?.id, progresoMutation, temaDbId, actividadesFase],
  );

  const completeStep = useCallback(async () => {
    if (!temaDbId || !pasoActual?.id) return;

    void playSound("siguiente");

    try {
      await progresoMutation.mutateAsync([
        {
          evento_id_cliente: crypto.randomUUID(),
          tipo_evento: "bloque_completado",
          tema_id: temaDbId,
          paso_id: pasoActual.id,
          ocurrido_en_cliente: new Date().toISOString(),
        },
      ]);
    } catch {
      // Continuar al siguiente paso aunque esté sin conexión
    }
  }, [pasoActual?.id, progresoMutation, temaDbId]);

  return {
    meQuery,
    themeQuery,
    stepsQuery,
    activitiesQuery,
    temaDbId,
    grupoEdadId,
    codigoGrupoEdad,
    claveSenda,
    pasoActual,
    contenidoPaso,
    actividadesFase,
    actividadesCompletadas,
    completedActivityCount,
    allActivitiesCompleted,
    isLoading,
    isError,
    isSavingProgress: progresoMutation.isPending,
    progressError: progresoMutation.error,
    handleActivityComplete,
    completeStep,
  };
}
