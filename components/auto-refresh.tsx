"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AutoRefreshProps = {
  seconds?: number;
};

export function AutoRefresh({ seconds = 20 }: AutoRefreshProps) {
  const router = useRouter();
  const [lastRefreshedAt, setLastRefreshedAt] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      setLastRefreshedAt(Date.now());
    }, seconds * 1000);

    return () => clearInterval(interval);
  }, [router, seconds]);

  return (
    <p className="text-xs text-stone-500">
      Auto-refreshing every {seconds}s. Last refresh:{" "}
      {new Intl.DateTimeFormat("en-US", { timeStyle: "short" }).format(lastRefreshedAt)}
    </p>
  );
}
