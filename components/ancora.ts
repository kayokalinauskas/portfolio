// O endereço de uma seção: "VEJA TAMBÉM" vira "veja-tambem".
export function ancora(titulo: string) {
  return titulo
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
