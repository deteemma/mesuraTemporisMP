# 04: Compteur en direct sur le chronomètre actif

**What to build:** quand un chronomètre est actif, l'Utilisateur voit à la fois l'heure de départ (existant) et un compteur du temps écoulé au format `hh:mm`, mis à jour automatiquement sans action de sa part.

**Blocked by:** 03 (utilise le formatteur hh:mm)

**Status:** ready-for-agent

- [ ] La ligne du chrono actif affiche l'heure de départ existante ET un compteur du temps écoulé depuis `heureDebut`, formaté via le formatteur du ticket 03.
- [ ] Le compteur se met à jour automatiquement à intervalle régulier tant que le composant est affiché, sans rafraîchissement manuel.
- [ ] Un test (`fakeAsync`/`tick`) simule l'avancement du temps et vérifie que la valeur affichée par le composant progresse en conséquence.
- [ ] L'intervalle est proprement nettoyé à la destruction du composant ou à l'arrêt du chrono (pas de fuite de timer).
