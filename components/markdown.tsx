import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkFootnotes from 'remark-footnotes';
import rehypeRaw from 'rehype-raw';
import { CodeBlock } from './code-block';

const components: Partial<Components> = {
  // @ts-expect-error
  code: CodeBlock,
  pre: ({ children }) => <>{children}</>,
  ol: ({ node, children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className="list-decimal list-outside ml-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
  del: ({ node, children, ...props }) => {
    return (
      <del className="line-through text-gray-500" {...props}>
        {children}
      </del>
    );
  },
  blockquote: ({ node, children, ...props }) => {
    return (
      <blockquote
        className="border-l-4 border-blue-400 pl-4 italic text-gray-700 my-4"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  table: ({ node, children, ...props }) => {
    return (
      <div className="overflow-x-auto my-4">
        <table className="min-w-full border border-gray-300" {...props}>
          {children}
        </table>
      </div>
    );
  },
  thead: ({ node, children, ...props }) => {
    return (
      <thead className="bg-gray-100" {...props}>
        {children}
      </thead>
    );
  },
  tbody: ({ node, children, ...props }) => {
    return <tbody {...props}>{children}</tbody>;
  },
  tr: ({ node, children, ...props }) => {
    return (
      <tr className="border-b border-gray-200" {...props}>
        {children}
      </tr>
    );
  },
  th: ({ node, children, ...props }) => {
    return (
      <th
        className="px-4 py-2 font-semibold text-left border-b border-gray-300"
        {...props}
      >
        {children}
      </th>
    );
  },
  td: ({ node, children, ...props }) => {
    return (
      <td className="px-4 py-2 border-b border-gray-200" {...props}>
        {children}
      </td>
    );
  },
  hr: ({ ...props }) => <hr className="my-6 border-gray-300" {...props} />, // горизонтальная линия
  img: ({ node, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="max-w-full h-auto rounded shadow my-2"
      {...props}
      alt={props.alt || ''}
    />
  ),
  input: ({ node, ...props }) => {
    // Чекбоксы для списков задач
    if (props.type === 'checkbox') {
      return (
        <input
          type="checkbox"
          className="mr-2 align-middle"
          checked={props.checked}
          readOnly
        />
      );
    }
    return <input {...props} />;
  },
};

const remarkPlugins = [remarkGfm, remarkMath, remarkFootnotes];
const rehypePlugins = [rehypeKatex, rehypeRaw];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={components}
      // allow dangerous HTML for raw HTML support
      skipHtml={false}
    >
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
