import { metadadosDoProjeto, paginaDoProjeto, paginasEstaticas } from "@/components/paginaDoProjeto";

export const dynamicParams = false;
export const generateStaticParams = paginasEstaticas;
export const generateMetadata = metadadosDoProjeto("en");
export default paginaDoProjeto("en");
