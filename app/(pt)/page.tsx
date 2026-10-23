import Manual from "@/components/Manual";
import { metadados } from "@/components/metadados";

export const metadata = metadados("pt", "kayo");

export default function Pagina() {
  return <Manual idioma="pt" slug="kayo" />;
}
