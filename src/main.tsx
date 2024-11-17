// import { StrictMode } from "react";
// import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { enableMapSet } from "immer";

import App from "@/app";
import "./style.css";

enableMapSet();

// 在 StrictMode 严格模式下, React 会故意双重渲染组件(mount->unmount->mount), 以消除不安全的副作用
// 与其他严格模式行为一样, React 只会针对开发构建执行此操作
// StrictMode 严格模式下会导致tauri监听事件被调用两次, 构建后不会
// createRoot(document.getElementById("root") as HTMLElement).render(
//   <StrictMode>
//   <BrowserRouter>
//     <App />
//   </BrowserRouter>,
//   </StrictMode>,
// );

createRoot(document.getElementById("root") as HTMLElement).render(<App />);
