# mesureTemporisMP

Application client/serveur de gestion du temps consommé sur des projets, construite avec MEAN (MongoDB, Express, Angular, Node).

## Language

**Utilisateur**:
Une personne membre de l'équipe qui peut saisir du temps dans l'application.
_Avoid_: Membre, employé

**Administrateur**:
Un Utilisateur disposant de droits de gestion sur l'ensemble du système (tous les utilisateurs, tous les projets). Un Administrateur conserve tous les droits d'un Utilisateur normal — ce n'est pas un compte séparé.
_Avoid_: Admin, manager, chef, chef de projet

**Projet**:
Le regroupement de premier niveau auquel le temps est imputé, via ses Activités. Un Projet a une liste explicite d'Utilisateurs qui y sont affectés (son équipe) — seuls ces Utilisateurs peuvent y saisir du temps.
_Avoid_: 

**Activité**:
Un item de travail spécifique à un Projet, auquel le temps est réellement imputé (via des Imputations). Un Utilisateur affecté au Projet peut en créer une à la volée en démarrant un chronomètre. L'Administrateur peut en créer/modifier/supprimer via la gestion du Projet.
_Avoid_: Tâche

**Imputation**:
Une plage de temps (heure de début, heure de fin) rattachée à un Utilisateur, un Projet et une Activité — saisie via un chronomètre (démarré/arrêté en direct) ou manuellement. Modifiable ou supprimable à tout moment par l'Utilisateur propriétaire ou l'Administrateur, y compris rétroactivement. Plusieurs Imputations peuvent se chevaucher. Supprimée en cascade si son Utilisateur, son Projet, ou son Activité est supprimé.
_Avoid_: Saisie de temps, entrée de temps
