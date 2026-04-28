// Detecta si un material es un receptáculo de ducha.
// Fuente de verdad primaria: la sublínea (slot === 'receptaculo'), poblada
// desde el DatabaseView al clasificar el item.
// Fallback: items legacy aún no reclasificados — match por nombre con tildes
// normalizadas (NFD + strip diacríticos), tolerante a typos como "RECÉPTACULO".
export function isReceptaculoMat(mat) {
  if (!mat) return false;
  if (mat.slot === 'receptaculo') return true;
  const name = (mat.name || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return /RECEPT/i.test(name);
}
