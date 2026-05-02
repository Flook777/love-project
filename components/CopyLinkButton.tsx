'use client'

import { useState } from 'react'

export default function CopyLinkButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const url = `${window.location.origin}/p/${slug}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center justify-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2.5 rounded-xl text-sm font-semibold transition border border-blue-100"
    >
      {copied ? '✅ Copied' : '🔗 Copy'}
    </button>
  )
}
