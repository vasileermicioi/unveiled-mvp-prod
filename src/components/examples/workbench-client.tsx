import { RefreshCw } from "lucide-react";

import { QueryProvider } from "@/components/providers/query-provider";
import { Button } from "@/components/ui/button";
import { usePublicDiscoveryQuery } from "@/lib/data-access/hooks";
import type { PublicDiscoveryData } from "@/lib/data-access/repositories";

type QueryExampleProps = {
  initialDiscovery: PublicDiscoveryData;
};

function QueryExample({ initialDiscovery }: QueryExampleProps) {
  const discovery = usePublicDiscoveryQuery(undefined, {
    initialData: initialDiscovery,
  });

  return (
    <section className="grid gap-4 rounded-lg border bg-card p-5 text-card-foreground">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Product data query</h2>
          <p className="text-sm text-muted-foreground">
            Public discovery data hydrated from the Astro route loader.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => discovery.refetch()}
          disabled={discovery.isFetching}
        >
          <RefreshCw
            className={discovery.isFetching ? "animate-spin" : undefined}
          />
          Refetch
        </Button>
      </div>
      {discovery.isError ? (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
          {discovery.error.message}
        </p>
      ) : null}
      <pre className="overflow-auto rounded-md bg-muted p-3 text-sm">
        {JSON.stringify(
          {
            status: discovery.status,
            isFetching: discovery.isFetching,
            state: discovery.isPending
              ? "loading"
              : discovery.isError
                ? "error"
                : discovery.data.featuredEvents.length === 0
                  ? "empty"
                  : discovery.isFetching
                    ? "refreshing"
                    : "ready",
            stats: discovery.data?.stats,
            featuredEventTitles: discovery.data?.featuredEvents.map(
              (event) => event.title,
            ),
          },
          null,
          2,
        )}
      </pre>
    </section>
  );
}

export function WorkbenchClient({ initialDiscovery }: QueryExampleProps) {
  return (
    <QueryProvider>
      <QueryExample initialDiscovery={initialDiscovery} />
    </QueryProvider>
  );
}
