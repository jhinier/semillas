import { useState } from "react";
import { Boton } from "@/componentes/ui/boton";
import { X } from "lucide-react";

type TagInputProps = {
  tags: string[];
  onChange: (tags: string[]) => void;
  inputValue?: string;
  onInputChange?: (value: string) => void;
  onAddTag?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemoveTag?: (idx: number) => void;
  label?: string;
  helperText?: string;
};

export function TagInput({
  tags,
  onChange,
  inputValue,
  onInputChange,
  onAddTag,
  onRemoveTag,
  label = "Etiquetas",
  helperText,
}: TagInputProps) {
  const [internalInput, setInternalInput] = useState("");

  const isControlled = inputValue !== undefined;

  const inputVal = isControlled ? inputValue : internalInput;
  const setInput = isControlled ? (onInputChange ?? (() => {})) : setInternalInput;

  const handleAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isControlled && onAddTag) {
      onAddTag(e);
      return;
    }
    if (e.key === "Enter" && internalInput.trim()) {
      e.preventDefault();
      if (!tags.includes(internalInput.trim())) {
        onChange([...tags, internalInput.trim()]);
      }
      setInternalInput("");
    }
  };

  const handleRemove = (idx: number) => {
    if (isControlled && onRemoveTag) {
      onRemoveTag(idx);
      return;
    }
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-700">{label}</label>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl border border-slate-200 bg-white items-center min-h-[42px] px-3 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-600/10 transition-all">
          {tags.map((tag, idx) => (
            <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-slate-100 bg-slate-50 text-[11px] font-extrabold text-slate-500">
              {tag}
              <Boton
                variante="texto"
                tamano="iconoPequeno"
                onClick={() => handleRemove(idx)}
                clase="hover:text-red-500"
              >
                <X className="size-3" />
              </Boton>
            </span>
          ))}
          <input
            type="text"
            placeholder="Agregar etiqueta..."
            value={inputVal}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleAdd}
            className="flex-1 min-w-[100px] border-none bg-transparent outline-none py-1 text-[13px] font-semibold text-slate-800 placeholder:text-slate-400"
          />
        </div>
        {helperText && (
          <span className="text-[10px] text-slate-400 font-semibold leading-relaxed">{helperText}</span>
        )}
      </div>
    </div>
  );
}
