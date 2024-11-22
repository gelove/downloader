import { useState, useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import { getVideosByUid, Video } from "@/service/douyin";
import { log } from "@/lib";

export const VideoList = () => {
  const perRowItems = 6;
  const [videos, setVideos] = useState<Video[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState(0);
  const parentRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchVideos = async (maxCursor: number) => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    try {
      const uid = "MS4wLjABAAAAf6Lm-c6eQYIPhWnQaalomsoP5uB-J2gAxg0SLLJnSZw";
      const resp = await getVideosByUid(uid, 20, maxCursor);
      if (!resp) {
        log.error("加载视频失败");
        return;
      }
      if (resp.error) {
        log.error("加载视频失败:", resp.error);
        return;
      }
      setVideos((prev) => [...prev, ...resp.list]);
      setHasMore(resp.has_more === 1);
      setCursor(resp.max_cursor);
    } catch (error) {
      log.error("加载视频失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(0); // Fetch initial videos
  }, []);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(videos.length / perRowItems), // We need rows, each row has `perRowItems` items
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // Estimate height of each row (can be adjusted)
    overscan: 5,
  });

  const handleScroll = () => {
    if (parentRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
      if (scrollHeight - scrollTop === clientHeight && hasMore) {
        fetchVideos(cursor); // Fetch more videos when scrolled to bottom
      }
    }
  };

  return (
    <div ref={parentRef} onScroll={handleScroll} className="h-[500px] w-full overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}>
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          // Get the range of videos to display in each row
          const startIndex = virtualRow.index * perRowItems;
          const endIndex = Math.min(startIndex + perRowItems, videos.length);
          const rowVideos = videos.slice(startIndex, endIndex);

          return (
            <div
              key={virtualRow.index}
              style={{
                position: "absolute",
                top: `${virtualRow.start}px`,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                display: "grid",
                gridTemplateColumns: `repeat(${perRowItems}, 1fr)`, // `perRowItems` columns layout
                gap: "10px", // Optional: Add spacing between items
              }}>
              {rowVideos.map((video) => (
                <div
                  key={video.id}
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    textAlign: "center",
                  }}>
                  <h3>{`${video.title}`}</h3>
                  <h3>{`${video.create_time}`}</h3>
                  <img src={video.cover} alt={video.title} />
                  {/* <a href={video.url}>{video.url}</a> */}
                </div>
              ))}
            </div>
          );
        })}
        {!hasMore && <div>没有更多视频了</div>}
        {isLoading && <div>加载中...</div>}
      </div>
    </div>
  );
};
