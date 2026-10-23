import { imagemDePrevia, tamanhoDaPrevia } from "@/components/imagemDePrevia";
import { paginasEstaticas, validar } from "@/components/paginaDoProjeto";

// Cada projeto tem a sua prévia, com o nome e a descrição da página dele.
export const alt = "Kayo Kalinauskas, full stack developer";
export const size = tamanhoDaPrevia;
export const contentType = "image/png";
export const generateStaticParams = paginasEstaticas;

export default async function Imagem({ params }: { params: Promise<{ pagina: string }> }) {
  return imagemDePrevia("en", validar((await params).pagina));
}
