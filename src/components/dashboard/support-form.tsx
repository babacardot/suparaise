import { useState, useRef, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, CheckCircle, FileIcon, X, ArrowRight } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/lib/hooks/use-user-context";
import { useTranslation } from "react-i18next";
import { ButtonExpand } from "@/components/design/button-expand";
import { useToast } from "@/lib/hooks/use-toast";
import { SidebarContext } from "@/lib/contexts/sidebar-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const categories = [
  { value: "account", label: "portal.support_form.category.account" },
  { value: "billing", label: "portal.support_form.category.billing" },
  { value: "technical", label: "portal.support_form.category.technical" },
  { value: "other", label: "portal.support_form.category.other" },
];

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
}

const CustomSelect = ({ value, onChange, options }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  return (
    <div ref={selectRef} className="relative">
      <div
        className={`rounded-sm bg-background dark:bg-[#121317] text-foreground p-3 cursor-pointer border border-border hover:border-foreground/20 transition-colors duration-200 flex items-center justify-between ${isOpen ? "border-foreground/20" : ""}`}
        onMouseDown={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-medium">
          {value
            ? t(
                options.find((opt: SelectOption) => opt.value === value)
                  ?.label || "",
              )
            : t("portal.support_form.category.label")}
        </span>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
      {isOpen && (
        <div className="rounded-sm absolute top-full left-0 w-full bg-background dark:bg-[#121317] border border-border mt-1 z-10 shadow-lg">
          {options.map((option: SelectOption) => (
            <div
              key={option.value}
              className="p-3 hover:bg-accent dark:hover:bg-accent/10 cursor-pointer text-sm font-medium transition-colors duration-150"
              onMouseDown={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {t(option.label)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ModalSupportFormProps {
  isOpen: boolean;
  onClose: () => void;
  contextData?: {
    linkId?: string;
    subject?: string;
    productId?: string;
    planId?: string;
    transactionId?: string;
    customerId?: string;
    webhookId?: string;
    payoutId?: string;
  };
}

export default function ModalSupportForm({
  isOpen,
  onClose,
  contextData,
}: ModalSupportFormProps) {
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  const { t } = useTranslation();
  const { toast } = useToast();
  const sidebarContext = useContext(SidebarContext);

  // Initialize message with context data if provided
  useEffect(() => {
    if (contextData) {
      let messagePrefix = "";

      if (contextData.productId) {
        messagePrefix = `Product ID: ${contextData.productId}\n\n`;
      } else if (contextData.planId) {
        messagePrefix = `Plan ID: ${contextData.planId}\n\n`;
      } else if (contextData.transactionId) {
        messagePrefix = `Transaction ID: ${contextData.transactionId}\n\n`;
      } else if (contextData.customerId) {
        messagePrefix = `Customer ID: ${contextData.customerId}\n\n`;
      } else if (contextData.webhookId) {
        messagePrefix = `Webhook ID: ${contextData.webhookId}\n\n`;
      } else if (contextData.linkId) {
        messagePrefix = `Payment Link ID: ${contextData.linkId}\n\n`;
      } else if (contextData.payoutId) {
        messagePrefix = `Payout ID: ${contextData.payoutId}\n\n`;
      }

      setMessage(`${messagePrefix}Issue description: `);
    }
  }, [contextData]);

  const handleSubmit = async () => {
    if (!user) {
      console.error("User not found");
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to identify user. Please try again later.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl: string | null = null;

      if (image) {
        // Sanitize the filename
        const sanitizedFileName = image.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const fileName = `${user.id}/${Date.now()}_${sanitizedFileName}`;

        const { error: uploadError } = await supabase.storage
          .from("support_request_images")
          .upload(fileName, image);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast({
            variant: "destructive",
            title: "Upload Error",
            description: "Failed to upload image. Please try again.",
          });
          setIsSubmitting(false);
          return;
        }

        const { data: urlData } = await supabase.storage
          .from("support_request_images")
          .getPublicUrl(fileName);

        imageUrl = urlData.publicUrl;
      }

      // Get organization ID from the sidebar context
      const organizationId =
        sidebarContext?.sidebarData?.organizationId || user.id;

      const { data: supportRequestData, error: supportRequestError } =
        await supabase.rpc("create_support_request", {
          p_merchant_id: user.id,
          p_organization_id: organizationId,
          p_category: category as
            | "billing"
            | "other"
            | "account"
            | "technical"
            | "feature",
          p_message: message,
          p_image_url: imageUrl || undefined,
          p_subject: contextData?.subject || "Support Request",
        });

      if (supportRequestError) {
        console.error("Error submitting support request:", supportRequestError);
        toast({
          variant: "destructive",
          title: "Submission Error",
          description:
            "There was a problem submitting your request. Please try again later.",
        });
      } else {
        console.log("Support request submitted:", supportRequestData);
        setIsSubmitted(true);
        setTimeout(() => {
          resetForm();
          onClose();
        }, 3000);
      }
    } catch (error) {
      console.error("Error in support request submission:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategory("");
    setMessage("");
    setImage(null);
    setIsSubmitted(false);
    setUploadProgress(0);
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsUploading(false);
            return 100;
          }
          return Math.min(prev + 10, 100);
        });
      }, 100);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="rounded-sm sm:max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("portal.support_form.title")}</DialogTitle>
          <DialogDescription>
            {contextData?.subject
              ? t("portal.support_form.payment_link_help")
              : t("portal.support_form.general_help")}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center space-y-2 py-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <CustomSelect
                value={category}
                onChange={setCategory}
                options={categories}
              />
              <div className="relative">
                <Textarea
                  placeholder={t("portal.support_form.message.placeholder")}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="min-h-[150px] max-h-[300px] text-sm placeholder:text-sm pr-8 bg-white dark:bg-[#121317] text-gray-900 dark:text-gray-100 resize-y rounded-sm w-full"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-sm absolute bottom-2 right-2"
                  onMouseDown={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              {image && (
                <div className="border rounded-sm p-2 relative bg-background max-w-full overflow-hidden">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`rounded-sm p-1.5 flex-shrink-0 ${image.type.includes("png") ? "bg-green-100 text-green-500" : "bg-blue-100 text-blue-500"}`}
                    >
                      <FileIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="text-xs font-medium truncate w-full">
                        {image.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(image.size / 1024).toFixed(0)} KB
                      </p>
                    </div>
                    <button
                      onMouseDown={() => {
                        setImage(null);
                        setUploadProgress(0);
                        setIsUploading(false);
                      }}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  {isUploading && (
                    <div className="rounded-sm mt-2 w-full bg-gray-200 dark:bg-gray-700 h-1 overflow-hidden">
                      <div
                        className="bg-blue-500 h-1 transition-all duration-300 ease-out"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onMouseDown={onClose}
                className="rounded-sm"
              >
                {t("common.cancel")}
              </Button>
              {!category || !message || isSubmitting ? (
                <Button
                  disabled
                  className="rounded-sm bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-500 dark:disabled:opacity-100"
                >
                  {isSubmitting
                    ? t("common.submitting")
                    : t("portal.support_form.submit")}
                </Button>
              ) : (
                <ButtonExpand
                  text={
                    isSubmitting
                      ? t("common.submitting")
                      : t("portal.support_form.submit")
                  }
                  icon={ArrowRight}
                  bgColor="bg-blue-600 dark:bg-blue-700"
                  textColor="text-white"
                  hoverBgColor="hover:bg-blue-700 dark:hover:bg-blue-800"
                  hoverTextColor="hover:text-white"
                  className="rounded-sm h-10 shadow-none"
                  onMouseDown={handleSubmit}
                />
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
