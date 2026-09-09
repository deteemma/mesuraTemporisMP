const express = require('express');
const mongoose = require('mongoose');
const Imputation = require('../models/Imputation');
const Activite = require('../models/Activite');
const { verifierAccesProjet, verifierAccesActivite } = require('../middleware/projetAccess');
const { chargerOuNotFound } = require('../utils/chargerOuNotFound');
const { estAdministrateur } = require('../utils/roles');
const { memeId } = require('../utils/mongoId');
const { toPublicImputation } = require('../serializers');

const router = express.Router();

const UN_JOUR_MS = 24 * 60 * 60 * 1000;

function jourCalendaireUTC(date) {
  return date.toISOString().slice(0, 10);
}

function debutJourUTC(date) {
  return new Date(`${jourCalendaireUTC(date)}T00:00:00.000Z`);
}

function finJourUTC(date) {
  return new Date(`${jourCalendaireUTC(date)}T23:59:59.999Z`);
}

// Scission (voir ADR 0003 et CONTEXT.md) : l'édition de heureFin ferait franchir
// minuit vers le lendemain. L'Imputation d'origine est tronquée à la fin de sa
// journée d'origine ; une nouvelle Imputation, pour le même Utilisateur/Projet/
// Activité, démarre au début du lendemain et se termine à l'heure demandée
// (reportée d'un jour). Les deux écritures sont atomiques.
async function scinderVersLeLendemain(imputation, heureFinDemandee) {
  const jourOrigine = imputation.heureDebut;
  const heureFinNouvelle = new Date(heureFinDemandee.getTime() + UN_JOUR_MS);
  const heureDebutNouvelle = debutJourUTC(new Date(jourOrigine.getTime() + UN_JOUR_MS));

  imputation.heureFin = finJourUTC(jourOrigine);

  const session = await mongoose.startSession();
  let nouvelleImputation;
  try {
    await session.withTransaction(async () => {
      await imputation.save({ session });
      const [creee] = await Imputation.create(
        [
          {
            utilisateurId: imputation.utilisateurId,
            projetId: imputation.projetId,
            activiteId: imputation.activiteId,
            heureDebut: heureDebutNouvelle,
            heureFin: heureFinNouvelle,
          },
        ],
        { session },
      );
      nouvelleImputation = creee;
    });
  } finally {
    await session.endSession();
  }
  return nouvelleImputation;
}

// Scission symétrique : l'édition de heureDebut ferait franchir minuit vers la
// veille. L'Imputation d'origine est tronquée au début de sa journée d'origine ;
// une nouvelle Imputation démarre à l'heure demandée (reportée d'un jour en
// arrière) et se termine à la fin de la veille.
async function scinderVersLaVeille(imputation, heureDebutDemandee) {
  const jourOrigine = imputation.heureFin;
  const veille = new Date(jourOrigine.getTime() - UN_JOUR_MS);
  const heureDebutNouvelle = new Date(heureDebutDemandee.getTime() - UN_JOUR_MS);
  const heureFinNouvelle = finJourUTC(veille);

  imputation.heureDebut = debutJourUTC(jourOrigine);

  const session = await mongoose.startSession();
  let nouvelleImputation;
  try {
    await session.withTransaction(async () => {
      await imputation.save({ session });
      const [creee] = await Imputation.create(
        [
          {
            utilisateurId: imputation.utilisateurId,
            projetId: imputation.projetId,
            activiteId: imputation.activiteId,
            heureDebut: heureDebutNouvelle,
            heureFin: heureFinNouvelle,
          },
        ],
        { session },
      );
      nouvelleImputation = creee;
    });
  } finally {
    await session.endSession();
  }
  return nouvelleImputation;
}

async function chargerProjetEtActivite(req, res, projetId, activiteId) {
  const { projet, erreur } = await verifierAccesProjet(projetId, req.utilisateur);
  if (erreur) {
    res.status(erreur.statut).json({ message: erreur.message });
    return null;
  }

  if (activiteId) {
    const { erreur: erreurActivite } = await verifierAccesActivite(projet, activiteId);
    if (erreurActivite) {
      res.status(erreurActivite.statut).json({ message: erreurActivite.message });
      return null;
    }
  }

  return projet;
}

function estProprietaireOuAdmin(req, imputation) {
  return estAdministrateur(req.utilisateur) || memeId(imputation.utilisateurId, req.utilisateur._id);
}

router.get('/chrono/status', async (req, res) => {
  const imputationOuverte = await Imputation.findOne({
    utilisateurId: req.utilisateur._id,
    heureFin: null,
  });
  res.json(imputationOuverte ? toPublicImputation(imputationOuverte) : null);
});

// Un Utilisateur ne peut avoir qu'une seule Imputation en cours à la fois (voir
// CONTEXT.md) : démarrer un chronomètre alors qu'un autre est déjà actif n'est plus
// refusé (409), mais arrête automatiquement celui en cours avant de démarrer le
// nouveau. Fermeture de l'ancien + création du nouveau sont atomiques (même
// transaction), suivant le même schéma que la Scission (ticket 06). La réponse
// indique si un chrono précédent a été arrêté, avec ses informations.
router.post('/chrono/start', async (req, res) => {
  const { projetId, activiteId, nomNouvelleActivite } = req.body;

  const projet = await chargerProjetEtActivite(req, res, projetId, nomNouvelleActivite ? null : activiteId);
  if (!projet) return;

  const activite = nomNouvelleActivite
    ? await Activite.create({ nom: nomNouvelleActivite, projetId: projet._id })
    : await Activite.findOne({ _id: activiteId, projetId: projet._id });

  const session = await mongoose.startSession();
  let nouvelleImputation;
  let chronoPrecedentArrete = null;
  try {
    await session.withTransaction(async () => {
      const dejaOuverte = await Imputation.findOne({
        utilisateurId: req.utilisateur._id,
        heureFin: null,
      }).session(session);

      if (dejaOuverte) {
        dejaOuverte.heureFin = new Date();
        await dejaOuverte.save({ session });
        chronoPrecedentArrete = dejaOuverte;
      }

      const [creee] = await Imputation.create(
        [
          {
            utilisateurId: req.utilisateur._id,
            projetId: projet._id,
            activiteId: activite._id,
            heureDebut: new Date(),
            heureFin: null,
          },
        ],
        { session },
      );
      nouvelleImputation = creee;
    });
  } finally {
    await session.endSession();
  }

  res.status(201).json({
    ...toPublicImputation(nouvelleImputation),
    chronoPrecedentArrete: chronoPrecedentArrete ? toPublicImputation(chronoPrecedentArrete) : null,
  });
});

router.post('/chrono/stop', async (req, res) => {
  const imputationOuverte = await Imputation.findOne({
    utilisateurId: req.utilisateur._id,
    heureFin: null,
  });
  if (!imputationOuverte) {
    return res.status(404).json({ message: 'Aucun chronomètre actif' });
  }

  imputationOuverte.heureFin = new Date();
  await imputationOuverte.save();

  res.json(toPublicImputation(imputationOuverte));
});

router.post('/', async (req, res) => {
  const { projetId, activiteId, heureDebut, heureFin } = req.body;
  if (!projetId || !activiteId || !heureDebut || !heureFin) {
    return res.status(400).json({ message: 'projetId, activiteId, heureDebut et heureFin sont requis' });
  }

  const projet = await chargerProjetEtActivite(req, res, projetId, activiteId);
  if (!projet) return;

  const imputation = await Imputation.create({
    utilisateurId: req.utilisateur._id,
    projetId,
    activiteId,
    heureDebut: new Date(heureDebut),
    heureFin: new Date(heureFin),
  });

  res.status(201).json(toPublicImputation(imputation));
});

router.get('/', async (req, res) => {
  const filtre = { utilisateurId: req.utilisateur._id };
  if (req.query.date) {
    const debutJour = new Date(`${req.query.date}T00:00:00.000Z`);
    const finJour = new Date(`${req.query.date}T23:59:59.999Z`);
    filtre.heureDebut = { $gte: debutJour, $lte: finJour };
  }

  const imputations = await Imputation.find(filtre).sort({ heureDebut: -1 });
  res.json(imputations.map(toPublicImputation));
});

router.patch('/:id', async (req, res) => {
  const imputation = await chargerOuNotFound(Imputation, req.params.id, res, 'Imputation introuvable');
  if (!imputation) return;

  if (!estProprietaireOuAdmin(req, imputation)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  const heureDebutFournie = Object.prototype.hasOwnProperty.call(req.body, 'heureDebut');
  const heureFinFournie = Object.prototype.hasOwnProperty.call(req.body, 'heureFin');

  const heureDebutFinale = req.body.heureDebut ? new Date(req.body.heureDebut) : imputation.heureDebut;
  const heureFinFinale = req.body.heureFin ? new Date(req.body.heureFin) : imputation.heureFin;

  const franchitMinuit = Boolean(heureFinFinale) && heureFinFinale < heureDebutFinale;

  if (franchitMinuit) {
    // Scission automatique (ADR 0003) : le franchissement de minuit ne rejette plus
    // l'édition, il déclenche une scission. La direction (vers le lendemain ou vers
    // la veille) se déduit du champ effectivement édité par l'Utilisateur.
    if (heureFinFournie && !heureDebutFournie) {
      const nouvelleImputation = await scinderVersLeLendemain(imputation, heureFinFinale);
      return res.json({ ...toPublicImputation(imputation), scission: toPublicImputation(nouvelleImputation) });
    }
    if (heureDebutFournie && !heureFinFournie) {
      const nouvelleImputation = await scinderVersLaVeille(imputation, heureDebutFinale);
      return res.json({ ...toPublicImputation(imputation), scission: toPublicImputation(nouvelleImputation) });
    }

    // heureDebut et heureFin édités simultanément avec inversion résultante : la
    // direction de la Scission est ambiguë, on refuse plutôt que de deviner.
    return res.status(400).json({
      message: "L'heure de fin ne peut pas être antérieure à l'heure de début",
    });
  }

  imputation.heureDebut = heureDebutFinale;
  imputation.heureFin = heureFinFinale;
  await imputation.save();

  res.json({ ...toPublicImputation(imputation), scission: null });
});

router.delete('/:id', async (req, res) => {
  const imputation = await chargerOuNotFound(Imputation, req.params.id, res, 'Imputation introuvable');
  if (!imputation) return;

  if (!estProprietaireOuAdmin(req, imputation)) {
    return res.status(403).json({ message: 'Accès refusé' });
  }

  await imputation.deleteOne();
  res.status(204).send();
});

module.exports = router;
