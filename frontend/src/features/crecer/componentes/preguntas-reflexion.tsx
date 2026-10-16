import { MessageCircleQuestion } from "lucide-react";

interface Pregunta {
  id: string;
  pregunta: string;
}

interface PreguntasReflexionProps {
  preguntas: Pregunta[];
}

export function PreguntasReflexion({ preguntas }: PreguntasReflexionProps) {
  return (
    <section className="crecer-reflection" aria-labelledby="reflection-title">
      <header>
        <div className="crecer-reflection__icon">
          <MessageCircleQuestion aria-hidden="true" />
        </div>
        <div>
          <h2 id="reflection-title">Llévalo a tu vida</h2>
          <p>Piensa en estas preguntas con calma. No hay respuestas incorrectas.</p>
        </div>
      </header>
      <ol>
        {preguntas.map((pregunta, index) => (
          <li key={pregunta.id}>
            <span>{index + 1}</span>
            <p>{pregunta.pregunta}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
