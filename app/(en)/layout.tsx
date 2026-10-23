import type { ReactNode } from "react";
import type { Metadata } from "next";
import Documento from "@/components/Documento";
import { SITE } from "@/components/metadados";

export const metadata: Metadata = { metadataBase: new URL(SITE) };

export default function Layout({ children }: { children: ReactNode }) {
  return <Documento lang="en">{children}</Documento>;
}
