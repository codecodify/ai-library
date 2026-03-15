'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { useEffect, useRef } from 'react'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  const codeRef = useRef<HTMLElement>(null)
  
  useEffect(() => {
    if (codeRef.current) {
      hljs.highlightElement(codeRef.current)
    }
  }, [content])
  
  return (
    <div className="prose prose-sm max-w-none">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            const isInline = !match && !className
            
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 bg-gray-100 rounded text-sm" {...props}>
                  {children}
                </code>
              )
            }
            
            return (
              <code 
                ref={codeRef}
                className={`block ${className || ''} p-4 rounded-lg overflow-x-auto text-sm`}
                {...props}
              >
                {children}
              </code>
            )
          },
          pre({ children }) {
            return (
              <pre className="bg-gray-50 rounded-lg overflow-hidden my-4">
                {children}
              </pre>
            )
          },
          a({ href, children }) {
            return (
              <a 
                href={href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {children}
              </a>
            )
          },
          h1({ children }) {
            return <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
          },
          h2({ children }) {
            return <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
          },
          h3({ children }) {
            return <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
          },
          p({ children }) {
            return <p className="my-2 leading-relaxed">{children}</p>
          },
          ul({ children }) {
            return <ul className="list-disc list-inside my-2 space-y-1">{children}</ul>
          },
          ol({ children }) {
            return <ol className="list-decimal list-inside my-2 space-y-1">{children}</ol>
          },
          blockquote({ children }) {
            return <blockquote className="border-l-4 border-gray-300 pl-4 my-4 italic text-gray-600">{children}</blockquote>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
