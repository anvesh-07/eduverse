import { GraduationCap } from "lucide-react";
import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <GraduationCap className="h-6 w-6 text-primary" />
      <span className="text-lg font-semibold">EduVerse</span>
    </div>
  );
}
