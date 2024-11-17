import { Outlet } from "react-router-dom";

import { MainLayoutWithCache } from "@/layouts/main";

export function AppLayout() {
  const isAuth = true;

  if (!isAuth) {
    return <Outlet />;
  }

  return <MainLayoutWithCache />;
}
