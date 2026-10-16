import { type ChangeEvent, type RefObject } from "react";

interface PortadaFileInputProps {
  inputRef: RefObject<HTMLInputElement | null>;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export function PortadaFileInput({ inputRef, onFileChange }: PortadaFileInputProps) {
  return (
    <input
      ref={inputRef}
      type="file"
      className="hidden"
      accept="image/*"
      onChange={onFileChange}
    />
  );
}
