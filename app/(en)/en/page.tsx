import Manual from "@/components/Manual";
import { metadados } from "@/components/metadados";

export const metadata = metadados("en", "kayo");

export default function Pagina() {
  return <Manual idioma="en" slug="kayo" />;
}
