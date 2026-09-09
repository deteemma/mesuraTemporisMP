# 02: Composant notification (toast)

**What to build:** un composant de notification minimal et réutilisable, cohérent avec le système de design maison (ADR 0002 — pas de librairie tierce), permettant d'afficher un message transitoire à l'utilisateur depuis n'importe quel composant. Il sera consommé par les tickets 06 (Scission) et 07 (relancer).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Un service/composant partagé permet de déclencher une notification transitoire depuis n'importe quel composant de l'application.
- [ ] Le style suit les tokens CSS existants (`frontend/src/styles.scss`) — pas d'Angular Material, PrimeNG ou autre librairie de composants, conformément à l'ADR 0002.
- [ ] La notification se ferme automatiquement après un délai raisonnable.
- [ ] Un test vérifie qu'un appel déclenche l'affichage du message et sa disparition après le délai (`fakeAsync`/`tick`).
- [ ] Ce ticket ne branche le composant sur aucune fonctionnalité métier existante — il est construit pour être consommé plus tard par les tickets 06 et 07 ; la vérification se fait via un test unitaire direct du service/composant.
