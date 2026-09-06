# 06: Saisie manuelle et modification/suppression d'une Imputation

**What to build:** Un Utilisateur peut saisir manuellement une Imputation, modifier l'heure de début/fin de n'importe laquelle de ses Imputations à tout moment (chevauchement autorisé), et la supprimer. Un Administrateur a les mêmes droits sur les Imputations de tout Utilisateur.

**Blocked by:** 05

**Status:** done

- [x] Un Utilisateur peut saisir manuellement une Imputation (heure de début et de fin) sur une Activité d'un Projet où il est affecté
- [x] Un Utilisateur peut modifier l'heure de début ou de fin de n'importe laquelle de ses Imputations, à tout moment
- [x] Une modification créant un chevauchement avec une autre Imputation du même Utilisateur est autorisée (aucune validation bloquante)
- [x] Un Utilisateur peut supprimer une de ses Imputations
- [x] Un Administrateur peut modifier ou supprimer l'Imputation de n'importe quel Utilisateur
- [x] Un Utilisateur ne peut pas modifier/supprimer l'Imputation d'un autre Utilisateur (403)
- [x] Tests d'intégration API + formulaire Angular de saisie manuelle et d'édition
