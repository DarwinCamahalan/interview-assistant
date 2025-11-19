import React from "react";
import { Camera, Play } from "lucide-react";
import { useToast } from "../../contexts/toast";

interface ModernQueueActionsProps {
  screenshotCount: number;
}

export function ModernQueueActions({
  screenshotCount,
}: ModernQueueActionsProps) {
  const { showToast } = useToast();

  const handleTakeScreenshot = async () => {
    try {
      const result = await window.electronAPI.triggerScreenshot();
      if (!result.success) {
        showToast("Error", "Failed to take screenshot", "error");
      }
    } catch (error) {
      console.error("Error taking screenshot:", error);
      showToast("Error", "Failed to take screenshot", "error");
    }
  };

  const handleProcessQueue = async () => {
    if (screenshotCount === 0) return;
    
    try {
      const result = await window.electronAPI.triggerProcessScreenshots();
      if (!result.success) {
        showToast("Error", "Failed to process screenshots", "error");
      }
    } catch (error) {
      console.error("Error processing screenshots:", error);
      showToast("Error", "Failed to process screenshots", "error");
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Take Screenshot Button */}
      <button
        onClick={handleTakeScreenshot}
        className="flex-1 min-w-[180px] glass-card rounded-xl p-4 hover:scale-[1.02] transition-all duration-200 modern-button group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
            <Camera className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-white text-sm font-semibold">Take Screenshot</div>
            <div className="text-white/50 text-xs mt-0.5">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">⌘+H</kbd>
            </div>
          </div>
        </div>
      </button>

      {/* Process Queue Button */}
      <button
        onClick={handleProcessQueue}
        disabled={screenshotCount === 0}
        className={`flex-1 min-w-[180px] rounded-xl p-4 transition-all duration-200 modern-button group ${
          screenshotCount === 0
            ? "glass-card opacity-50 cursor-not-allowed"
            : "gradient-accent hover:scale-[1.02] hover:shadow-lg"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
            screenshotCount === 0 ? "bg-white/10" : "bg-white/20"
          }`}>
            <Play className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-white text-sm font-semibold">
              {screenshotCount === 0 ? "Need Screenshots" : "Generate Solution"}
            </div>
            <div className="text-white/70 text-xs mt-0.5">
              <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">⌘+Enter</kbd>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}

