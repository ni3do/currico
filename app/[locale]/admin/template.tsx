import { ReactNode } from "react";

/** Admin pages skip page transitions for snappy feel */
export default function AdminTemplate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
