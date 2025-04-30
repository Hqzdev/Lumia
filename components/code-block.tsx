'use client';

import React, { useState } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneLight as theme } from 'react-syntax-highlighter/dist/esm/styles/hljs'; // Светлая тема
import { ClipboardIcon } from 'lucide-react'; // Иконки для копирования

interface CodeBlockProps {
  node: any;
  inline?: boolean;
  className?: string;
  children: any;
}

export function CodeBlock({
  node,
  inline = false,
  className = '',
  children,
  ...props
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');

  const code = String(children).trim();
  const language = match ? match[1] : '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (inline) {
    return (
      <code
        className={`text-sm bg-zinc-100 dark:bg-zinc-200 text-zinc-800 py-0.5 px-1 rounded-md ${className}`}
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="not-prose flex flex-col relative group">
      <button
        onClick={copyToClipboard}
        className="absolute top-2 right-2 z-10 p-1.5 text-zinc-400 hover:text-zinc-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy code"
      >
        <ClipboardIcon className="h-3 w-3" />
      </button>

      <SyntaxHighlighter
        style={theme}
        language={language}
        PreTag="pre"
        className="text-sm overflow-x-auto max-w-full !bg-transparent shadow-sm"
        wrapLongLines={true}
        showLineNumbers
        lineNumberStyle={{ color: '#a1a1aa', minWidth: '2.5em' }}
        customStyle={{
          margin: 0,
          padding: '1rem',
          borderRadius: '0.75rem',
          border: '1px solid rgb(193, 193, 193)',
          backgroundColor: '#fafafa',
          color: '#18181b',
          fontSize: '0.95rem',
          fontWeight: 500,
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}