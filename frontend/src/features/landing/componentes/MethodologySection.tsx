interface TimelineStepProps {
  letra: string;
  color: "green" | "blue" | "yellow" | "purple" | "red" | "orange";
  nombre: string;
  descripcion: string;
}

function TimelineStep({ letra, color, nombre, descripcion }: TimelineStepProps) {
  return (
    <article className={`timeline-step timeline-step--${color}`}>
      <div className={`step-circle step-circle--${color}`}>{letra}</div>
      <h3>{nombre}</h3>
      <p>{descripcion}</p>
    </article>
  );
}

export function MethodologySection() {
  const pasos = [
    { letra: "C", color: "green" as const, nombre: "Conectar", descripcion: "Me conecto con Dios y Su verdad." },
    { letra: "R", color: "blue" as const, nombre: "Relatar", descripcion: "Escucho y comprendo lo que dice la Biblia." },
    { letra: "E", color: "yellow" as const, nombre: "Enseñar", descripcion: "Aprendo y aplico en mi vida." },
    { letra: "C", color: "purple" as const, nombre: "Comprobar", descripcion: "Refuerzo lo aprendido con actividades." },
    { letra: "E", color: "red" as const, nombre: "Experimentar", descripcion: "Vivo lo aprendido en lo cotidiano." },
    { letra: "R", color: "orange" as const, nombre: "Recompensar", descripcion: "Dios me motiva a seguir creciendo." },
  ];

  return (
    <section id="metodologia" className="methodology">
      <div className="methodology__header">
        <span className="section-kicker">Metodología</span>
        <h2>
          Nuestra metodología <span className="text-green">CRECER</span>
        </h2>
        <p>Seis pasos para conocer, vivir y compartir la Palabra de Dios.</p>
      </div>

      <div className="methodology__timeline" aria-label="Pasos de la metodología CRECER">
        {pasos.map((paso) => (
          <TimelineStep key={paso.nombre} {...paso} />
        ))}
      </div>
    </section>
  );
}
