# 05: Chronomètre et création d'Activité à la volée

**What to build:** Un Utilisateur affecté à un Projet peut démarrer un chronomètre sur une Activité existante, ou en créer une nouvelle à la volée au moment du démarrage. Un seul chronomètre peut être actif à la fois pour un Utilisateur donné. Arrêter le chronomètre clôt l'Imputation.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Un Utilisateur affecté à un Projet peut démarrer un chronomètre sur une Activité existante de ce Projet
- [ ] Un Utilisateur peut créer une nouvelle Activité à la volée au moment de démarrer un chronomètre
- [ ] Le démarrage crée une Imputation avec heureDebut = maintenant et heureFin = null
- [ ] Le serveur refuse de démarrer un second chronomètre si l'Utilisateur en a déjà un actif (heureFin null), quel que soit le Projet/Activité
- [ ] Arrêter le chronomètre renseigne heureFin sur l'Imputation ouverte
- [ ] Tests d'intégration API + écran Angular du chronomètre (démarrage/arrêt, bouton désactivé si déjà actif)
