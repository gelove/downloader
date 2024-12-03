import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { KeepAliveRouteOutlet, useKeepaliveRef } from "keepalive-for-react";

import { Header } from "@/components/panel/head-bar";
import { Sidebar } from "@/components/panel/sidebar";
import { useSidebar } from "@/hooks/use-sidebar";
import { cn, noop } from "@/lib/utils";
import { log } from "@/lib";
import { event, globalShortcut } from "@/lib/tauri";
import { Updater } from "@/components/common/updater";
import { Shortcuts } from "@/config/constant";

export type IProps = {
  cache?: boolean;
};

export function AppLayout({ cache = true }: IProps) {
  const isAuth = true;
  const navigate = useNavigate();
  const { state } = useLocation();
  const { sidebar } = useSidebar();
  const [showDialog, setShowDialog] = useState(false);
  const aliveRef = useKeepaliveRef();

  useEffect(() => {
    globalShortcut
      .register(Shortcuts.Setting, () => {
        log.debug(`${Shortcuts.Setting} shortcut triggered`);
        navigate("/setting/config");
      })
      .then(noop);
    globalShortcut
      .register(Shortcuts.Update, () => {
        log.debug(`${Shortcuts.Update} shortcut triggered`);
        setShowDialog(true);
      })
      .then(noop);

    return () => {
      globalShortcut.unregister([Shortcuts.Setting, Shortcuts.Update]);
    };
  }, []);

  useEffect(() => {
    const gotoListener = event.listen("goto", async (e) => {
      const route = e.payload as string;
      log.debug("goto", route);
      navigate(route);
    });

    return () => {
      gotoListener.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const updateListener = event.listen("update", async (e) => {
      log.info("updateListener event", e);
      setShowDialog(true);
    });

    return () => {
      updateListener.then((fn) => fn());
    };
  }, []);

  if (!isAuth) {
    return <Outlet />;
  }

  const handleClose = () => {
    setShowDialog(false);
  };

  return (
    <>
      <Sidebar />
      <div
        className={cn(
          "flex h-screen flex-col bg-zinc-50 transition-[margin-left] duration-300 ease-in-out dark:bg-zinc-900",
          !sidebar.isOpen ? "lg:ml-16" : "lg:ml-56",
        )}>
        <Header title={state?.label} />
        <main className="mx-auto w-full flex-1 p-4">
          {/* <CustomSuspense> */}
          {!cache ? (
            <Outlet />
          ) : (
            <KeepAliveRouteOutlet
              // wrapperComponent={MemoScrollTopWrapper}
              duration={300}
              transition={true}
              exclude={[]}
              aliveRef={aliveRef}
            />
          )}
          {/* </CustomSuspense> */}
        </main>
        {showDialog && <Updater show={showDialog} onClose={handleClose} />}
        {/* <Footer /> */}
      </div>
    </>
  );
}
