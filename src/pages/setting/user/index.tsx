import { useEffect } from "react";

import { Input } from "@/components/ui";
import { event } from "@/lib/tauri";

export default function UserPage() {
  useEffect(() => {
    event.emit("test", "Hello world!");
  }, []);

  return <Input />;
}
