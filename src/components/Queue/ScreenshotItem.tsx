// src/components/ScreenshotItem.tsx
import React from "react"
import { X } from "lucide-react"

interface Screenshot {
  path: string
  preview: string
}

interface ScreenshotItemProps {
  screenshot: Screenshot
  onDelete: (index: number) => void
  index: number
  isLoading: boolean
}

const ScreenshotItem: React.FC<ScreenshotItemProps> = ({
  screenshot,
  onDelete,
  index,
  isLoading
}) => {
  const [showPreview, setShowPreview] = React.useState(false);

  const handleDelete = async () => {
    await onDelete(index)
  }

  return (
    <>
      <div
      className={`relative rounded-lg overflow-hidden glass-card group ${
        isLoading ? "opacity-50" : "hover:scale-[1.02]"
      } transition-all duration-300 aspect-video cursor-pointer`}
      onClick={() => !isLoading && setShowPreview(true)}
      >
        <div className="w-full h-full relative">
          {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="relative">
              <div className="w-8 h-8 border-3 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
            </div>
          )}
          <img
            src={screenshot.preview}
          alt={`Screenshot ${index + 1}`}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isLoading ? "scale-95" : "group-hover:scale-105"
            }`}
          />
        
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Screenshot Number Badge */}
        <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm">
          <span className="text-white text-xs font-medium">#{index + 1}</span>
        </div>
      </div>
      
      {/* Delete Button */}
        {!isLoading && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDelete()
            }}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200 hover:scale-110 z-10"
          style={{ cursor: 'pointer' }}
            aria-label="Delete screenshot"
          title="Delete screenshot"
          >
          <X size={16} />
          </button>
        )}
      </div>

      {/* Preview Modal - Fixed overlay */}
      {showPreview && (
        <>
          <div 
            className="fixed inset-0 bg-black/95 flex flex-col fade-in"
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              zIndex: 999999,
              margin: 0,
              padding: 0
            }}
            onClick={() => setShowPreview(false)}
          >
            {/* Header with close button */}
            <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
              <div className="px-4 py-2 rounded-lg bg-white/10">
                <span className="text-white text-sm font-medium">Screenshot #{index + 1}</span>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Image container - full size */}
            <div className="flex-1 flex items-center justify-center p-8" onClick={(e) => e.stopPropagation()}>
              <img
                src={screenshot.preview}
                alt={`Screenshot ${index + 1} Preview`}
                className="max-w-full max-h-full object-contain"
                style={{ width: 'auto', height: 'auto' }}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default ScreenshotItem
