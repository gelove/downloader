import { useEffect, useRef } from "react";

// import { core } from "@/lib/tauri";
// import { log } from "@/lib";

export function Player({ filepath, close }: { filepath: string; close?: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!filepath) {
    return null;
  }

  // useEffect(() => {
  //   const func = async () => {
  //     if (!filepath || !videoRef.current) return;
  //     try {
  //       const source = document.createElement("source");
  //       source.src = core.convertFileSrc(filepath);
  //       if (videoRef.current.firstChild) {
  //         videoRef.current.removeChild(videoRef.current.firstChild);
  //       }
  //       videoRef.current.appendChild(source);
  //       videoRef.current.load();
  //     } catch (error) {
  //       log.error("VideoPlayer: error =>", error);
  //     }
  //   };
  //   func();
  // }, [filepath]);

  useEffect(() => {
    const func = (e: KeyboardEvent) => {
      // NOTE: 不能在方法体顶部阻止默认行为，会阻止输入事件导致无法输入
      // e.preventDefault();
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close && close();
      }
    };
    document.addEventListener("keydown", func);
    return () => document.removeEventListener("keydown", func);
  }, []);

  const stopPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-20 flex h-full w-full items-center justify-center bg-black bg-opacity-75"
      onClick={close}>
      <video
        className="max-h-screen max-w-[100vw] object-scale-down"
        ref={videoRef}
        onClick={stopPropagation}
        // loop
        autoPlay
        playsInline
        controls>
        <source src={filepath} />
      </video>
    </div>
  );
}
