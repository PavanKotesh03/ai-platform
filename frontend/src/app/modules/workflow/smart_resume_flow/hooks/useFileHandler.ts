import { useRef, useState } from 'react'

export function useFileHandler() {
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null!)

  const handleFileAction = () => {
    if (!resumeFile) {
      fileInputRef.current?.click()
      return
    }

    const previewUrl = URL.createObjectURL(resumeFile)
    window.open(previewUrl, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(previewUrl), 60_000)
  }

  return {
    resumeFile,
    fileInputRef,
    fileInputKey,
    setResumeFile,
    setFileInputKey,
    handleFileAction,
  }
}
