// import { ReactNode, Suspense } from "react";
import { useLocation, Outlet } from "react-router-dom";
import { KeepAliveRouteOutlet, useKeepaliveRef } from "keepalive-for-react";

import { Header } from "@/components/panel/head-bar";
import { Sidebar } from "@/components/panel/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn } from "@/lib/utils";

export function MainLayout() {
  const { state } = useLocation();
  const { sidebar } = useSidebar();

  return (
    <>
      <Sidebar />
      <div
        className={cn(
          "flex h-screen flex-col bg-zinc-50 transition-[margin-left] duration-300 ease-in-out dark:bg-zinc-900",
          !sidebar.isOpen ? "lg:ml-16" : "lg:ml-56",
        )}>
        <Header title={state?.label} />
        <main className="container flex-1 px-4 py-8 sm:px-8">
          <Outlet />
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
}

export function MainLayoutWithCache() {
  const { state } = useLocation();
  const { sidebar } = useSidebar();
  const aliveRef = useKeepaliveRef();

  return (
    <>
      <Sidebar />
      <div
        className={cn(
          "flex h-screen flex-col bg-zinc-50 transition-[margin-left] duration-300 ease-in-out dark:bg-zinc-900",
          !sidebar.isOpen ? "lg:ml-16" : "lg:ml-56",
        )}>
        <Header title={state?.label} />
        <main className="container flex-1 p-4">
          {/* <CustomSuspense> */}
          <KeepAliveRouteOutlet
            // wrapperComponent={MemoScrollTopWrapper}
            duration={300}
            transition={true}
            exclude={[]}
            aliveRef={aliveRef}
          />
          {/* </CustomSuspense> */}
        </main>
        {/* <Footer /> */}
      </div>
    </>
  );
}

// function CustomSuspense(props: { children: ReactNode }) {
//   const { children } = props;
//   return (
//     <Suspense
//       fallback={<div className="mt-[10px] text-center text-[12px] text-red-400">Loading...</div>}>
//       {children}
//     </Suspense>
//   );
// }

// 切换路由时记住页面的滚动位置
// function MemoScrollTopWrapper(props: { children: ReactNode }) {
//   const { children } = props;
//   const domRef = useRef<HTMLDivElement>(null);
//   const location = useLocation();
//   const scrollHistoryMap = useRef<Map<string, number>>(new Map());

//   const activeKey = useMemo(() => {
//     return location.pathname + location.search;
//   }, [location.pathname, location.search]);

//   useEffect(() => {
//     const divDom = domRef.current;
//     if (!divDom) return;
//     setTimeout(() => {
//       divDom.scrollTo(0, scrollHistoryMap.current.get(activeKey) || 0);
//     }, 300); // 300 milliseconds to wait for the animation transition ending
//     const onScroll = (e: Event) => {
//       const target = e.target as HTMLDivElement;
//       if (!target) return;
//       scrollHistoryMap.current.set(activeKey, target?.scrollTop || 0);
//     };
//     divDom?.addEventListener("scroll", onScroll, {
//       passive: true,
//     });
//     return () => {
//       divDom?.removeEventListener("scroll", onScroll);
//     };
//   }, [activeKey]);

//   return (
//     <div
//       className="animation-wrapper scrollbar w-full overflow-auto"
//       style={{
//         height: "calc(100vh - 82px)",
//       }}
//       ref={domRef}>
//       {children}
//     </div>
//   );
// }
