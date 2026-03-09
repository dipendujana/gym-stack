import { Dumbbell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <div className="bg-gray-500">
      <div className="flex items-center justify-between p-4 contain mb-4">
        <Link href="/">
          <Dumbbell className="text-white" />
        </Link>
        <div className="flex items-center gap-4 text-white">
          <Link href="/push-ups">
            <Button>Push Ups</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
