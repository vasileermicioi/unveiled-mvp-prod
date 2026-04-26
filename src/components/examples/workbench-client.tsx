import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import { QueryProvider } from "@/components/providers/query-provider";
import { Button } from "@/components/ui/button";

type HealthResponse = {
  ok: boolean;
  checkedAt: string;
};

function QueryExample() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const response = await fetch("/api/health.json");

      if (!response.ok) {
        throw new Error("Health check failed");
      }

      return response.json() as Promise<HealthResponse>;
    },
  });

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-5 text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">TanStack Query</h2>
          <p className="text-sm text-muted-foreground">
            Client state wired through an Astro React island.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => health.refetch()}
          disabled={health.isFetching}
        >
          <RefreshCw
            className={health.isFetching ? "animate-spin" : undefined}
          />
          Refetch
        </Button>
      </div>
      <pre className="overflow-auto rounded-md bg-muted p-3 text-sm">
        {JSON.stringify(
          {
            status: health.status,
            isFetching: health.isFetching,
            data: health.data,
          },
          null,
          2,
        )}
      </pre>
    </section>
  );
}

export function WorkbenchClient() {
  return (
    <QueryProvider>
      <QueryExample />
    </QueryProvider>
  );
}
