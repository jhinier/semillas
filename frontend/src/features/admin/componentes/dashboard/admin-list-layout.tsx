import type { ReactNode } from "react";

type AdminListLayoutProps = {
  content: ReactNode;
  sidebar: ReactNode;
};

export function AdminListLayout({ content, sidebar }: AdminListLayoutProps) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="flex flex-col gap-6 lg:col-span-3 min-w-0">{content}</div>
      <div className="flex flex-col gap-6">{sidebar}</div>
    </div>
  );
}
