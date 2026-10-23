import { imagemDePrevia, tamanhoDaPrevia } from "@/components/imagemDePrevia";

export const alt = "Kayo Kalinauskas, full stack developer";
export const size = tamanhoDaPrevia;
export const contentType = "image/png";

export default function Imagem() {
  return imagemDePrevia("en");
}
