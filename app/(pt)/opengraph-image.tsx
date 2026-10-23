import { imagemDePrevia, tamanhoDaPrevia } from "@/components/imagemDePrevia";

export const alt = "Kayo Kalinauskas, desenvolvedor full stack";
export const size = tamanhoDaPrevia;
export const contentType = "image/png";

export default function Imagem() {
  return imagemDePrevia("pt");
}
