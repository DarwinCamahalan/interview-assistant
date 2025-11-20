import React, { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"

interface LanguageSelectorProps {
  currentLanguage: string
  setLanguage: (language: string) => void
}

const LANGUAGES = [
  { value: "python", label: "Python" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
  { value: "golang", label: "Go" },
  { value: "cpp", label: "C++" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "ruby", label: "Ruby" },
  { value: "sql", label: "SQL" },
  { value: "r", label: "R" },
  { value: "csharp", label: "C#" }
]

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  setLanguage
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })

  const handleLanguageChange = async (newLanguage: string) => {
    try {
      console.log(`🌐 LanguageSelector - Changing language to: ${newLanguage}`);
      
      // Save language preference to electron store
      const result = await window.electronAPI.updateConfig({ language: newLanguage });
      console.log(`✅ LanguageSelector - Config updated, result:`, result);
      
      // Update global language variable
      window.__LANGUAGE__ = newLanguage
      console.log(`✅ LanguageSelector - Set window.__LANGUAGE__ to: ${newLanguage}`);
      
      // Update state in React
      setLanguage(newLanguage)
      setIsOpen(false)
      
      console.log(`✅ LanguageSelector - Language changed to ${newLanguage}`);
    } catch (error) {
      console.error("❌ LanguageSelector - Error updating language:", error)
    }
  }

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      })
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const currentLang = LANGUAGES.find(l => l.value === currentLanguage) || LANGUAGES[0]

  return (
    <div className="mb-3 px-2 space-y-1">
      <div className="flex items-center justify-between text-[13px] font-medium text-white/90">
        <span>Language</span>
        <div ref={buttonRef} className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="bg-black/80 text-white/90 rounded px-2 py-1 text-sm outline-none border border-white/10 hover:border-white/20 flex items-center gap-2 min-w-[120px] justify-between"
          >
            <span>{currentLang.label}</span>
            <svg 
              className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>
      
      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed bg-black/95 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden shadow-2xl fade-in"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            minWidth: `${position.width}px`,
            zIndex: 2147483647
          }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => handleLanguageChange(lang.value)}
              className={`
                w-full text-left px-3 py-2 text-sm transition-colors
                ${currentLanguage === lang.value 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              {lang.label}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  )
}
