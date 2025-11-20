import React from "react";
import { Camera, RotateCcw, RotateCcw as ResetIcon } from "lucide-react";
import { useToast } from "../../contexts/toast";

interface ModernSolutionActionsProps {
  hasExtraScreenshots: boolean;
}

export function ModernSolutionActions({
  hasExtraScreenshots,
}: ModernSolutionActionsProps) {
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

  const handleDebug = async () => {
    if (!hasExtraScreenshots) return;
    
    try {
      const result = await window.electronAPI.triggerProcessScreenshots();
      if (!result.success) {
        showToast("Error", "Failed to debug", "error");
      }
    } catch (error) {
      console.error("Error debugging:", error);
      showToast("Error", "Failed to debug", "error");
    }
  };

  const handleReset = async () => {
    try {
      const result = await window.electronAPI.triggerReset();
      if (!result.success) {
        showToast("Error", "Failed to reset", "error");
      }
    } catch (error) {
      console.error("Error resetting:", error);
      showToast("Error", "Failed to reset", "error");
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* Take Screenshot Button */}
      <button
        onClick={handleTakeScreenshot}
        className="flex-1 min-w-[140px] glass-card rounded-xl p-3 hover:scale-[1.02] transition-all duration-200 modern-button group"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
            <Camera className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-white text-xs font-semibold">Screenshot</div>
            <div className="text-white/50 text-[10px]">⌘+H</div>
          </div>
        </div>
      </button>

      {/* Debug Button */}
      <button
        onClick={handleDebug}
        disabled={!hasExtraScreenshots}
        className={`flex-1 min-w-[140px] rounded-xl p-3 transition-all duration-200 modern-button group ${
          !hasExtraScreenshots
            ? "glass-card opacity-50 cursor-not-allowed"
            : "gradient-accent-green hover:scale-[1.02] hover:shadow-lg"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            !hasExtraScreenshots ? "bg-white/10" : "bg-white/20"
          }`}>
            <RotateCcw className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-white text-xs font-semibold">Debug</div>
            <div className="text-white/70 text-[10px]">⌘+Enter</div>
          </div>
        </div>
      </button>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="glass-card rounded-xl p-3 hover:scale-[1.02] transition-all duration-200 modern-button group"
      >
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
            <ResetIcon className="w-4 h-4 text-red-400" />
          </div>
        </div>
      </button>
    </div>
  );
}

