"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { getLoginUrl } from "@/lib/utils/login-redirect";

interface LoginLinkProps {
  children: React.ReactNode;
  className?: string;
}

export function LoginLink({ children, className }: LoginLinkProps) {
  const pathname = usePathname();
  // Strip locale prefix for the callback URL
  const cleanPath = pathname.replace(/^\/(de|en)/, "") || "/";
  const href = getLoginUrl(cleanPath);
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
