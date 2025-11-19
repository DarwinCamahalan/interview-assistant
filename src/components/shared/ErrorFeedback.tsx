import React, { useState } from "react"
import { useToast } from "../../contexts/toast"

interface ErrorFeedbackProps {
  onSubmit: (errorFeedback: string) => Promise<void>
  isProcessing: boolean
  placeholder?: string
}

export const ErrorFeedback: React.FC<ErrorFeedbackProps> = ({
  onSubmit,
  isProcessing,
  placeholder = "Paste error message or incorrect output here..."
}) => {
  const [errorText, setErrorText] = useState("")
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!errorText.trim()) {
      showToast("Error", "Please enter an error message or output", "error")
      return
    }

    try {
      await onSubmit(errorText.trim())
      setErrorText("")
    } catch (error) {
      console.error("Error submitting feedback:", error)
      showToast("Error", "Failed to submit error feedback", "error")
    }
  }

  return (
    <div className="space-y-2">
      <h2 className="text-[13px] font-medium text-white tracking-wide">
        Still having issues? Send error message or output
      </h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={errorText}
          onChange={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setErrorText(e.target.value)
          }}
          onFocus={(e) => {
            e.preventDefault()
          }}
          placeholder={placeholder}
          disabled={isProcessing}
          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-[13px] text-gray-100 placeholder:text-gray-500 focus:outline-none focus:border-white/20 resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={isProcessing || !errorText.trim()}
          className="text-xs text-white bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:hover:bg-white/10 rounded px-3 py-1.5 transition-colors"
        >
          {isProcessing ? "Regenerating..." : "Regenerate Solution"}
        </button>
      </form>
    </div>
  )
}

