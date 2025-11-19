import SubscribedApp from "./_pages/SubscribedApp"
import { UpdateNotification } from "./components/UpdateNotification"
import {
  QueryClient,
  QueryClientProvider
} from "@tanstack/react-query"
import { useEffect, useState, useCallback } from "react"
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "./components/ui/toast"
import { ToastContext } from "./contexts/toast"
import { WelcomeScreen } from "./components/WelcomeScreen"
import { SettingsDialog } from "./components/Settings/SettingsDialog"
import { Sidebar } from "./components/Navigation/Sidebar"
import { TopBar } from "./components/Navigation/TopBar"

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: Infinity,
      retry: 1,
      refetchOnWindowFocus: false
    },
    mutations: {
      retry: 1
    }
  }
})

// Root component that provides the QueryClient
function App() {
  const [toastState, setToastState] = useState({
    open: false,
    title: "",
    description: "",
    variant: "neutral" as "neutral" | "success" | "error"
  })
  const [credits, setCredits] = useState<number>(999) // Unlimited credits
  const [currentLanguage, setCurrentLanguage] = useState<string>("python")
  const [isInitialized, setIsInitialized] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(false)
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false)
  // Note: Model selection is now handled via separate extraction/solution/debugging model settings

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentView, setCurrentView] = useState<"queue" | "solutions" | "debug" | "settings">("queue")
  const [screenshotCount, setScreenshotCount] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('dark')

  // Set unlimited credits
  const updateCredits = useCallback(() => {
    setCredits(999) // No credit limit in this version
    window.__CREDITS__ = 999
  }, [])

  // Helper function to safely update language
  const updateLanguage = useCallback((newLanguage: string) => {
    setCurrentLanguage(newLanguage)
    window.__LANGUAGE__ = newLanguage
  }, [])

  // Helper function to mark initialization complete
  const markInitialized = useCallback(() => {
    setIsInitialized(true)
    window.__IS_INITIALIZED__ = true
  }, [])

  // Show toast method
  const showToast = useCallback(
    (
      title: string,
      description: string,
      variant: "neutral" | "success" | "error"
    ) => {
      setToastState({
        open: true,
        title,
        description,
        variant
      })
    },
    []
  )

  // Check for OpenAI API key and prompt if not found
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const hasKey = await window.electronAPI.checkApiKey()
        setHasApiKey(hasKey)
        
        // If no API key is found, show the settings dialog after a short delay
        if (!hasKey) {
          setTimeout(() => {
            setIsSettingsOpen(true)
          }, 1000)
        }
      } catch (error) {
        console.error("Failed to check API key:", error)
      }
    }
    
    if (isInitialized) {
      checkApiKey()
    }
  }, [isInitialized])

  // Initialize dropdown handler
  useEffect(() => {
    if (isInitialized) {
      // Process all types of dropdown elements with a shorter delay
      const timer = setTimeout(() => {
        // Find both native select elements and custom dropdowns
        const selectElements = document.querySelectorAll('select');
        const customDropdowns = document.querySelectorAll('.dropdown-trigger, [role="combobox"], button:has(.dropdown)');
        
        // Enable native selects
        selectElements.forEach(dropdown => {
          dropdown.disabled = false;
        });
        
        // Enable custom dropdowns by removing any disabled attributes
        customDropdowns.forEach(dropdown => {
          if (dropdown instanceof HTMLElement) {
            dropdown.removeAttribute('disabled');
            dropdown.setAttribute('aria-disabled', 'false');
          }
        });
        
        console.log(`Enabled ${selectElements.length} select elements and ${customDropdowns.length} custom dropdowns`);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isInitialized]);

  // Listen for settings dialog open requests
  useEffect(() => {
    const unsubscribeSettings = window.electronAPI.onShowSettings(() => {
      console.log("Show settings dialog requested");
      setIsSettingsOpen(true);
    });
    
    return () => {
      unsubscribeSettings();
    };
  }, []);

  // Initialize basic app state
  useEffect(() => {
    // Load config and set values
    const initializeApp = async () => {
      try {
        // Set unlimited credits
        updateCredits()
        
        // Load config including language and model settings
        const config = await window.electronAPI.getConfig()
        
        // Load language preference
        if (config && config.language) {
          updateLanguage(config.language)
        } else {
          updateLanguage("python")
        }
        
        // Load theme preference
        if (config && config.theme) {
          setCurrentTheme(config.theme)
        }
        
        // Model settings are now managed through the settings dialog
        // and stored in config as extractionModel, solutionModel, and debuggingModel
        
        markInitialized()
      } catch (error) {
        console.error("Failed to initialize app:", error)
        // Fallback to defaults
        updateLanguage("python")
        markInitialized()
      }
    }
    
    initializeApp()

    // Listen for screenshot count updates
    const unsubscribeScreenshots = window.electronAPI.onScreenshotTaken(() => {
      window.electronAPI.getScreenshots().then((screenshots: any[]) => {
        setScreenshotCount(screenshots.length);
      });
    });

    // Listen for processing state changes
    const unsubscribeSolutionStart = window.electronAPI.onSolutionStart(() => {
      setIsProcessing(true);
      setCurrentView("solutions");
    });

    const unsubscribeSolutionSuccessHandler = window.electronAPI.onSolutionSuccess(() => {
      setIsProcessing(false);
    });

    const unsubscribeSolutionError = window.electronAPI.onSolutionError(() => {
      setIsProcessing(false);
    });

    const unsubscribeReset = window.electronAPI.onResetView(() => {
      setCurrentView("queue");
      setScreenshotCount(0);
      setIsProcessing(false);
    });

    // Event listeners for process events
    const onApiKeyInvalid = () => {
      showToast(
        "API Key Invalid",
        "Your OpenAI API key appears to be invalid or has insufficient credits",
        "error"
      )
      setApiKeyDialogOpen(true)
    }

    // Setup API key invalid listener
    window.electronAPI.onApiKeyInvalid(onApiKeyInvalid)

    // Cleanup function
    return () => {
      unsubscribeScreenshots();
      unsubscribeSolutionStart();
      unsubscribeSolutionSuccessHandler();
      unsubscribeSolutionError();
      unsubscribeReset();
      window.electronAPI.removeListener("API_KEY_INVALID", onApiKeyInvalid)
      window.__IS_INITIALIZED__ = false
      setIsInitialized(false)
    }
  }, [updateCredits, updateLanguage, markInitialized, showToast])

  // API Key dialog management
  const handleOpenSettings = useCallback(() => {
    console.log('Opening settings dialog');
    setIsSettingsOpen(true);
  }, []);
  
  const handleCloseSettings = useCallback((open: boolean) => {
    console.log('Settings dialog state changed:', open);
    setIsSettingsOpen(open);
  }, []);

  const handleApiKeySave = useCallback(async (apiKey: string) => {
    try {
      await window.electronAPI.updateConfig({ apiKey })
      setHasApiKey(true)
      showToast("Success", "API key saved successfully", "success")
      
      // Reload app after a short delay to reinitialize with the new API key
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error("Failed to save API key:", error)
      showToast("Error", "Failed to save API key", "error")
    }
  }, [showToast])

  const handleThemeChange = async (theme: string) => {
    setCurrentTheme(theme)
    try {
      await window.electronAPI.updateConfig({ theme })
    } catch (error) {
      console.error('Failed to save theme:', error)
    }
  }

  const getThemeGradient = () => {
    switch (currentTheme) {
      case 'midnight':
        return 'from-[#0d1117] via-[#161b22] to-[#0d1117]'
      case 'forest':
        return 'from-[#0a1f1a] via-[#0f2922] to-[#0a1f1a]'
      case 'crimson':
        return 'from-[#1a0f0f] via-[#2a1515] to-[#1a0f0f]'
      case 'ocean':
        return 'from-[#0a1929] via-[#0f2942] to-[#0a1929]'
      default: // dark - VS Code default dark theme
        return 'from-[#1e1e1e] via-[#1e1e1e] to-[#1e1e1e]'
    }
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <ToastContext.Provider value={{ showToast }}>
          <div className={`relative h-screen w-screen overflow-hidden bg-gradient-to-br ${getThemeGradient()}`}>
            {isInitialized ? (
              hasApiKey ? (
                <div className="flex flex-col h-full">
                  {/* Top Bar */}
                  <TopBar 
                    currentLanguage={currentLanguage}
                    onLanguageChange={updateLanguage}
                  />
                  
                  {/* Main Content Area */}
                  <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 flex-shrink-0">
                      <Sidebar
                        currentView={currentView}
                        onViewChange={setCurrentView}
                        onOpenSettings={() => setCurrentView('settings')}
                        screenshotCount={screenshotCount}
                        isProcessing={isProcessing}
                      />
                    </div>
                    
                    {/* Main Content */}
                    <div className="flex-1 overflow-hidden">
                      <SubscribedApp
                        credits={credits}
                        currentLanguage={currentLanguage}
                        setLanguage={updateLanguage}
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        currentTheme={currentTheme}
                        onThemeChange={handleThemeChange}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <WelcomeScreen onOpenSettings={handleOpenSettings} />
              )
            ) : (
              <div className="h-full w-full flex items-center justify-center glass-panel-dark">
                <div className="flex flex-col items-center gap-4 fade-in">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="w-12 h-12 border-4 border-transparent border-b-blue-500 rounded-full animate-spin absolute top-0 left-0" style={{ animationDirection: 'reverse' }}></div>
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-white font-medium text-sm">
                      Initializing AI Assistant
                    </p>
                    <p className="text-white/50 text-xs">
                      Preparing your interview helper...
                  </p>
                  </div>
                </div>
              </div>
            )}
            <UpdateNotification />
          </div>
          
          {/* Settings Dialog */}
          <SettingsDialog 
            open={isSettingsOpen} 
            onOpenChange={handleCloseSettings} 
          />
          
          <Toast
            open={toastState.open}
            onOpenChange={(open) =>
              setToastState((prev) => ({ ...prev, open }))
            }
            variant={toastState.variant}
            duration={1500}
          >
            <ToastTitle>{toastState.title}</ToastTitle>
            <ToastDescription>{toastState.description}</ToastDescription>
          </Toast>
          <ToastViewport />
        </ToastContext.Provider>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App