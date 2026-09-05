# 02: Gestion des comptes Utilisateur

**What to build:** Un Administrateur peut créer et supprimer des comptes Utilisateur depuis un écran dédié. Tout nouveau compte reçoit un mot de passe temporaire égal à son login et doit le changer à sa première connexion, selon le même mécanisme que le compte admin de bootstrap (ticket 01).

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Un Administrateur peut créer un compte Utilisateur (login, nom)
- [ ] Le nouveau compte reçoit un mot de passe temporaire égal à son login
- [ ] Le nouvel Utilisateur doit changer son mot de passe à sa première connexion
- [ ] Un Administrateur peut supprimer un compte Utilisateur
- [ ] Un Utilisateur non-Administrateur reçoit un refus (403) sur les routes de gestion des Utilisateurs
- [ ] Tests d'intégration API couvrant création, contrainte de premier changement de mot de passe, suppression, et contrôle d'accès par rôle
- [ ] Écran Angular listant les Utilisateurs avec création/suppression, testé via TestBed
