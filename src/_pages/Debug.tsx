// Debug.tsx
import { useQuery, useQueryClient } from "@tanstack/react-query"
import React, { useEffect, useRef, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism"
import ScreenshotQueue from "../components/Queue/ScreenshotQueue"
import { ModernDebugActions } from "../components/Debug/ModernDebugActions"
import { Screenshot } from "../types/screenshots"
import { ComplexitySection, ContentSection } from "./Solutions"
import { useToast } from "../contexts/toast"
import { ErrorFeedback } from "../components/shared/ErrorFeedback"

const CodeSection = ({
  title,
  code,
  isLoading,
  currentLanguage
}: {
  title: string
  code: React.ReactNode
  isLoading: boolean
  currentLanguage: string
}) => {
  return (
    <div className="space-y-2">
      <h2 className="text-[13px] font-medium text-white tracking-wide"></h2>
      {isLoading ? (
        <div className="space-y-1.5">
          <div className="mt-4 flex">
            <p className="text-xs bg-gradient-to-r from-gray-300 via-gray-100 to-gray-300 bg-clip-text text-transparent animate-pulse">
              Loading solutions...
            </p>
          </div>
        </div>
      ) : (
        <div className="w-full relative overflow-hidden">
          <div className="overflow-auto">
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
                backgroundColor: "rgba(22, 27, 34, 0.5)",
                height: "auto",
                minHeight: "100px"
              }}
              wrapLongLines={true}
            >
              {code as string}
            </SyntaxHighlighter>
          </div>
        </div>
      )}
    </div>
  )
}

async function fetchScreenshots(): Promise<Screenshot[]> {
  try {
    const existing = await window.electronAPI.getScreenshots()
    console.log("Raw screenshot data in Debug:", existing)
    return (Array.isArray(existing) ? existing : []).map((p) => ({
      id: p.path,
      path: p.path,
      preview: p.preview,
      timestamp: Date.now()
    }))
  } catch (error) {
    console.error("Error loading screenshots:", error)
    throw error
  }
}

interface DebugProps {
  isProcessing: boolean
  setIsProcessing: (isProcessing: boolean) => void
  currentLanguage: string
  setLanguage: (language: string) => void
}

const Debug: React.FC<DebugProps> = ({
  isProcessing,
  setIsProcessing,
  currentLanguage,
  setLanguage
}) => {
  const [regeneratingDebug, setRegeneratingDebug] = useState(false)
  const { showToast } = useToast()

  const { data: screenshots = [], refetch } = useQuery<Screenshot[]>({
    queryKey: ["screenshots"],
    queryFn: fetchScreenshots,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false
  })

  const [newCode, setNewCode] = useState<string | null>(null)
  const [thoughtsData, setThoughtsData] = useState<string[] | null>(null)
  const [timeComplexityData, setTimeComplexityData] = useState<string | null>(
    null
  )
  const [spaceComplexityData, setSpaceComplexityData] = useState<string | null>(
    null
  )
  const [debugAnalysis, setDebugAnalysis] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Try to get the new solution data from cache first
    const newSolution = queryClient.getQueryData(["new_solution"]) as {
      code: string
      debug_analysis: string
      thoughts: string[]
      time_complexity: string
      space_complexity: string
    } | null

    // If we have cached data, set all state variables to the cached data
    if (newSolution) {
      console.log("Found cached debug solution:", newSolution);
      
      if (newSolution.debug_analysis) {
        // Store the debug analysis in its own state variable
        setDebugAnalysis(newSolution.debug_analysis);
        // Set code separately for the code section
        setNewCode(newSolution.code || "// Debug mode - see analysis below");
        
        // Process thoughts/analysis points
        if (newSolution.debug_analysis.includes('\n\n')) {
          const sections = newSolution.debug_analysis.split('\n\n').filter(Boolean);
          // Pick first few sections as thoughts
          setThoughtsData(sections.slice(0, 3));
        } else {
          setThoughtsData(["Debug analysis based on your screenshots"]);
        }
      } else {
        // Fallback to code or default
        setNewCode(newSolution.code || "// No analysis available");
        setThoughtsData(newSolution.thoughts || ["Debug analysis based on your screenshots"]);
      }
      setTimeComplexityData(newSolution.time_complexity || "N/A - Debug mode")
      setSpaceComplexityData(newSolution.space_complexity || "N/A - Debug mode")
      setIsProcessing(false)
    }

    // Set up event listeners
    const cleanupFunctions = [
      window.electronAPI.onScreenshotTaken(() => refetch()),
      window.electronAPI.onResetView(() => refetch()),
      window.electronAPI.onDebugSuccess((data: {
        code: string
        debug_analysis: string
        thoughts: string[]
        time_complexity: string
        space_complexity: string
      }) => {
        console.log("Debug success event received with data:", data);
        queryClient.setQueryData(["new_solution"], data);
        
        // Also update local state for immediate rendering
        if (data.debug_analysis) {
          // Store the debug analysis in its own state variable
          setDebugAnalysis(data.debug_analysis);
          // Set code separately for the code section
          setNewCode(data.code || "// Debug mode - see analysis below");
          
          // Process thoughts/analysis points
          if (data.debug_analysis.includes('\n\n')) {
            const sections = data.debug_analysis.split('\n\n').filter(Boolean);
            // Pick first few sections as thoughts
            setThoughtsData(sections.slice(0, 3));
          } else if (data.debug_analysis.includes('\n')) {
            // Try to find bullet points or numbered lists
            const lines = data.debug_analysis.split('\n');
            const bulletPoints = lines.filter((line: string) => 
              line.trim().match(/^[\d*\-•]+\s/) || 
              line.trim().match(/^[A-Z][\d\.\)\:]/) ||
              line.includes(':') && line.length < 100
            );
            
            if (bulletPoints.length > 0) {
              setThoughtsData(bulletPoints.slice(0, 5));
            } else {
              setThoughtsData(["Debug analysis based on your screenshots"]);
            }
          } else {
            setThoughtsData(["Debug analysis based on your screenshots"]);
          }
        } else {
          // Fallback to code or default
          setNewCode(data.code || "// No analysis available");
          setThoughtsData(data.thoughts || ["Debug analysis based on your screenshots"]);
          setDebugAnalysis(null);
        }
        setTimeComplexityData(data.time_complexity || "N/A - Debug mode");
        setSpaceComplexityData(data.space_complexity || "N/A - Debug mode");
        
        setIsProcessing(false);
      }),
      
      window.electronAPI.onDebugStart(() => {
        setIsProcessing(true)
      }),
      window.electronAPI.onDebugError((error: string) => {
        showToast(
          "Processing Failed",
          "There was an error debugging your code.",
          "error"
        )
        setIsProcessing(false)
        console.error("Processing error:", error)
      }),
      window.electronAPI.onRegenerateDebugStart(() => {
        console.log("Regenerate debug started");
        setRegeneratingDebug(true);
        // Don't clear existing data - keep it visible while regenerating
        // The data will be updated when the new results arrive
      }),
      window.electronAPI.onRegenerateDebugSuccess((data: {
        code: string
        debug_analysis: string
        thoughts: string[]
        time_complexity: string
        space_complexity: string
      }) => {
        console.log("Regenerate debug success:", data);
        queryClient.setQueryData(["new_solution"], data);
        
        if (data.debug_analysis) {
          setDebugAnalysis(data.debug_analysis);
          setNewCode(data.code || "// Debug mode - see analysis below");
          if (data.debug_analysis.includes('\n\n')) {
            const sections = data.debug_analysis.split('\n\n').filter(Boolean);
            setThoughtsData(sections.slice(0, 3));
          } else {
            setThoughtsData(["Debug analysis based on error feedback"]);
          }
        } else {
          setNewCode(data.code || "// No analysis available");
          setThoughtsData(data.thoughts || ["Debug analysis based on error feedback"]);
          setDebugAnalysis(null);
        }
        setTimeComplexityData(data.time_complexity || "N/A - Debug mode");
        setSpaceComplexityData(data.space_complexity || "N/A - Debug mode");
        setRegeneratingDebug(false);
        showToast("Success", "Debug analysis regenerated successfully", "success");
      }),
      window.electronAPI.onRegenerateDebugError((error: string) => {
        console.error("Regenerate debug error:", error);
        showToast("Error", error || "Failed to regenerate debug", "error");
        setRegeneratingDebug(false);
        // Data remains unchanged since we didn't clear it on start
      })
    ]

    // Removed updateDimensions() call to allow window to remain resizable
    // and prevent forced dimension changes when navigating to Debug page

    return () => {
      cleanupFunctions.forEach((cleanup) => cleanup())
    }
  }, [queryClient, setIsProcessing])

  const handleDeleteExtraScreenshot = async (index: number) => {
    const screenshotToDelete = screenshots[index]

    try {
      const response = await window.electronAPI.deleteScreenshot(
        screenshotToDelete.path
      )

      if (response.success) {
        refetch()
      } else {
        console.error("Failed to delete extra screenshot:", response.error)
      }
    } catch (error) {
      console.error("Error deleting extra screenshot:", error)
    }
  }

  return (
    <div ref={contentRef} className="relative overflow-y-auto h-full p-4 space-y-4">
      {/* Header Section */}
      <div className="glass-card rounded-xl p-4 fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-white text-lg font-semibold gradient-text">Debug Analysis</h1>
            <p className="text-white/50 text-xs mt-1">
              {debugAnalysis ? 'Debug complete' : 'Processing your code...'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`status-dot ${isProcessing ? 'processing' : 'active'}`}></div>
          </div>
        </div>
      </div>

      {/* Screenshot queue */}
      {screenshots.length > 0 && (
        <div className="glass-card rounded-xl p-4 fade-in">
          <h2 className="text-white text-sm font-medium mb-3">Captured Screenshots</h2>
          <div className="grid grid-cols-2 gap-3">
            <ScreenshotQueue
              screenshots={screenshots}
              onDeleteScreenshot={handleDeleteExtraScreenshot}
              isLoading={isProcessing}
            />
          </div>
        </div>
      )}

      {/* Actions Section */}
      <div className="fade-in">
        <ModernDebugActions
          screenshotCount={screenshots.length}
          isProcessing={isProcessing}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-4">
            {/* Thoughts Section */}
            <div className="glass-card rounded-xl p-4 fade-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-gradient-accent rounded-full"></div>
                <h2 className="text-sm font-semibold text-white tracking-wide">What I Changed</h2>
              </div>
              {!thoughtsData ? (
                <div className="flex items-center gap-3 p-4">
                  <div className="shimmer w-full h-20 rounded-lg"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {thoughtsData.map((thought, index) => {
                    // Clean up the thought text by removing leading numbers, asterisks, hyphens, etc.
                    let cleanedThought = thought
                      .replace(/^\d+[\.\)]\s*[\*\-•]?\s*/g, '')
                      .replace(/^[\*\-•]\s+/g, '')
                      .trim();
                    
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 glass-panel-dark rounded-lg slide-in-right"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-semibold">
                          {index + 1}
                        </div>
                        <div className="text-sm text-gray-100">{cleanedThought}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Code Section */}
            <div className="glass-card rounded-xl overflow-hidden fade-in">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-accent-green rounded-full"></div>
                  <h2 className="text-sm font-semibold text-white tracking-wide">Original Code</h2>
                </div>
                {newCode && (
                  <button
                    onClick={() => {
                      if (typeof newCode === "string") {
                        navigator.clipboard.writeText(newCode).then(() => {
                          const button = document.activeElement as HTMLButtonElement;
                          const originalText = button.innerHTML;
                          button.innerHTML = `
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                            <span>Copied!</span>
                          `;
                          setTimeout(() => {
                            button.innerHTML = originalText;
                          }, 2000);
                        });
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-200 modern-button"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                )}
              </div>
              {!newCode ? (
                <div className="p-4">
                  <div className="shimmer w-full h-64 rounded-lg"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="overflow-auto max-h-96">
                    <CodeSection
                      title=""
                      code={newCode}
                      isLoading={false}
                      currentLanguage={currentLanguage}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* Debug Analysis Section */}
            <div className="glass-card rounded-xl p-4 fade-in">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1 h-5 bg-gradient-accent rounded-full"></div>
                <h2 className="text-sm font-semibold text-white tracking-wide">Analysis & Improvements</h2>
              </div>
              {!debugAnalysis ? (
                <div className="flex items-center gap-3 p-4">
                  <div className="shimmer w-full h-32 rounded-lg"></div>
                </div>
              ) : (
                <div className="text-[13px] leading-[1.4] text-gray-100 whitespace-pre-wrap overflow-auto">
                  {/* Process the debug analysis text by sections and lines */}
                  {(() => {
                    // First identify key sections based on common patterns in the debug output
                    interface Section {
                      title: string
                      content: string[]
                    }
                    const sections: Section[] = [];
                    let currentSection = { title: '', content: [] as string[] };
                    
                    // Split by possible section headers (### or ##)
                    const mainSections = debugAnalysis.split(/(?=^#{1,3}\s|^\*\*\*|^\s*[A-Z][\w\s]+\s*$)/m);
                    
                    // Filter out empty sections and process each one
                    mainSections.filter(Boolean).forEach(sectionText => {
                      // First line might be a header
                      const lines = sectionText.split('\n');
                      let title = '';
                      let startLineIndex = 0;
                      
                      // Check if first line is a header
                      if (lines[0] && (lines[0].startsWith('#') || lines[0].startsWith('**') || 
                          lines[0].match(/^[A-Z][\w\s]+$/) || lines[0].includes('Issues') || 
                          lines[0].includes('Improvements') || lines[0].includes('Optimizations'))) {
                        title = lines[0].replace(/^#+\s*|\*\*/g, '');
                        startLineIndex = 1;
                      }
                      
                      // Add the section
                      sections.push({
                        title,
                        content: lines.slice(startLineIndex).filter(Boolean)
                      });
                    });
                    
                    // Render the processed sections
                    return sections.map((section: Section, sectionIndex: number) => (
                      <div key={sectionIndex} className="mb-6">
                        {section.title && (
                          <div className="font-bold text-white/90 text-[14px] mb-2 pb-1 border-b border-white/10">
                            {section.title}
                          </div>
                        )}
                        <div className="pl-1">
                          {section.content.map((line: string, lineIndex: number) => {
                            // Handle code blocks - detect full code blocks
                            if (line.trim().startsWith('```')) {
                              // If we find the start of a code block, collect all lines until the end
                              if (line.trim() === '```' || line.trim().startsWith('```')) {
                                // Find end of this code block
                                const codeBlockEndIndex = section.content.findIndex(
                                  (l: string, i: number) => i > lineIndex && l.trim() === '```'
                                );
                                
                                if (codeBlockEndIndex > lineIndex) {
                                  // Extract language if specified
                                  const langMatch = line.trim().match(/```(\w+)/);
                                  const language = langMatch ? langMatch[1] : '';
                                  
                                  // Get the code content
                                  const codeContent = section.content
                                    .slice(lineIndex + 1, codeBlockEndIndex)
                                    .join('\n');
                                  
                                  // Skip ahead in our loop
                                  lineIndex = codeBlockEndIndex;
                                  
                                  return (
                                    <div key={lineIndex} className="font-mono text-xs bg-black/50 p-3 my-2 rounded overflow-x-auto">
                                      {codeContent}
                                    </div>
                                  );
                                }
                              }
                            }
                            
                            // Handle bullet points
                            if (line.trim().match(/^[\-*•]\s/) || line.trim().match(/^\d+\.\s/)) {
                              return (
                                <div key={lineIndex} className="flex items-start gap-2 my-1.5">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400/80 mt-2 shrink-0" />
                                  <div className="flex-1">
                                    {line.replace(/^[\-*•]\s|^\d+\.\s/, '')}
                                  </div>
                                </div>
                              );
                            }
                            
                            // Handle inline code
                            if (line.includes('`')) {
                              const parts = line.split(/(`[^`]+`)/g);
                              return (
                                <div key={lineIndex} className="my-1.5">
                                  {parts.map((part: string, partIndex: number) => {
                                    if (part.startsWith('`') && part.endsWith('`')) {
                                      return <span key={partIndex} className="font-mono bg-black/30 px-1 py-0.5 rounded">{part.slice(1, -1)}</span>;
                                    }
                                    return <span key={partIndex}>{part}</span>;
                                  })}
                                </div>
                              );
                            }
                            
                            // Handle sub-headers
                            if (line.trim().match(/^#+\s/) || (line.trim().match(/^[A-Z][\w\s]+:/) && line.length < 60)) {
                              return (
                                <div key={lineIndex} className="font-semibold text-white/80 mt-3 mb-1">
                                  {line.replace(/^#+\s+/, '')}
                                </div>
                              );
                            }
                            
                            // Regular text
                            return <div key={lineIndex} className="my-1.5">{line}</div>;
                          })}
                        </div>
                      </div>
                    ));
                  })()} 
                </div>
              )}
            </div>

            {/* Complexity Section */}
            <ComplexitySection
              timeComplexity={timeComplexityData}
              spaceComplexity={spaceComplexityData}
              isLoading={!timeComplexityData || !spaceComplexityData}
            />

            {/* Error Feedback Section */}
            <div className="glass-card rounded-xl p-4 fade-in">
              <ErrorFeedback
                onSubmit={async (errorFeedback) => {
                  const result = await window.electronAPI.submitErrorFeedback(errorFeedback, true)
                  if (!result.success) {
                    throw new Error(result.error || "Failed to submit error feedback")
                  }
                }}
                isProcessing={regeneratingDebug}
                placeholder="Paste error message, incorrect output, or additional issues here..."
              />
            </div>
          </div>
    </div>
  )
}

export default Debug
