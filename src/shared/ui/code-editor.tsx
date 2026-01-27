"use client";

import Editor from "react-simple-code-editor";

import { highlight, languages } from "prismjs";

import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-c";
import "prismjs/components/prism-cpp";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-go";
import "prismjs/components/prism-rust";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-markdown";

import "@/styles/prism-vsc-dark-plus.css";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface CodeEditorProps {
  code?: string;
  language?: string;
  readOnly?: boolean;
  setCode?(code: string): void;
  setLanguage?(language: string): void;
}

function CodeEditor({
  code = "",
  language = "markdown",
  readOnly = false,
  setCode,
  setLanguage,
}: CodeEditorProps) {
  const handleHighlight = (code: string) => {
    const grammar = languages[language] || languages.markdown;
    return highlight(code, grammar, language);
  };

  return (
    <div className="relative rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/50">
        {readOnly ? (
          <span className="text-xs text-muted-foreground">{language}</span>
        ) : (
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="bg-transparent border-none text-xs text-muted-foreground !h-auto !px-2 !py-1 !gap-1">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent defaultValue={language}>
              <SelectItem value="markdown">Markdown</SelectItem>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="jsx">JSX</SelectItem>
              <SelectItem value="typescript">TypeScript</SelectItem>
              <SelectItem value="tsx">TSX</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
              <SelectItem value="c">C</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="csharp">C#</SelectItem>
              <SelectItem value="go">Go</SelectItem>
              <SelectItem value="rust">Rust</SelectItem>
              <SelectItem value="sql">SQL</SelectItem>
              <SelectItem value="bash">Bash</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="markup">HTML</SelectItem>
              <SelectItem value="css">CSS</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>
      <Editor
        value={code}
        onValueChange={(c) => setCode?.(c)}
        highlight={handleHighlight}
        padding={15}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          minHeight: "200px",
          backgroundColor: "#171717",
        }}
        textareaClassName="focus:outline-none"
        readOnly={readOnly}
      />
    </div>
  );
}

export { CodeEditor };
