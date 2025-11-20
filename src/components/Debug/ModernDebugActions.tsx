import React from "react";
import { Camera, RotateCcw } from "lucide-react";
import { useToast } from "../../contexts/toast";

interface ModernDebugActionsProps {
  screenshotCount: number;
  isProcessing?: boolean;
}

export function ModernDebugActions({
  screenshotCount,
  isProcessing = false,
}: ModernDebugActionsProps) {
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
        disabled={isProcessing}
        className={`flex-1 min-w-[140px] glass-card rounded-xl p-3 transition-all duration-200 modern-button group ${
          isProcessing ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
        }`}
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

      {/* Reset Button */}
      <button
        onClick={handleReset}
        disabled={isProcessing}
        className={`flex-1 min-w-[140px] glass-card rounded-xl p-3 transition-all duration-200 modern-button group ${
          isProcessing ? "opacity-50 cursor-not-allowed" : "hover:scale-[1.02]"
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
            <RotateCcw className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="text-white text-xs font-semibold">Reset</div>
            <div className="text-white/50 text-[10px]">⌘+R</div>
          </div>
        </div>
      </button>
    </div>
  );
}

