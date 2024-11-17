export function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    file: params.get("file") || "",
  };
}
