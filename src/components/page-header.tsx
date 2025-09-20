import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
