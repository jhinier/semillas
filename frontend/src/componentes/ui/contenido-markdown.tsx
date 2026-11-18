import { Fragment, type ReactNode } from "react";

type ContenidoMarkdownProps = {
  texto?: string | null;
  className?: string;
};

type BloqueMarkdown =
  | { tipo: "h2"; texto: string }
  | { tipo: "h3"; texto: string }
  | { tipo: "h4"; texto: string }
  | { tipo: "ul"; items: string[] }
  | { tipo: "ol"; items: string[] }
  | { tipo: "quote"; lineas: string[] }
  | { tipo: "p"; lineas: string[] };

function esUrlSegura(url: string): boolean {
  const limpia = url.trim().toLowerCase();
  return (
    limpia.startsWith("https://") ||
    limpia.startsWith("http://") ||
    limpia.startsWith("/") ||
    limpia.startsWith("#")
  );
}

function renderInlineMarkdown(texto: string, prefijo: string): ReactNode[] {
  const nodos: ReactNode[] = [];
  const patron =
    /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|`[^`\n]+`|\[([^\]\n]+)\]\(([^)\s]+)\))/g;
  let ultimoIndice = 0;
  let match: RegExpExecArray | null;
  let contador = 0;

  while ((match = patron.exec(texto)) !== null) {
    if (match.index > ultimoIndice) {
      nodos.push(texto.slice(ultimoIndice, match.index));
    }

    const token = match[0];
    const key = `${prefijo}-${contador++}`;

    if (token.startsWith("**") && token.endsWith("**")) {
      nodos.push(<strong key={key}>{renderInlineMarkdown(token.slice(2, -2), key)}</strong>);
    } else if (token.startsWith("__") && token.endsWith("__")) {
      nodos.push(<strong key={key}>{renderInlineMarkdown(token.slice(2, -2), key)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      nodos.push(<em key={key}>{renderInlineMarkdown(token.slice(1, -1), key)}</em>);
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodos.push(
        <code
          key={key}
          className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800 dark:bg-slate-800 dark:text-slate-200"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (match[2] !== undefined && match[3] !== undefined) {
      const etiqueta = match[2];
      const href = match[3];
      if (esUrlSegura(href)) {
        nodos.push(
          <a
            key={key}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
            className="font-bold text-violet-700 underline underline-offset-2 hover:text-violet-800 dark:text-violet-300"
          >
            {etiqueta}
          </a>,
        );
      } else {
        nodos.push(etiqueta);
      }
    } else {
      nodos.push(token);
    }

    ultimoIndice = patron.lastIndex;
  }

  if (ultimoIndice < texto.length) {
    nodos.push(texto.slice(ultimoIndice));
  }

  return nodos;
}

function parsearBloquesMarkdown(texto: string): BloqueMarkdown[] {
  const lineas = texto.replace(/\r\n?/g, "\n").split("\n");
  const bloques: BloqueMarkdown[] = [];
  let indice = 0;

  while (indice < lineas.length) {
    const lineaActual = lineas[indice] ?? "";
    const recortada = lineaActual.trim();

    if (!recortada) {
      indice += 1;
      continue;
    }

    const headingMatch = /^(#{1,3})\s+(.+)$/.exec(recortada);
    if (headingMatch) {
      const nivel = headingMatch[1]!.length;
      bloques.push({
        tipo: nivel === 1 ? "h2" : nivel === 2 ? "h3" : "h4",
        texto: headingMatch[2]!.trim(),
      });
      indice += 1;
      continue;
    }

    if (/^>\s*/.test(recortada)) {
      const quoteLineas: string[] = [];
      while (indice < lineas.length && /^>\s*/.test((lineas[indice] ?? "").trim())) {
        quoteLineas.push((lineas[indice] ?? "").trim().replace(/^>\s*/, ""));
        indice += 1;
      }
      bloques.push({ tipo: "quote", lineas: quoteLineas });
      continue;
    }

    if (/^([-*•])\s+(.+)$/.test(recortada)) {
      const items: string[] = [];
      while (indice < lineas.length) {
        const match = /^([-*•])\s+(.+)$/.exec((lineas[indice] ?? "").trim());
        if (!match) break;
        items.push(match[2]!.trim());
        indice += 1;
      }
      bloques.push({ tipo: "ul", items });
      continue;
    }

    if (/^\d+[.)]\s+(.+)$/.test(recortada)) {
      const items: string[] = [];
      while (indice < lineas.length) {
        const match = /^\d+[.)]\s+(.+)$/.exec((lineas[indice] ?? "").trim());
        if (!match) break;
        items.push(match[1]!.trim());
        indice += 1;
      }
      bloques.push({ tipo: "ol", items });
      continue;
    }

    const parrafoLineas: string[] = [];
    while (indice < lineas.length) {
      const linea = (lineas[indice] ?? "").trim();
      if (
        !linea ||
        /^(#{1,3})\s+/.test(linea) ||
        /^>\s*/.test(linea) ||
        /^([-*•])\s+/.test(linea) ||
        /^\d+[.)]\s+/.test(linea)
      ) {
        break;
      }
      parrafoLineas.push(linea);
      indice += 1;
    }
    if (parrafoLineas.length > 0) {
      bloques.push({ tipo: "p", lineas: parrafoLineas });
    }
  }

  return bloques;
}

export function limpiarMarkdownATextoPlano(texto?: string | null): string {
  if (!texto) return "";
  return texto
    .replace(/\r\n?/g, "\n")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/^\d+[.)]\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/(\*\*|__|\*|`)/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function ContenidoMarkdown({ texto, className = "" }: ContenidoMarkdownProps) {
  const fuente = texto?.trim();
  if (!fuente) return null;

  const bloques = parsearBloquesMarkdown(fuente);

  return (
    <div className={`contenido-markdown space-y-3 whitespace-normal break-words ${className}`.trim()}>
      {bloques.map((bloque, indice) => {
        const key = `md-${indice}`;
        if (bloque.tipo === "h2") {
          return (
            <h2
              key={key}
              className="mt-1 text-xl font-black leading-snug tracking-tight text-slate-900 dark:text-slate-50"
            >
              {renderInlineMarkdown(bloque.texto, key)}
            </h2>
          );
        }
        if (bloque.tipo === "h3") {
          return (
            <h3
              key={key}
              className="mt-1 text-lg font-extrabold leading-snug text-slate-900 dark:text-slate-100"
            >
              {renderInlineMarkdown(bloque.texto, key)}
            </h3>
          );
        }
        if (bloque.tipo === "h4") {
          return (
            <h4
              key={key}
              className="mt-1 text-base font-extrabold leading-snug text-slate-800 dark:text-slate-200"
            >
              {renderInlineMarkdown(bloque.texto, key)}
            </h4>
          );
        }
        if (bloque.tipo === "quote") {
          return (
            <blockquote
              key={key}
              className="rounded-xl border-l-4 border-violet-400 bg-violet-50/60 px-4 py-2.5 text-[0.96em] italic text-slate-700 dark:border-violet-500 dark:bg-violet-950/30 dark:text-slate-200"
            >
              {bloque.lineas.map((linea, idxLinea) => (
                <Fragment key={`${key}-${idxLinea}`}>
                  {idxLinea > 0 ? <br /> : null}
                  {renderInlineMarkdown(linea, `${key}-${idxLinea}`)}
                </Fragment>
              ))}
            </blockquote>
          );
        }
        if (bloque.tipo === "ul") {
          return (
            <ul key={key} className="list-disc space-y-1.5 pl-5 text-inherit">
              {bloque.items.map((item, idxItem) => (
                <li key={`${key}-${idxItem}`} className="leading-relaxed">
                  {renderInlineMarkdown(item, `${key}-${idxItem}`)}
                </li>
              ))}
            </ul>
          );
        }
        if (bloque.tipo === "ol") {
          return (
            <ol key={key} className="list-decimal space-y-1.5 pl-5 text-inherit">
              {bloque.items.map((item, idxItem) => (
                <li key={`${key}-${idxItem}`} className="leading-relaxed">
                  {renderInlineMarkdown(item, `${key}-${idxItem}`)}
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={key} className="leading-relaxed">
            {bloque.lineas.map((linea, idxLinea) => (
              <Fragment key={`${key}-${idxLinea}`}>
                {idxLinea > 0 ? <br /> : null}
                {renderInlineMarkdown(linea, `${key}-${idxLinea}`)}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
