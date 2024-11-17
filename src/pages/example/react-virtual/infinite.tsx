import React from "react";
import { useAtom } from "jotai";
import { useVirtualizer } from "@tanstack/react-virtual";
import { atomWithInfiniteQuery } from "jotai-tanstack-query";

import "./index.css";

export type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

async function fetchPosts({ pageParam }: { pageParam: number }): Promise<Post[]> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${pageParam}`);
  return res.json();
}

export const postsAtom = atomWithInfiniteQuery(() => ({
  queryKey: ["posts"],
  queryFn: fetchPosts,
  getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
  initialPageParam: 1,
}));

export default function App() {
  const [{ status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage }] =
    useAtom(postsAtom);

  const allRows = data ? data.pages.flatMap((d) => d) : [];

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  React.useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if (!lastItem) {
      return;
    }

    if (lastItem.index >= allRows.length - 1 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    rowVirtualizer.getVirtualItems(),
  ]);

  return (
    <div>
      <p>
        This infinite scroll example uses React Query's useInfiniteScroll hook to fetch infinite
        data from a posts endpoint and then a rowVirtualizer is used along with a loader-row placed
        at the bottom of the list to trigger the next page to load.
      </p>

      <br />
      <br />

      {status === "pending" ? (
        <p>Loading...</p>
      ) : status === "error" ? (
        <span>Error: {error.message}</span>
      ) : (
        <div
          ref={parentRef}
          className="List"
          style={{
            height: `500px`,
            width: `100%`,
            overflow: "auto",
          }}>
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > allRows.length - 1;
              const post = allRows[virtualRow.index];

              return (
                <div
                  key={virtualRow.index}
                  className={virtualRow.index % 2 ? "ListItemOdd" : "ListItemEven"}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}>
                  {isLoaderRow
                    ? hasNextPage
                      ? "Loading more..."
                      : "Nothing more to load"
                    : post.title}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div>{isFetching && !isFetchingNextPage ? "Background Updating..." : null}</div>
      <br />
      <br />
      {process.env.NODE_ENV === "development" ? (
        <p>
          <strong>Notice:</strong> You are currently running React in development mode. Rendering
          performance will be slightly degraded until this application is build for production.
        </p>
      ) : null}
    </div>
  );
}
