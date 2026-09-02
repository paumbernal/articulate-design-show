import { useEffect, useState } from "react";

export function usePageInView() {
  const [isInView, setIsInView] = useState(
    typeof document === "undefined" ? true : document.visibilityState === "visible"
  );

  useEffect(() => {
    const handleVisibilityChange = () => setIsInView(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return isInView;
}
