export type EditorMarkdownControl = {
  setMarkdown: (markdown: string) => void;
};

export function sincronizarMarkdown(editor: EditorMarkdownControl, markdown: string) {
  editor.setMarkdown(markdown);
}
