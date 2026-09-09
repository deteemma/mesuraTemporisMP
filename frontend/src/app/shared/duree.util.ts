export function formatHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formatte une durée en minutes au format hh:mm, zero-paddé, sans plafond à 24h.
 * Les Imputations pouvant se chevaucher, un cumul peut légitimement dépasser 24h
 * (ex. 1635 minutes -> "27:15").
 */
export function formatMinutesHHMM(totalMinutes: number): string {
  const minutes = Math.max(0, Math.round(totalMinutes));
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  return `${String(heures).padStart(2, '0')}:${String(reste).padStart(2, '0')}`;
}

export function formatDuree(heureDebut: string, heureFin: string | null): string {
  if (!heureFin) return 'en cours';
  const minutes = Math.max(0, Math.round((new Date(heureFin).getTime() - new Date(heureDebut).getTime()) / 60000));
  return formatMinutesHHMM(minutes);
}

export function formatMinutes(totalMinutes: number): string {
  const heures = Math.floor(totalMinutes / 60);
  const reste = totalMinutes % 60;
  if (heures === 0) return `${reste} min`;
  if (reste === 0) return `${heures} h`;
  return `${heures} h ${reste}`;
}
