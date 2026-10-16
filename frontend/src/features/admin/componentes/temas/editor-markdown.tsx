import { useEffect, useRef } from "react";
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  tablePlugin,
  toolbarPlugin,
  UndoRedo,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import {
  sincronizarMarkdown,
  type EditorMarkdownControl,
} from "./editor-markdown.helpers";

interface EditorMarkdownProps {
  markdown: string;
  onChange: (markdown: string) => void;
}

export function EditorMarkdown({ markdown, onChange }: EditorMarkdownProps) {
  const editorRef = useRef<MDXEditorMethods>(null);
  const ultimoMarkdownEmitido = useRef("");

  useEffect(() => {
    if (!editorRef.current || markdown === ultimoMarkdownEmitido.current) return;

    sincronizarMarkdown(editorRef.current, markdown);
    ultimoMarkdownEmitido.current = markdown;
  }, [markdown]);

  return (
    <div className="admin-markdown-editor">
      <MDXEditor
        ref={editorRef}
        markdown={markdown}
        onChange={(nuevoMarkdown, initialMarkdownNormalize) => {
          if (initialMarkdownNormalize) return;
          ultimoMarkdownEmitido.current = nuevoMarkdown;
          onChange(nuevoMarkdown);
        }}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <BlockTypeSelect />
                <BoldItalicUnderlineToggles />
                <ListsToggle />
                <CreateLink />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
}
