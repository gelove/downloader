export function isMenuActive(pathname: string, menuPath: string): boolean {
  if (menuPath === "/") {
    return pathname === menuPath;
  }
  return pathname.startsWith(menuPath);
}

export function isSubMenuActive(pathname: string, subMenuPath: string): boolean {
  return pathname === subMenuPath;
}
