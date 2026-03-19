import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListItemNode, ListNode } from '@lexical/list';
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { $getRoot, type EditorState, type LexicalEditor } from 'lexical';
import { useCallback, useRef } from 'react';

const EDITOR_NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  CodeHighlightNode,
  LinkNode,
  AutoLinkNode,
];

type Props = {
  initialMarkdown: string;
  editorRef: React.RefObject<LexicalEditor | null>;
  onDirty: () => void;
};

function onError(error: Error): void {
  console.error('Lexical error:', error);
}

export function MarkdownEditor({ initialMarkdown, editorRef, onDirty }: Props) {
  const isFirstChange = useRef(true);

  const initialConfig = useRef({
    namespace: 'TicketEditor',
    onError,
    nodes: EDITOR_NODES,
    editorState: () => $convertFromMarkdownString(initialMarkdown, TRANSFORMERS),
    theme: {
      text: {
        bold: 'editor-bold',
        italic: 'editor-italic',
        strikethrough: 'editor-strikethrough',
        code: 'editor-inline-code',
      },
      heading: {
        h1: 'editor-h1',
        h2: 'editor-h2',
        h3: 'editor-h3',
      },
      list: {
        ul: 'editor-ul',
        ol: 'editor-ol',
        listitem: 'editor-li',
        listitemChecked: 'editor-li-checked',
        listitemUnchecked: 'editor-li-unchecked',
        nested: {
          listitem: 'editor-nested-li',
        },
      },
      quote: 'editor-quote',
      code: 'editor-code-block',
      codeHighlight: {},
      link: 'editor-link',
    },
  }).current;

  const handleChange = useCallback(
    (_editorState: EditorState, editor: LexicalEditor) => {
      editorRef.current = editor;
      // Skip the initial hydration change
      if (isFirstChange.current) {
        isFirstChange.current = false;
        return;
      }
      onDirty();
    },
    [editorRef, onDirty],
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <RichTextPlugin
        contentEditable={<ContentEditable className="markdown-editor" />}
        placeholder={
          <div className="text-text-faint text-[13px] absolute top-3 left-5 pointer-events-none">
            Write markdown…
          </div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <AutoFocusPlugin />
      <ListPlugin />
      <CheckListPlugin />
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

export function isEditorEmpty(editor: LexicalEditor): boolean {
  let empty = true;
  editor.getEditorState().read(() => {
    empty = $getRoot().getTextContent().trim().length === 0;
  });
  return empty;
}
