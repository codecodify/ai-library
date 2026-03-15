import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'
import { UserMenu } from '@/components/user-menu'

export const metadata: Metadata = {
  title: 'AI Agent / Skills Library',
  description: '管理、检索、预览并快速复制 AI Agents / Skills',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans" suppressHydrationWarning>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex items-center">
                  <Link href="/" className="text-xl font-bold text-gray-900">
                    AI Agent Library
                  </Link>
                  <div className="ml-10 flex space-x-8">
                    <Link 
                      href="/" 
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                    >
                      首页
                    </Link>
                    <Link 
                      href="/resources" 
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      资源库
                    </Link>
                    <Link 
                      href="/settings" 
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                    >
                      设置
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <UserMenu />
                  <Link
                    href="/resources/new"
                    className="ml-6 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    新增资源
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
