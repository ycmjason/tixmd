import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import type { EditorState, LexicalEditor } from 'lexical';
import { useCallback, useRef } from 'react';

type Props = {
  initialMarkdown: string;
  editorRef: React.RefObject<LexicalEditor | null>;
};

function onError(error: Error): void {
  console.error('Lexical error:', error);
}

export function MarkdownEditor({ initialMarkdown, editorRef }: Props) {
  const initialConfig = useRef({
    namespace: 'TicketEditor',
    onError,
    editorState: () => $convertFromMarkdownString(initialMarkdown, TRANSFORMERS),
  }).current;

  const handleChange = useCallback(
    (_editorState: EditorState, editor: LexicalEditor) => {
      editorRef.current = editor;
    },
    [editorRef],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <PlainTextPlugin
        contentEditable={<ContentEditable className="markdown-editor" />}
        placeholder={
          <div className="text-text-faint text-[13px] absolute top-3 left-3 pointer-events-none">
            Write markdown…
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      <OnChangePlugin onChange={handleChange} />
    </LexicalComposer>
  );
}

export function getMarkdownFromEditor(editor: LexicalEditor): string {
  let markdown = '';
  editor.getEditorState().read(() => {
    markdown = $convertToMarkdownString(TRANSFORMERS);
  });
  return markdown;
}
