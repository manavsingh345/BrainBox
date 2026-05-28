"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

type NavigateOptions = {
  replace?: boolean;
  state?: {
    reason?: string;
  };
};

function buildTarget(href: string, options?: NavigateOptions) {
  if (!options?.state?.reason) {
    return href;
  }

  const [pathname, hash = ""] = href.split("#");
  const [basePath, existingQuery = ""] = pathname.split("?");
  const params = new URLSearchParams(existingQuery);
  params.set("reason", options.state.reason);
  const query = params.toString();

  return `${basePath}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function useNavigate() {
  const router = useRouter();

  return (href: string, options?: NavigateOptions) => {
    const target = buildTarget(href, options);

    if (options?.replace) {
      router.replace(target);
      return;
    }

    router.push(target);
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  return {
    pathname,
    search: searchParams.toString() ? `?${searchParams.toString()}` : "",
    state: reason ? { reason } : null,
  };
}

type NavigateProps = {
  to: string;
  replace?: boolean;
};

export function Navigate({ to, replace }: NavigateProps) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace });
  }, [navigate, replace, to]);

  return null;
}
