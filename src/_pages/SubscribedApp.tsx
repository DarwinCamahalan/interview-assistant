// file: src/components/SubscribedApp.tsx
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import Queue from "../_pages/Queue"
import Solutions from "../_pages/Solutions"
import Settings from "../_pages/Settings"
import { useToast } from "../contexts/toast"

interface SubscribedAppProps {
  credits: number
  currentLanguage: string
  setLanguage: (language: string) => void
  currentView: "queue" | "solutions" | "debug" | "settings"
  setCurrentView: (view: "queue" | "solutions" | "debug" | "settings") => void
  currentTheme: string
  onThemeChange: (theme: string) => void
}

const SubscribedApp: React.FC<SubscribedAppProps> = ({
  credits,
  currentLanguage,
  setLanguage,
  currentView,
  setCurrentView,
  currentTheme,
  onThemeChange
}) => {
  const queryClient = useQueryClient()
  const view = currentView
  const setView = setCurrentView
  const containerRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  // Let's ensure we reset queries etc. if some electron signals happen
  useEffect(() => {
    const cleanup = window.electronAPI.onResetView(() => {
      queryClient.invalidateQueries({
        queryKey: ["screenshots"]
      })
      queryClient.invalidateQueries({
        queryKey: ["problem_statement"]
      })
      queryClient.invalidateQueries({
        queryKey: ["solution"]
      })
      queryClient.invalidateQueries({
        queryKey: ["new_solution"]
      })
      setView("queue")
    })

    return () => {
      cleanup()
    }
  }, [])

  // No longer need to manually set dimensions - window is resizable
  useEffect(() => {
    // Window dimensions are now handled by Electron
  }, [view])

  // Listen for events that might switch views or show errors
  useEffect(() => {
    const cleanupFunctions = [
      window.electronAPI.onSolutionStart(() => {
        setView("solutions")
      }),
      window.electronAPI.onUnauthorized(() => {
        queryClient.removeQueries({
          queryKey: ["screenshots"]
        })
        queryClient.removeQueries({
          queryKey: ["solution"]
        })
        queryClient.removeQueries({
          queryKey: ["problem_statement"]
        })
        setView("queue")
      }),
      window.electronAPI.onResetView(() => {
        queryClient.removeQueries({
          queryKey: ["screenshots"]
        })
        queryClient.removeQueries({
          queryKey: ["solution"]
        })
        queryClient.removeQueries({
          queryKey: ["problem_statement"]
        })
        setView("queue")
      }),
      window.electronAPI.onResetView(() => {
        queryClient.setQueryData(["problem_statement"], null)
      }),
      window.electronAPI.onProblemExtracted((data: any) => {
        if (view === "queue") {
          queryClient.invalidateQueries({
            queryKey: ["problem_statement"]
          })
          queryClient.setQueryData(["problem_statement"], data)
        }
      }),
      window.electronAPI.onSolutionError((error: string) => {
        showToast("Error", error, "error")
      })
    ]
    return () => cleanupFunctions.forEach((fn) => fn())
  }, [view])

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <div className="h-full w-full overflow-y-auto overflow-x-hidden">
        {view === "queue" ? (
          <Queue
            setView={setView}
            credits={credits}
            currentLanguage={currentLanguage}
            setLanguage={setLanguage}
          />
        ) : view === "solutions" ? (
          <Solutions
            setView={setView}
            credits={credits}
            currentLanguage={currentLanguage}
            setLanguage={setLanguage}
          />
        ) : view === "settings" ? (
          <Settings
            currentTheme={currentTheme}
            onThemeChange={onThemeChange}
          />
        ) : null}
      </div>
    </div>
  )
}

export default SubscribedApp
