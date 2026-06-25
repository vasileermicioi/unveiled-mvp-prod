import { Button } from "@unveiled/design-system";
import { RefreshCw } from "lucide-react";
import { QueryProvider } from "~/components/providers/query-provider";
import { usePublicDiscoveryQuery } from "~/lib/data-access/hooks";
import type { PublicDiscoveryData } from "~/lib/data-access/repositories";

type QueryExampleProps = {
  initialDiscovery: PublicDiscoveryData;
};

function QueryExample({ initialDiscovery }: QueryExampleProps) {
  const discovery = usePublicDiscoveryQuery(undefined, {
    initialData: initialDiscovery,
  });

  return (
    <section className="ui-602fe269">
      <div className="ui-204f9214">
        <div>
          <h2 className="ui-afb19356">Product data query</h2>
          <p className="ui-5a72bb16">
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
        <p className="ui-2dc894e0">{discovery.error.message}</p>
      ) : null}
      <pre className="ui-9e056707">
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
