export function formatHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formatte une durée en secondes au format hh:mm:ss, zero-paddé, sans plafond à 24h.
 * Les Imputations pouvant se chevaucher, un cumul peut légitimement dépasser 24h
 * (ex. 98115 secondes -> "27:15:15").
 */
export function formatSecondesHHMMSS(totalSecondes: number): string {
  const secondes = Math.max(0, Math.round(totalSecondes));
  const heures = Math.floor(secondes / 3600);
  const minutesRestantes = Math.floor((secondes % 3600) / 60);
  const secondesRestantes = secondes % 60;
  return `${String(heures).padStart(2, '0')}:${String(minutesRestantes).padStart(2, '0')}:${String(secondesRestantes).padStart(2, '0')}`;
}

export function formatDuree(heureDebut: string, heureFin: string): string {
  const secondes = Math.max(0, Math.round((new Date(heureFin).getTime() - new Date(heureDebut).getTime()) / 1000));
  return formatSecondesHHMMSS(secondes);
}
