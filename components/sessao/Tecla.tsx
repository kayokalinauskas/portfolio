import estilos from "../manual.module.css";

// A tecla e o que ela faz, num botão só: no celular, é o jeito de usar o manual.
// "recolher" some com o botão no celular durante a busca; "sempreComRotulo" mantém o nome
// visível mesmo onde as outras teclas mostram só a letra.
export default function Tecla({
  k,
  acao,
  rotulo,
  recolher,
  sempreComRotulo,
}: {
  k: string;
  acao: () => void;
  rotulo: string;
  recolher?: boolean;
  sempreComRotulo?: boolean;
}) {
  const classes = [estilos.tecla, recolher && estilos.recolhida].filter(Boolean).join(" ");
  return (
    <button type="button" className={classes} onClick={acao}>
      <b>{k}</b>
      <span className={sempreComRotulo ? undefined : estilos.rotuloDaTecla}> {rotulo}</span>
    </button>
  );
}
