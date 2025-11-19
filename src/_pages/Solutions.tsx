// Solutions.tsx
import React, { useState, useEffect, useRef } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"

import ScreenshotQueue from "../components/Queue/ScreenshotQueue"

import { ProblemStatementData } from "../types/solutions"
import { ModernSolutionActions } from "../components/Solutions/ModernSolutionActions"
import Debug from "./Debug"
import { useToast } from "../contexts/toast"
import { COMMAND_KEY } from "../utils/platform"
import { ErrorFeedback } from "../components/shared/ErrorFeedback"

export const ContentSection = ({
  title,
  content,
  isLoading
}: {
  title: string
  content: React.ReactNode
  isLoading: boolean
}) => (
  <div className="glass-card rounded-xl p-4 space-y-3 fade-in">
    <div className="flex items-center gap-2">
      <div className="w-1 h-5 bg-gradient-accent rounded-full"></div>
      <h2 className="text-sm font-semibold text-white tracking-wide">
      {title}
    </h2>
    </div>
    {isLoading ? (
      <div className="flex items-center gap-3 p-4">
        <div className="shimmer w-full h-20 rounded-lg"></div>
      </div>
    ) : (
      <div className="text-sm leading-relaxed text-gray-100 w-full">
        {content}
      </div>
    )}
  </div>
)
const SolutionSection = ({
  title,
  content,
  isLoading,
  currentLanguage
}: {
  title: string
  content: React.ReactNode
  isLoading: boolean
  currentLanguage: string
}) => {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (typeof content === "string") {
      navigator.clipboard.writeText(content).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="glass-card rounded-xl overflow-hidden fade-in">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-accent-green rounded-full"></div>
          <h2 className="text-sm font-semibold text-white tracking-wide">
        {title}
      </h2>
        </div>
        {!isLoading && (
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 modern-button"
          >
            {copied ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="p-4">
          <div className="shimmer w-full h-64 rounded-lg"></div>
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-auto max-h-96">
            <SyntaxHighlighter
              showLineNumbers
              language={currentLanguage == "golang" ? "go" : currentLanguage}
              style={dracula}
              customStyle={{
                maxWidth: "100%",
                margin: 0,
                padding: "1rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                height: "auto",
                minHeight: "100px",
                fontSize: "0.8rem",
                borderRadius: "0"
              }}
              wrapLongLines={true}
            >
              {content as string}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  )
}

export const ComplexitySection = ({
  timeComplexity,
  spaceComplexity,
  isLoading
}: {
  timeComplexity: string | null
  spaceComplexity: string | null
  isLoading: boolean
}) => {
  // Helper to ensure we have proper complexity values
  const formatComplexity = (complexity: string | null): string => {
    // Default if no complexity returned by LLM
    if (!complexity || complexity.trim() === "") {
      return "Complexity not available";
    }

    const bigORegex = /O\([^)]+\)/i;
    // Return the complexity as is if it already has Big O notation
    if (bigORegex.test(complexity)) {
      return complexity;
    }
    
    // Concat Big O notation to the complexity
    return `O(${complexity})`;
  };
  
  const formattedTimeComplexity = formatComplexity(timeComplexity);
  const formattedSpaceComplexity = formatComplexity(spaceComplexity);
  
  return (
    <div className="glass-card rounded-xl p-4 space-y-3 fade-in">
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 bg-gradient-accent-blue rounded-full"></div>
        <h2 className="text-sm font-semibold text-white tracking-wide">
          Complexity Analysis
      </h2>
      </div>
      {isLoading ? (
        <div className="shimmer w-full h-24 rounded-lg"></div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel-dark rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs text-white/60 font-medium">Time</span>
              </div>
            <div className="text-sm font-semibold text-white font-mono">
              {formattedTimeComplexity}
            </div>
          </div>
          <div className="glass-panel-dark rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
              </svg>
              <span className="text-xs text-white/60 font-medium">Space</span>
              </div>
            <div className="text-sm font-semibold text-white font-mono">
              {formattedSpaceComplexity}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export interface SolutionsProps {
  setView: (view: "queue" | "solutions" | "debug") => void
  credits: number
  currentLanguage: string
  setLanguage: (language: string) => void
}
const Solutions: React.FC<SolutionsProps> = ({
  setView,
  credits,
  currentLanguage,
  setLanguage
}) => {
  const queryClient = useQueryClient()
  const contentRef = useRef<HTMLDivElement>(null)

  const [debugProcessing, setDebugProcessing] = useState(false)
  const [regeneratingSolution, setRegeneratingSolution] = useState(false)
  const [problemStatementData, setProblemStatementData] =
    useState<ProblemStatementData | null>(null)
  const [solutionData, setSolutionData] = useState<string | null>(null)
  const [thoughtsData, setThoughtsData] = useState<string[] | null>(null)
  const [timeComplexityData, setTimeComplexityData] = useState<string | null>(
    null
  )
  const [spaceComplexityData, setSpaceComplexityData] = useState<string | null>(
    null
  )

  const [isResetting, setIsResetting] = useState(false)

  interface Screenshot {
    id: string
    path: string
    preview: string
    timestamp: number
  }

  const [extraScreenshots, setExtraScreenshots] = useState<Screenshot[]>([])

  useEffect(() => {
    const fetchScreenshots = async () => {
      try {
        const existing = await window.electronAPI.getScreenshots()
        console.log("Raw screenshot data:", existing)
        const screenshots = (Array.isArray(existing) ? existing : []).map(
          (p) => ({
            id: p.path,
            path: p.path,
            preview: p.preview,
            timestamp: Date.now()
          })
        )
        console.log("Processed screenshots:", screenshots)
        setExtraScreenshots(screenshots)
      } catch (error) {
        console.error("Error loading extra screenshots:", error)
        setExtraScreenshots([])
      }
    }

    fetchScreenshots()
  }, [solutionData])

  const { showToast } = useToast()

  useEffect(() => {
    // No longer force window dimensions - let user control window size

    // Set up event listeners
    const cleanupFunctions = [
      window.electronAPI.onScreenshotTaken(async () => {
        try {
          const existing = await window.electronAPI.getScreenshots()
          const screenshots = (Array.isArray(existing) ? existing : []).map(
            (p) => ({
              id: p.path,
              path: p.path,
              preview: p.preview,
              timestamp: Date.now()
            })
          )
          setExtraScreenshots(screenshots)
        } catch (error) {
          console.error("Error loading extra screenshots:", error)
        }
      }),
      window.electronAPI.onResetView(() => {
        // Set resetting state first
        setIsResetting(true)

        // Remove queries
        queryClient.removeQueries({
          queryKey: ["solution"]
        })
        queryClient.removeQueries({
          queryKey: ["new_solution"]
        })

        // Reset screenshots
        setExtraScreenshots([])

        // After a small delay, clear the resetting state
        setTimeout(() => {
          setIsResetting(false)
        }, 0)
      }),
      window.electronAPI.onSolutionStart(() => {
        // Every time processing starts, reset relevant states
        setSolutionData(null)
        setThoughtsData(null)
        setTimeComplexityData(null)
        setSpaceComplexityData(null)
      }),
      window.electronAPI.onProblemExtracted((data: any) => {
        queryClient.setQueryData(["problem_statement"], data)
      }),
      //if there was an error processing the initial solution
      window.electronAPI.onSolutionError((error: string) => {
        showToast("Processing Failed", error, "error")
        // Reset solutions in the cache (even though this shouldn't ever happen) and complexities to previous states
        const solution = queryClient.getQueryData(["solution"]) as {
          code: string
          thoughts: string[]
          time_complexity: string
          space_complexity: string
        } | null
        if (!solution) {
          setView("queue")
        }
        setSolutionData(solution?.code || null)
        setThoughtsData(solution?.thoughts || null)
        setTimeComplexityData(solution?.time_complexity || null)
        setSpaceComplexityData(solution?.space_complexity || null)
        console.error("Processing error:", error)
      }),
      //when the initial solution is generated, we'll set the solution data to that
      window.electronAPI.onSolutionSuccess((data: any) => {
        if (!data) {
          console.warn("Received empty or invalid solution data")
          return
        }
        console.log({ data })
        const solutionData = {
          code: data.code,
          thoughts: data.thoughts,
          time_complexity: data.time_complexity,
          space_complexity: data.space_complexity
        }

        queryClient.setQueryData(["solution"], solutionData)
        setSolutionData(solutionData.code || null)
        setThoughtsData(solutionData.thoughts || null)
        setTimeComplexityData(solutionData.time_complexity || null)
        setSpaceComplexityData(solutionData.space_complexity || null)

        // Fetch latest screenshots when solution is successful
        const fetchScreenshots = async () => {
          try {
            const existing = await window.electronAPI.getScreenshots()
            const screenshots =
              existing.previews?.map((p: any) => ({
                id: p.path,
                path: p.path,
                preview: p.preview,
                timestamp: Date.now()
              })) || []
            setExtraScreenshots(screenshots)
          } catch (error) {
            console.error("Error loading extra screenshots:", error)
            setExtraScreenshots([])
          }
        }
        fetchScreenshots()
      }),

      //########################################################
      //DEBUG EVENTS
      //########################################################
      window.electronAPI.onDebugStart(() => {
        //we'll set the debug processing state to true and use that to render a little loader
        setDebugProcessing(true)
      }),
      //the first time debugging works, we'll set the view to debug and populate the cache with the data
      window.electronAPI.onDebugSuccess((data: any) => {
        queryClient.setQueryData(["new_solution"], data)
        setDebugProcessing(false)
      }),
      //when there was an error in the initial debugging, we'll show a toast and stop the little generating pulsing thing.
      window.electronAPI.onDebugError(() => {
        showToast(
          "Processing Failed",
          "There was an error debugging your code.",
          "error"
        )
        setDebugProcessing(false)
      }),
      window.electronAPI.onProcessingNoScreenshots(() => {
        showToast(
          "No Screenshots",
          "There are no extra screenshots to process.",
          "neutral"
        )
      }),
      window.electronAPI.onRegenerateSolutionStart(() => {
        setRegeneratingSolution(true)
      }),
      window.electronAPI.onRegenerateSolutionSuccess((data: {
        code: string
        thoughts: string[]
        time_complexity: string
        space_complexity: string
      }) => {
        queryClient.setQueryData(["solution"], data)
        setSolutionData(data.code || null)
        setThoughtsData(data.thoughts || null)
        setTimeComplexityData(data.time_complexity || null)
        setSpaceComplexityData(data.space_complexity || null)
        setRegeneratingSolution(false)
        showToast("Success", "Solution regenerated successfully", "success")
      }),
      window.electronAPI.onRegenerateSolutionError((error: string) => {
        showToast("Error", error || "Failed to regenerate solution", "error")
        setRegeneratingSolution(false)
      }),
      // Removed out of credits handler - unlimited credits in this version
    ]

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [])

  useEffect(() => {
    setProblemStatementData(
      queryClient.getQueryData(["problem_statement"]) || null
    )
    setSolutionData(queryClient.getQueryData(["solution"]) || null)

    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query.queryKey[0] === "problem_statement") {
        setProblemStatementData(
          queryClient.getQueryData(["problem_statement"]) || null
        )
      }
      if (event?.query.queryKey[0] === "solution") {
        const solution = queryClient.getQueryData(["solution"]) as {
          code: string
          thoughts: string[]
          time_complexity: string
          space_complexity: string
        } | null

        setSolutionData(solution?.code ?? null)
        setThoughtsData(solution?.thoughts ?? null)
        setTimeComplexityData(solution?.time_complexity ?? null)
        setSpaceComplexityData(solution?.space_complexity ?? null)
      }
    })
    return () => unsubscribe()
  }, [queryClient])

  const handleDeleteExtraScreenshot = async (index: number) => {
    const screenshotToDelete = extraScreenshots[index]

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path
      )

      if (response.success) {
        // Fetch and update screenshots after successful deletion
        const existing = await window.electronAPI.getScreenshots()
        const screenshots = (Array.isArray(existing) ? existing : []).map(
          (p) => ({
            id: p.path,
            path: p.path,
            preview: p.preview,
            timestamp: Date.now()
          })
        )
        setExtraScreenshots(screenshots)
      } else {
        console.error("Failed to delete extra screenshot:", response.error)
        showToast("Error", "Failed to delete the screenshot", "error")
      }
    } catch (error) {
      console.error("Error deleting extra screenshot:", error)
      showToast("Error", "Failed to delete the screenshot", "error")
    }
  }

  return (
    <>
      {!isResetting && queryClient.getQueryData(["new_solution"]) ? (
        <Debug
          isProcessing={debugProcessing}
          setIsProcessing={setDebugProcessing}
          currentLanguage={currentLanguage}
          setLanguage={setLanguage}
        />
      ) : (
        <div ref={contentRef} className="relative overflow-y-auto h-full p-4 space-y-4">
          {/* Header Section */}
          <div className="glass-card rounded-xl p-4 fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-white text-lg font-semibold gradient-text">AI Solution</h1>
                <p className="text-white/50 text-xs mt-1">
                  {solutionData ? 'Analysis complete' : 'Processing your screenshots...'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className={`status-dot ${!problemStatementData || !solutionData ? 'processing' : 'active'}`}></div>
              </div>
            </div>
          </div>

          {/* Extra Screenshots Section */}
          {solutionData && extraScreenshots.length > 0 && (
            <div className="glass-card rounded-xl p-4 fade-in">
              <h2 className="text-white text-sm font-medium mb-3">Additional Context</h2>
              <div className="grid grid-cols-2 gap-3">
                  <ScreenshotQueue
                    isLoading={debugProcessing}
                    screenshots={extraScreenshots}
                    onDeleteScreenshot={handleDeleteExtraScreenshot}
                  />
              </div>
            </div>
          )}

          {/* Actions Section */}
          <div className="fade-in">
            <ModernSolutionActions
              hasExtraScreenshots={extraScreenshots.length > 0}
            />
          </div>

          {/* Main Content */}
          <div className="space-y-4">
            {!solutionData ? (
                  <>
                    <ContentSection
                      title="Problem Statement"
                      content={problemStatementData?.problem_statement}
                      isLoading={!problemStatementData}
                    />
                    {problemStatementData && (
                  <div className="glass-card rounded-xl p-6 text-center fade-in">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin"></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-white text-sm font-medium">Generating solution...</p>
                        <p className="text-white/50 text-xs">
                          AI is analyzing your problem
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
                  <>
                    <ContentSection
                  title="AI Approach & Insights"
                      content={
                        thoughtsData && (
                      <div className="space-y-2">
                              {thoughtsData.map((thought, index) => (
                                <div
                                  key={index}
                            className="flex items-start gap-3 p-3 glass-panel-dark rounded-lg slide-in-right"
                            style={{ animationDelay: `${index * 0.1}s` }}
                                >
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-semibold">
                              {index + 1}
                            </div>
                            <div className="text-sm text-gray-100">{thought}</div>
                          </div>
                        ))}
                          </div>
                        )
                      }
                      isLoading={!thoughtsData}
                    />

                    <SolutionSection
                  title="Solution Code"
                      content={solutionData}
                      isLoading={!solutionData}
                      currentLanguage={currentLanguage}
                    />

                    <ComplexitySection
                      timeComplexity={timeComplexityData}
                      spaceComplexity={spaceComplexityData}
                      isLoading={!timeComplexityData || !spaceComplexityData}
                    />

                    {/* Error Feedback Section */}
                <div className="glass-card rounded-xl p-4 fade-in">
                    <ErrorFeedback
                      onSubmit={async (errorFeedback) => {
                        const result = await window.electronAPI.submitErrorFeedback(errorFeedback, false)
                        if (!result.success) {
                          throw new Error(result.error || "Failed to submit error feedback")
                        }
                      }}
                      isProcessing={regeneratingSolution}
                    />
                </div>
                  </>
                )}
        </div>
      </div>
      )}
    </>
  );
}

export default Solutions
