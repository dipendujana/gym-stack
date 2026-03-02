import Link from "next/link";

export function Navbar() {
  return (
    <div className="flex items-center justify-between p-4 contain">
      <Link href="/warm-up">Warm Up</Link>
      <Link href="/push-ups">Push Ups</Link>
    </div>
  );
}
