import { ThemeToggle } from "@/components/shared/theme-toggle";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {/* Top-right by default; falls back to bottom-right on short viewports */}
      <ThemeToggle className="fixed right-4 z-50 top-4 max-[480px]:top-auto max-[480px]:bottom-4" />
    </>
  );
}
