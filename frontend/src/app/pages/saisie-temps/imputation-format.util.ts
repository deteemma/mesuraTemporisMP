export function formatHeure(iso: string): string {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function formatDuree(heureDebut: string, heureFin: string | null): string {
  if (!heureFin) return 'en cours';
  const minutes = Math.max(0, Math.round((new Date(heureFin).getTime() - new Date(heureDebut).getTime()) / 60000));
  const heures = Math.floor(minutes / 60);
  const reste = minutes % 60;
  if (heures === 0) return `${reste} min`;
  if (reste === 0) return `${heures} h`;
  return `${heures} h ${reste}`;
}

export function formatMinutes(totalMinutes: number): string {
  const heures = Math.floor(totalMinutes / 60);
  const reste = totalMinutes % 60;
  if (heures === 0) return `${reste} min`;
  if (reste === 0) return `${heures} h`;
  return `${heures} h ${reste}`;
}
