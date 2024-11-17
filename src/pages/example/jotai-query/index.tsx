import { useAtom } from "jotai";
import { atomWithInfiniteQuery } from "jotai-tanstack-query";

import { Button } from "@/components/ui";

export type Post = {
  id: number;
  title: string;
  body: string;
  userId: number;
};

export const postsAtom = atomWithInfiniteQuery(() => ({
  queryKey: ["posts"],
  queryFn: async ({ pageParam }): Promise<Post[]> => {
    const res = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${pageParam}`);
    return res.json();
  },
  getNextPageParam: (_lastPage, _allPages, lastPageParam) => lastPageParam + 1,
  initialPageParam: 1,
}));

export default function App() {
  const [{ data, fetchNextPage, isPending, isError }] = useAtom(postsAtom);

  if (isPending) return <div>Loading...</div>;
  if (isError) return <div>Error</div>;

  const allRows = data ? data.pages.flatMap((d) => d) : [];

  return (
    <>
      <Button onClick={() => fetchNextPage()}>下一页</Button>
      {allRows.map((post) => (
        <div key={post.id}>{post.title}</div>
      ))}
    </>
  );
}
