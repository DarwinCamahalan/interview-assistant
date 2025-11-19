import React, { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import ScreenshotQueue from "../components/Queue/ScreenshotQueue"
import { ModernQueueActions } from "../components/Queue/ModernQueueActions"

import { useToast } from "../contexts/toast"
import { Screenshot } from "../types/screenshots"

async function fetchScreenshots(): Promise<Screenshot[]> {
  try {
    const existing = await window.electronAPI.getScreenshots()
    return existing
  } catch (error) {
    console.error("Error loading screenshots:", error)
    throw error
  }
}

interface QueueProps {
  setView: (view: "queue" | "solutions" | "debug") => void
  credits: number
  currentLanguage: string
  setLanguage: (language: string) => void
}

const Queue: React.FC<QueueProps> = ({
  setView,
  credits,
  currentLanguage,
  setLanguage
}) => {
  const { showToast } = useToast()
  const contentRef = useRef<HTMLDivElement>(null)

  const {
    data: screenshots = [],
    isLoading,
    refetch
  } = useQuery<Screenshot[]>({
    queryKey: ["screenshots"],
    queryFn: fetchScreenshots,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false
  })

  const handleDeleteScreenshot = async (index: number) => {
    const screenshotToDelete = screenshots[index]

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path
      )

      if (response.success) {
        refetch() // Refetch screenshots instead of managing state directly
      } else {
        console.error("Failed to delete screenshot:", response.error)
        showToast("Error", "Failed to delete the screenshot file", "error")
      }
    } catch (error) {
      console.error("Error deleting screenshot:", error)
    }
  }

  useEffect(() => {
    // No longer force window dimensions - let user control window size

    // Set up event listeners
    const cleanupFunctions = [
      window.electronAPI.onScreenshotTaken(() => refetch()),
      window.electronAPI.onResetView(() => refetch()),
      window.electronAPI.onDeleteLastScreenshot(async () => {
        if (screenshots.length > 0) {
          const lastScreenshot = screenshots[screenshots.length - 1];
          await handleDeleteScreenshot(screenshots.length - 1);
          // Toast removed as requested
        } else {
          showToast("No Screenshots", "There are no screenshots to delete", "neutral");
        }
      }),
      window.electronAPI.onSolutionError((error: string) => {
        showToast(
          "Processing Failed",
          "There was an error processing your screenshots.",
          "error"
        )
        setView("queue") // Revert to queue if processing fails
        console.error("Processing error:", error)
      }),
      window.electronAPI.onProcessingNoScreenshots(() => {
        showToast(
          "No Screenshots",
          "There are no screenshots to process.",
          "neutral"
        )
      }),
      // Removed out of credits handler - unlimited credits in this version
    ]

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [screenshots])

  return (
    <div ref={contentRef} className="h-full w-full p-4 space-y-4">
      {/* Header Section */}
      <div className="glass-card rounded-xl p-4 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-semibold gradient-text">Screenshot Queue</h1>
            <p className="text-white/50 text-xs mt-1">
              Capture screenshots to process with AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="glass-panel px-3 py-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="status-dot active"></div>
                <span className="text-white/70 text-xs font-medium">
                  {screenshots.length} {screenshots.length === 1 ? 'screenshot' : 'screenshots'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Screenshot Grid */}
      {screenshots.length > 0 ? (
        <div className="glass-card rounded-xl p-4 fade-in">
          <h2 className="text-white text-sm font-medium mb-3">Captured Screenshots</h2>
          <div className="grid grid-cols-2 gap-3">
          <ScreenshotQueue
            isLoading={false}
            screenshots={screenshots}
            onDeleteScreenshot={handleDeleteScreenshot}
          />
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-8 text-center fade-in">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-white/70 text-sm font-medium">No screenshots yet</p>
              <p className="text-white/40 text-xs">
                Press <kbd className="px-2 py-1 bg-white/10 rounded text-white/60 text-xs">⌘+H</kbd> to capture
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="fade-in">
        <ModernQueueActions
          screenshotCount={screenshots.length}
        />
      </div>

      {/* Help Section */}
      <div className="glass-card rounded-xl p-4 fade-in border-l-4 border-purple-500/50">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-white text-xs font-semibold">Quick Tip</h3>
            <p className="text-white/60 text-xs leading-relaxed">
              Capture multiple screenshots of your problem before processing. Include the problem statement, 
              constraints, and any test cases for better AI analysis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Queue
