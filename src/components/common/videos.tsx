import React, { useState, useEffect } from "react";
import { Heart, Play, Download, Eye, X } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { atomWithInfiniteQuery } from "jotai-tanstack-query";
import { useAtom } from "jotai";

interface Video {
  id: number;
  thumbnail: string;
  videoUrl: string;
  downloadUrl: string;
  duration?: string;
  likes: number;
  description: string;
}

const fetchVideos = async ({ pageParam = 0 }): Promise<{ videos: Video[]; nextCursor: number }> => {
  // Simulating an API call
  await new Promise((resolve) => setTimeout(resolve, 500));
  const limit = 20;
  const videos = Array.from({ length: limit }, (_, i) => ({
    id: pageParam * limit + i,
    thumbnail: `/placeholder.svg?height=200&width=300&text=Video ${pageParam * limit + i}`,
    videoUrl: `https://example.com/video${pageParam * limit + i}.mp4`,
    downloadUrl: `https://example.com/download${pageParam * limit + i}.mp4`,
    duration: `00:0${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60)}`,
    likes: Math.floor(Math.random() * 10000),
    description: `This is video ${pageParam * limit + i}. #trending #viral #2024`,
  }));
  return { videos, nextCursor: pageParam + 1 };
};

const videosAtom = atomWithInfiniteQuery(() => ({
  queryKey: ["videos"],
  queryFn: fetchVideos,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
  initialPageParam: 0,
}));

export function Videos() {
  const [videosQuery] = useAtom(videosAtom);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [hoveredVideoId, setHoveredVideoId] = useState<number | null>(null);

  const videos = videosQuery.data?.pages.flatMap((page) => page.videos) ?? [];

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(videos.length / 2) + 1,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  useEffect(() => {
    const lastItem = rowVirtualizer.getVirtualItems().at(-1);
    if (
      lastItem &&
      lastItem.index >= Math.ceil(videos.length / 2) - 1 &&
      !videosQuery.isFetchingNextPage
    ) {
      videosQuery.fetchNextPage();
    }
  }, [rowVirtualizer.getVirtualItems(), videos.length, videosQuery]);

  const openVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">视频</h1>
      <div ref={parentRef} className="h-[800px] overflow-auto">
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const firstVideoIndex = virtualRow.index * 2;
            const secondVideoIndex = firstVideoIndex + 1;
            return (
              <div
                key={virtualRow.index}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex gap-4">
                {[firstVideoIndex, secondVideoIndex].map((index) => {
                  const video = videos[index];
                  return video ? (
                    <div
                      key={video.id}
                      className="flex-1 overflow-hidden rounded-lg bg-card shadow-lg"
                      onMouseEnter={() => setHoveredVideoId(video.id)}
                      onMouseLeave={() => setHoveredVideoId(null)}>
                      <div className="relative">
                        <img
                          src={video.thumbnail}
                          alt={`Video thumbnail ${video.id}`}
                          className="h-auto w-full"
                          loading="lazy"
                        />
                        {video.duration && (
                          <div className="absolute bottom-2 right-2 rounded bg-black bg-opacity-60 px-1 py-0.5 text-xs text-white">
                            <Play className="mr-1 inline h-3 w-3" />
                            {video.duration}
                          </div>
                        )}
                        {hoveredVideoId === video.id && (
                          <div className="absolute inset-0 flex items-center justify-center space-x-4 bg-black bg-opacity-50">
                            <button
                              onClick={() => openVideo(video)}
                              className="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90">
                              <Eye size={24} />
                            </button>
                            <a
                              href={video.downloadUrl}
                              download
                              className="rounded-full bg-primary p-2 text-primary-foreground transition-colors hover:bg-primary/90">
                              <Download size={24} />
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="mb-2 line-clamp-2 text-sm">{video.description}</p>
                        <div className="flex items-center text-muted-foreground">
                          <Heart className="mr-1 h-4 w-4" />
                          <span className="text-sm">{video.likes}</span>
                        </div>
                      </div>
                    </div>
                  ) : videosQuery.isFetchingNextPage ? (
                    <div key={index} className="flex h-full flex-1 items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                    </div>
                  ) : null;
                })}
              </div>
            );
          })}
        </div>
      </div>

      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-3xl">
            <button
              onClick={closeVideo}
              className="absolute right-4 top-4 text-white hover:text-gray-300">
              <X size={24} />
            </button>
            <video src={selectedVideo.videoUrl} controls autoPlay className="w-full">
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
