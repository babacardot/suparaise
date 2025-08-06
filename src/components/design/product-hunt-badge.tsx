import Image from "next/image";
import { useEffect, useState } from "react";

export function ProductHuntBadge() {
  // Initialize state directly from documentElement class for immediate accuracy
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  // Use MutationObserver for instant reaction to class changes on <html>
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          // Update state based on the new class state
          const isDark = document.documentElement.classList.contains("dark");
          setCurrentTheme(isDark ? "dark" : "light");
        }
      });
    });

    // Start observing the <html> element
    observer.observe(document.documentElement, { attributes: true });

    // Cleanup: disconnect observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []); // Empty dependency array: run only once on mount

  return (
    <a
      href="https://www.producthunt.com/posts/suparaise?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-suparaise"
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
    >
      <Image
        src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=720260&theme=${currentTheme}&t=1736800231403`}
        alt="Suparaise - Agents that apply to funds for you, on autopilot | Product Hunt"
        width={250}
        height={54}
        style={{
          width: "410px",
          height: "80px",
        }}
      />
    </a>
  );
}
