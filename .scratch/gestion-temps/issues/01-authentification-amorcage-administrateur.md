# 01: Authentification et amorçage de l'Administrateur

**What to build:** Le squelette de l'application (Express + MongoDB, Angular) avec un flux de connexion complet : au premier démarrage, un compte Administrateur `admin`/`admin` est créé automatiquement (voir ADR 0001 dans `docs/adr/`), un Utilisateur peut se connecter et obtenir une session, et tout compte fraîchement créé doit changer son mot de passe avant de pouvoir aller plus loin.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] Au premier démarrage de l'application (aucun Utilisateur en base), un compte Administrateur `admin`/`admin` est créé automatiquement
- [x] Un Utilisateur peut se connecter avec son login/mot de passe et reçoit une session (JWT)
- [x] Une connexion avec des identifiants invalides est refusée
- [x] Le compte admin par défaut doit changer son mot de passe à la première connexion avant de pouvoir accéder au reste de l'application
- [x] Test d'intégration (supertest + mongodb-memory-server) vérifiant la création automatique du compte admin et le flux connexion/changement de mot de passe obligatoire
- [x] Test Angular (TestBed + HttpClientTestingModule) vérifiant l'écran de connexion et l'écran de changement de mot de passe obligatoire
