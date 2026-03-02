import { Dumbbell } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <div className="bg-gray-500">
      <div className="flex items-center justify-between p-4 contain mb-4">
        <Link href="/">
          <Dumbbell className="text-white" />
        </Link>

        <div className="flex items-center gap-4 text-white">
          <Link href="/warm-up">Warm Up</Link>
          <Link href="/push-ups">Push Ups</Link>
        </div>
      </div>
    </div>
  );
}
