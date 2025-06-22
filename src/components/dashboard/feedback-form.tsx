import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Eraser, ArrowRight } from "lucide-react";
import { supabase } from "@/utils/supabase/client";
import { useUser } from "@/lib/hooks/use-user-context";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useToast } from "@/lib/hooks/use-toast";
import { ButtonExpand } from "@/components/design/button-expand-actions";
import { LottieIcon } from "@/components/ui/lottie-icon";
import { animations } from "@/lib/utils/lottie-animations";

type Sentiment =
  | "very_positive"
  | "positive"
  | "negative"
  | "very_negative"
  | "null";

const emojis: { [key in Sentiment]: string } = {
  very_positive: "😀",
  positive: "🙂",
  negative: "🙁",
  very_negative: "😞",
  null: "",
};

export default function FeedbackForm() {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sentiment, setSentiment] = useState<Sentiment>("null");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async () => {
    if (!user?.id) {
      toast({
        variant: "info",
        title: "Error",
        description: "Unable to identify user. Please try again later.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.rpc("create_feedback", {
        p_merchant_id: user.id,
        p_sentiment: sentiment,
        p_message: feedback,
      });

      if (error) {
        console.error("Error submitting feedback:", error);
        toast({
          variant: "destructive",
          title: "Submission Error",
          description:
            "There was a problem submitting your feedback. Please try again later.",
        });
      } else {
        toast({
          title: "Feedback Submitted",
          description: "Thank you for your feedback. We appreciate your input!",
          variant: "success",
        });
        setFeedback("");
        setSentiment("null");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setFeedback("");
    setSentiment("null");
  };

  return (
    <div className="relative" ref={formRef}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="border-border rounded-sm bg-card text-card-foreground hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30] transition-colors duration-150 flex items-center gap-2 h-8"
      >
        <LottieIcon
          animationData={animations.chat}
          size={16}
          className="text-current"
          isHovered={isHovered}
        />
        {t("portal.feedback_form.button")}
      </Button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute md:right-0 right-[-220px] mt-[15px] w-96 bg-background/80 backdrop-blur-sm border border-border/40 shadow-lg z-50 rounded-sm"
          >
            <div className="p-4">
              <Textarea
                placeholder={t("portal.feedback_form.placeholder")}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[100px] mb-4 text-sm placeholder:text-sm bg-white dark:bg-[#121317] text-gray-900 dark:text-gray-100 rounded-sm"
              />
              <div className="flex items-center justify-between">
                <div className="flex space-x-3">
                  {(Object.keys(emojis) as Sentiment[])
                    .filter((key) => key !== "null")
                    .map((key) => (
                      <button
                        key={key}
                        onClick={() => setSentiment(key)}
                        className={`text-sm p-1 rounded-sm ${sentiment === key ? "bg-gray-200 dark:bg-gray-700 w-8 h-8" : ""}`}
                      >
                        {emojis[key]}
                      </button>
                    ))}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleClear}
                    title={t("portal.feedback_form.clear")}
                    className="px-2 rounded-sm h-8 w-8 transition-all duration-250 ease-out hover:bg-[#E9EAEF] dark:hover:bg-[#2A2B30] active:scale-95"
                  >
                    <Eraser className="h-4 w-4" />
                  </Button>
                  {!feedback || isSubmitting ? (
                    <Button
                      disabled
                      className="bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 rounded-sm opacity-50 h-8 px-3"
                    >
                      {isSubmitting
                        ? t("common.submitting")
                        : t("portal.feedback_form.submit")}
                    </Button>
                  ) : (
                    <ButtonExpand
                      text={
                        isSubmitting
                          ? t("common.submitting")
                          : t("portal.feedback_form.submit")
                      }
                      icon={ArrowRight}
                      bgColor="bg-green-50 dark:bg-green-900/30"
                      textColor="text-green-700 dark:text-green-300"
                      hoverBgColor="hover:bg-green-100 dark:hover:bg-green-900/40"
                      hoverTextColor="hover:text-green-800 dark:hover:text-green-200"
                      className="h-8 rounded-sm shadow-none px-3"
                      onMouseDown={handleSubmit}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 p-2 border-t border-gray-200 dark:border-gray-700">
              {t("portal.feedback_form.footer")}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
