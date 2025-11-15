import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { adminRoutes } from "./AdminSidebar";

interface AdminCommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Enhanced search keywords for better discoverability
const routeKeywords: Record<string, string[]> = {
  "/admin/campaign-manager": ["email", "campaign", "send", "newsletter", "marketing"],
  "/admin/campaign-analytics": ["analytics", "metrics", "email", "stats", "performance"],
  "/admin/scheduled-campaigns": ["schedule", "calendar", "timing", "automated"],
  "/admin/template-library": ["templates", "email", "design", "library"],
  "/admin/template-editor": ["edit", "template", "design", "create"],
  "/admin/lead-nurture-manager": ["leads", "nurture", "automation", "drip"],
  "/admin/send-time-optimization": ["timing", "send", "optimize", "schedule"],
  "/admin/engagement-analytics": ["engagement", "analytics", "metrics", "users"],
  "/admin/email-analytics": ["email", "analytics", "performance", "stats"],
  "/admin/email-engagement": ["email", "engagement", "clicks", "opens"],
  "/admin/form-analytics": ["form", "analytics", "submissions", "data"],
  "/admin/form-submission-analytics": ["form", "submissions", "analytics", "data"],
  "/admin/recovery-analytics": ["recovery", "abandoned", "analytics", "cart"],
  "/admin/alert-analytics": ["alerts", "notifications", "analytics"],
  "/admin/predictive-analytics": ["predictive", "ai", "forecast", "analytics"],
  "/admin/prediction-accuracy": ["accuracy", "predictive", "validation"],
  "/admin/ab-test-dashboard": ["ab test", "testing", "experiments", "variants"],
  "/admin/email-ab-test-dashboard": ["email", "ab test", "testing", "variants"],
  "/admin/ab-test-winner-history": ["ab test", "history", "winners", "results"],
  "/admin/form-submissions": ["forms", "submissions", "contact", "support"],
  "/admin/templates": ["templates", "responses", "canned", "replies"],
  "/admin/campaign-approval-queue": ["approvals", "queue", "pending", "review"],
  "/admin/sla-alert-history": ["sla", "alerts", "history", "performance"],
  "/admin/payment-management": ["payment", "transactions", "orders", "revenue"],
  "/admin/bank-transfer-verification": ["bank", "transfer", "verify", "payment"],
  "/admin/payment-analytics": ["payment", "analytics", "revenue", "stats"],
  "/admin/voucher-manager": ["vouchers", "codes", "discounts", "coupons"],
  "/admin/voucher-analytics": ["voucher", "analytics", "usage", "stats"],
  "/admin/voucher-export": ["export", "voucher", "download", "data"],
  "/admin/ab-test-manager": ["ab test", "manage", "create", "experiments"],
  "/admin/segment-manager": ["segments", "users", "groups", "audience"],
  "/admin/notification-settings": ["notifications", "settings", "alerts", "preferences"],
  "/admin/form-alert-settings": ["form", "alerts", "settings", "notifications"],
  "/admin/recovery-alert-settings": ["recovery", "alerts", "settings", "abandoned"],
  "/admin/role-management": ["roles", "permissions", "users", "access"],
  "/admin/content-manager": ["content", "cms", "blog", "pages", "courses", "prices", "jobs", "testimonials", "stories"],
};

export function AdminCommandPalette({ open, onOpenChange }: AdminCommandPaletteProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useKeyboardShortcuts([
    {
      key: "k",
      ctrlKey: true,
      callback: () => onOpenChange(true),
    },
    {
      key: "k",
      metaKey: true,
      callback: () => onOpenChange(true),
    },
  ]);

  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const handleSelect = (url: string) => {
    navigate(url);
    onOpenChange(false);
  };

  const filterRoutes = (searchTerm: string) => {
    if (!searchTerm) return adminRoutes;

    const lowerSearch = searchTerm.toLowerCase();
    
    return adminRoutes
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          // Search in title
          if (item.title.toLowerCase().includes(lowerSearch)) return true;
          
          // Search in category
          if (category.category.toLowerCase().includes(lowerSearch)) return true;
          
          // Search in keywords
          const keywords = routeKeywords[item.url] || [];
          return keywords.some((keyword) => keyword.includes(lowerSearch));
        }),
      }))
      .filter((category) => category.items.length > 0);
  };

  const filteredRoutes = filterRoutes(search);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search admin tasks... (blog, prices, jobs, courses, etc.)"
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No tasks found. Try different keywords.</CommandEmpty>
        {filteredRoutes.map((category) => (
          <CommandGroup key={category.category} heading={category.category}>
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem
                  key={item.url}
                  onSelect={() => handleSelect(item.url)}
                  className="cursor-pointer"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
