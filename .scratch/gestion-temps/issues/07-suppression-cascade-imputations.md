# 07: Suppression en cascade des Imputations

**What to build:** La suppression d'un Utilisateur, d'un Projet, ou d'une Activité supprime en cascade toutes les Imputations qui s'y rattachent. Le simple retrait d'affectation d'un Utilisateur à un Projet (sans suppression) ne déclenche aucune cascade.

**Blocked by:** 06

**Status:** done

- [x] Supprimer un Utilisateur supprime toutes ses Imputations
- [x] Supprimer un Projet supprime toutes les Imputations qui s'y rattachent (via ses Activités)
- [x] Supprimer une Activité supprime toutes les Imputations qui s'y rattachent
- [x] Le retrait d'affectation d'un Utilisateur à un Projet (sans suppression) ne supprime pas ses Imputations passées
- [x] Tests d'intégration API couvrant les trois cas de suppression en cascade et le cas de non-cascade (retrait d'affectation)
