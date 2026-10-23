import type { Metadata } from "next";
import Documento from "@/components/Documento";
import SemManual from "@/components/SemManual";
import { VIEWPORT } from "@/components/metadados";

export const viewport = VIEWPORT;

// Com um layout por idioma, não há um layout único para o 404: esta página vale para o site todo.
export const metadata: Metadata = {
  // vale para as duas línguas, então o título não escolhe uma
  title: "404 · kalinauskas.dev",
  robots: { index: false },
};

export default function NaoEncontrada() {
  return (
    <Documento lang="pt-BR">
      <SemManual />
    </Documento>
  );
}
