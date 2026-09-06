# 05: Chronomètre et création d'Activité à la volée

**What to build:** Un Utilisateur affecté à un Projet peut démarrer un chronomètre sur une Activité existante, ou en créer une nouvelle à la volée au moment du démarrage. Un seul chronomètre peut être actif à la fois pour un Utilisateur donné. Arrêter le chronomètre clôt l'Imputation.

**Blocked by:** 04

**Status:** done

- [x] Un Utilisateur affecté à un Projet peut démarrer un chronomètre sur une Activité existante de ce Projet
- [x] Un Utilisateur peut créer une nouvelle Activité à la volée au moment de démarrer un chronomètre
- [x] Le démarrage crée une Imputation avec heureDebut = maintenant et heureFin = null
- [x] Le serveur refuse de démarrer un second chronomètre si l'Utilisateur en a déjà un actif (heureFin null), quel que soit le Projet/Activité
- [x] Arrêter le chronomètre renseigne heureFin sur l'Imputation ouverte
- [x] Tests d'intégration API + écran Angular du chronomètre (démarrage/arrêt, bouton désactivé si déjà actif)
