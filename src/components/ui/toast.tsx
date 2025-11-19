import * as React from "react"
import * as ToastPrimitive from "@radix-ui/react-toast"
import { cn } from "../../lib/utils"
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react"

const ToastProvider = ToastPrimitive.Provider

export type ToastMessage = {
  title: string
  description: string
  variant: ToastVariant
}

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-3 md:max-w-[380px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitive.Viewport.displayName

type ToastVariant = "neutral" | "success" | "error"

interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant
  swipeDirection?: "right" | "left" | "up" | "down"
}

const toastVariants: Record<
  ToastVariant,
  { icon: React.ReactNode; bgColor: string; borderColor: string; iconBg: string }
> = {
  neutral: {
    icon: <Info className="h-4 w-4 text-blue-400" />,
    bgColor: "bg-slate-900/95",
    borderColor: "border-blue-500/50",
    iconBg: "bg-blue-500/20"
  },
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    bgColor: "bg-slate-900/95",
    borderColor: "border-green-500/50",
    iconBg: "bg-green-500/20"
  },
  error: {
    icon: <AlertCircle className="h-4 w-4 text-red-400" />,
    bgColor: "bg-slate-900/95",
    borderColor: "border-red-500/50",
    iconBg: "bg-red-500/20"
  }
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant = "neutral", ...props }, ref) => {
  const [progress, setProgress] = React.useState(100);

  React.useEffect(() => {
    const duration = 5000; // 5 seconds
    const interval = 50; // Update every 50ms
    const decrement = (100 / duration) * interval;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - decrement;
        return next <= 0 ? 0 : next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <ToastPrimitive.Root
      ref={ref}
      duration={5000}
      className={cn(
        "group pointer-events-auto relative flex flex-col w-full overflow-hidden rounded-xl backdrop-blur-xl shadow-2xl",
        toastVariants[variant].bgColor,
        "animate-in slide-in-from-right-full fade-in duration-300",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={cn(
          "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
          toastVariants[variant].iconBg
        )}>
          {toastVariants[variant].icon}
        </div>
        <div className="flex-1 pt-0.5">{props.children}</div>
        <ToastPrimitive.Close className="flex-shrink-0 rounded-lg p-1.5 text-white/50 transition-all hover:text-white hover:bg-white/10">
          <X className="h-4 w-4" />
        </ToastPrimitive.Close>
      </div>
      {/* Progress Bar */}
      <div className="h-1 w-full bg-white/10">
        <div 
          className={cn(
            "h-full transition-all duration-50 ease-linear",
            variant === "success" ? "bg-green-500" : 
            variant === "error" ? "bg-red-500" : "bg-blue-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </ToastPrimitive.Root>
  );
})
Toast.displayName = ToastPrimitive.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "text-[0.65rem] font-medium text-zinc-600 hover:text-zinc-900",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitive.Action.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold text-white", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitive.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-xs text-white/70 mt-1", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitive.Description.displayName

export type { ToastProps, ToastVariant }
export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastAction,
  ToastTitle,
  ToastDescription
}
