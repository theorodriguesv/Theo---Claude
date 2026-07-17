"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Base de vídeos" },
  { href: "/adicionar", label: "+ Adicionar" },
  { href: "/scripts", label: "Gerar scripts" },
];

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav>
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={pathname === link.href ? "active" : ""}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
