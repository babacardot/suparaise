import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastProgressBar,
  ToastVariant,
} from "@/components/ui/toast";
import { useToast } from "@/lib/hooks/use-toast";
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  InfoIcon,
  Key,
  Rabbit,
} from "lucide-react";
import { cn } from "@/lib/actions/utils";

const styles = `
@keyframes iconSlideIn {
  0% {
    transform: translateX(-10px) scale(0.9);
    opacity: 0;
  }
  100% {
    transform: translateX(0) scale(1);
    opacity: 1;
  }
}
`;

// We accept string type to handle potential 'notice' value
function getToastIcon(variant: string) {
  switch (variant) {
    case "destructive":
      return (
        <XCircle
          className={cn(
            "h-4 w-4 text-red-700 dark:text-red-300",
            "animate-[iconSlideIn_0.3s_ease-in-out]",
          )}
        />
      );
    case "info":
      return (
        <AlertCircle
          className={cn(
            "h-4 w-4 text-blue-700 dark:text-blue-300",
            "animate-[iconSlideIn_0.3s_ease-in-out]",
          )}
        />
      );
    case "notice": // Fallback to info style for backwards compatibility
      return (
        <InfoIcon
          className={cn(
            "h-4 w-4 text-blue-700 dark:text-blue-300",
            "animate-[iconSlideIn_0.3s_ease-in-out]",
          )}
        />
      );
    case "api":
      return (
        <Key
          className={cn(
            "h-4 w-4 text-cyan-700 dark:text-cyan-300",
            "animate-[iconSlideIn_0.3s_ease-in-out]",
          )}
        />
      );
    case "success":
      return (
        <CheckCircle2
          className={cn(
            "h-4 w-4 text-green-700 dark:text-green-300",
            "animate-[iconSlideIn_0.3s_ease-in-out]",
          )}
        />
      );
    default:
      return (
        <Rabbit
          className={cn(
            "h-4 w-4 text-orange-700 dark:text-orange-300",
            "animate-[iconSlideIn_0.3s_ease-in-out]",
          )}
        />
      );
  }
}

// Helper function to safely map any string variant to a valid ToastVariant
function mapToValidVariant(variantStr: string): ToastVariant {
  // Check if the provided variant is already a valid ToastVariant
  if (
    ["default", "destructive", "info", "success", "api"].includes(variantStr)
  ) {
    return variantStr as ToastVariant;
  }

  // Handle special cases
  if (variantStr === "notice") {
    return "info";
  }

  // Default fallback
  return "default";
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <style>{styles}</style>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant = "default",
        ...props
      }) {
        // Safely convert to a valid ToastVariant
        const safeVariant = mapToValidVariant(variant);

        return (
          <Toast key={id} {...props} variant={safeVariant}>
            <div className="flex items-start gap-3 min-h-[2rem] z-9999 w-fit">
              <div className="flex-shrink-0 flex items-center self-stretch pl-1">
                {getToastIcon(variant)}
              </div>
              <div className="grid gap-1 py-2 min-w-[200px] max-w-[320px]">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-left">
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
            <ToastProgressBar variant={safeVariant} />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
