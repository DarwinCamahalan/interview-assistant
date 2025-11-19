import { globalShortcut, app } from "electron"
import { IShortcutsHelperDeps } from "./main"
import { configHelper } from "./ConfigHelper"

export class ShortcutsHelper {
  private deps: IShortcutsHelperDeps
  private registeredShortcuts: string[] = []

  constructor(deps: IShortcutsHelperDeps) {
    this.deps = deps
  }

  public unregisterAllShortcuts(): void {
    this.registeredShortcuts.forEach(shortcut => {
      try {
        globalShortcut.unregister(shortcut)
      } catch (error) {
        console.error(`Failed to unregister shortcut ${shortcut}:`, error)
      }
    })
    this.registeredShortcuts = []
  }

  private adjustOpacity(delta: number): void {
    const mainWindow = this.deps.getMainWindow();
    if (!mainWindow) return;
    
    let currentOpacity = mainWindow.getOpacity();
    let newOpacity = Math.max(0.1, Math.min(1.0, currentOpacity + delta));
    console.log(`Adjusting opacity from ${currentOpacity} to ${newOpacity}`);
    
    mainWindow.setOpacity(newOpacity);
    
    // Save the opacity setting to config without re-initializing the client
    try {
      const config = configHelper.loadConfig();
      config.opacity = newOpacity;
      configHelper.saveConfig(config);
    } catch (error) {
      console.error('Error saving opacity to config:', error);
    }
    
    // If we're making the window visible, also make sure it's shown and interaction is enabled
    if (newOpacity > 0.1 && !this.deps.isVisible()) {
      this.deps.toggleMainWindow();
    }
  }

  public registerGlobalShortcuts(): void {
    // Unregister all existing shortcuts first
    this.unregisterAllShortcuts()

    // Load shortcuts from config
    const config = configHelper.loadConfig()
    const shortcuts = config.shortcuts || {
      takeScreenshot: 'CommandOrControl+H',
      processQueue: 'CommandOrControl+Enter',
      toggleWindow: 'CommandOrControl+B',
      resetView: 'CommandOrControl+R',
      deleteLastScreenshot: 'CommandOrControl+L',
    }

    // Register take screenshot
    try {
      globalShortcut.register(shortcuts.takeScreenshot, async () => {
        const mainWindow = this.deps.getMainWindow()
        if (mainWindow) {
          console.log("Taking screenshot...")
          try {
            const screenshotPath = await this.deps.takeScreenshot()
            const preview = await this.deps.getImagePreview(screenshotPath)
            mainWindow.webContents.send("screenshot-taken", {
              path: screenshotPath,
              preview
            })
          } catch (error) {
            console.error("Error capturing screenshot:", error)
          }
        }
      })
      this.registeredShortcuts.push(shortcuts.takeScreenshot)
    } catch (error) {
      console.error(`Failed to register takeScreenshot shortcut:`, error)
    }

    // Register process queue
    try {
      globalShortcut.register(shortcuts.processQueue, async () => {
        await this.deps.processingHelper?.processScreenshots()
      })
      this.registeredShortcuts.push(shortcuts.processQueue)
    } catch (error) {
      console.error(`Failed to register processQueue shortcut:`, error)
    }

    // Register reset view
    try {
      globalShortcut.register(shortcuts.resetView, () => {
        console.log(
          "Reset pressed. Canceling requests and resetting queues..."
        )

        // Cancel ongoing API requests
        this.deps.processingHelper?.cancelOngoingRequests()

        // Clear both screenshot queues
        this.deps.clearQueues()

        console.log("Cleared queues.")

        // Update the view state to 'queue'
        this.deps.setView("queue")

        // Notify renderer process to switch view to 'queue'
        const mainWindow = this.deps.getMainWindow()
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("reset-view")
          mainWindow.webContents.send("reset")
        }
      })
      this.registeredShortcuts.push(shortcuts.resetView)
    } catch (error) {
      console.error(`Failed to register resetView shortcut:`, error)
    }

    // Register toggle window
    try {
      globalShortcut.register(shortcuts.toggleWindow, () => {
        console.log("Toggle window pressed.")
        this.deps.toggleMainWindow()
      })
      this.registeredShortcuts.push(shortcuts.toggleWindow)
    } catch (error) {
      console.error(`Failed to register toggleWindow shortcut:`, error)
    }

    // Register delete last screenshot
    try {
      globalShortcut.register(shortcuts.deleteLastScreenshot, () => {
        console.log("Delete last screenshot pressed.")
        const mainWindow = this.deps.getMainWindow()
        if (mainWindow) {
          mainWindow.webContents.send("delete-last-screenshot")
        }
      })
      this.registeredShortcuts.push(shortcuts.deleteLastScreenshot)
    } catch (error) {
      console.error(`Failed to register deleteLastScreenshot shortcut:`, error)
    }

    // New shortcuts for moving the window
    globalShortcut.register("CommandOrControl+Left", () => {
      console.log("Command/Ctrl + Left pressed. Moving window left.")
      this.deps.moveWindowLeft()
    })

    globalShortcut.register("CommandOrControl+Right", () => {
      console.log("Command/Ctrl + Right pressed. Moving window right.")
      this.deps.moveWindowRight()
    })

    globalShortcut.register("CommandOrControl+Down", () => {
      console.log("Command/Ctrl + down pressed. Moving window down.")
      this.deps.moveWindowDown()
    })

    globalShortcut.register("CommandOrControl+Up", () => {
      console.log("Command/Ctrl + Up pressed. Moving window Up.")
      this.deps.moveWindowUp()
    })

    // Register quit (always CommandOrControl+Q)
    try {
      globalShortcut.register("CommandOrControl+Q", () => {
        console.log("Command/Ctrl + Q pressed. Quitting application.")
        app.quit()
      })
      this.registeredShortcuts.push("CommandOrControl+Q")
    } catch (error) {
      console.error(`Failed to register quit shortcut:`, error)
    }

    console.log(`Registered shortcuts:`, this.registeredShortcuts)
    
    // Unregister shortcuts when quitting
    app.on("will-quit", () => {
      globalShortcut.unregisterAll()
    })
  }
}
