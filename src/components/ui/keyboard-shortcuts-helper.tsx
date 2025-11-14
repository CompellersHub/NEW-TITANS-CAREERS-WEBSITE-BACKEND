import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Shortcut {
  keys: string[];
  description: string;
}

const shortcuts: Shortcut[] = [
  { keys: ["Home"], description: "Scroll to top of page" },
  { keys: ["End"], description: "Scroll to bottom of page" },
  { keys: ["Ctrl", "Home"], description: "Jump to top (alternative)" },
  { keys: ["Ctrl", "End"], description: "Jump to bottom (alternative)" },
];

export function KeyboardShortcutsHelper() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasSeenHelper, setHasSeenHelper] = useState(false);

  useEffect(() => {
    // Check if user has seen the helper before
    const seen = localStorage.getItem("keyboard-shortcuts-seen");
    if (!seen) {
      // Show helper after 3 seconds on first visit
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
    setHasSeenHelper(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("keyboard-shortcuts-seen", "true");
    setHasSeenHelper(true);
  };

  const handleToggle = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      {/* Toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={handleToggle}
        className={cn(
          "fixed bottom-24 right-8 z-40 h-12 w-12 rounded-full shadow-lg transition-all duration-300",
          "bg-background hover:bg-accent/10 border-2 border-border",
          "hidden md:flex"
        )}
        aria-label="Keyboard shortcuts"
      >
        <Keyboard className="h-5 w-5" />
      </Button>

      {/* Helper panel */}
      <div
        className={cn(
          "fixed bottom-40 right-8 z-50 transition-all duration-300 hidden md:block",
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
      >
        <Card className="w-80 shadow-2xl border-2 border-accent/20 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-accent" />
                <h3 className="font-kanit font-bold text-lg text-foreground">
                  Keyboard Shortcuts
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-6 w-6 -mt-1 -mr-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
                >
                  <p className="text-sm text-muted-foreground font-sans flex-1">
                    {shortcut.description}
                  </p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {shortcut.keys.map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="font-mono text-xs px-2 py-1 bg-muted border-border"
                        >
                          {key}
                        </Badge>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="text-muted-foreground text-xs">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!hasSeenHelper && (
              <p className="text-xs text-muted-foreground mt-4 text-center font-sans">
                Tip: Click the <Keyboard className="inline h-3 w-3" /> icon to show this again
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
