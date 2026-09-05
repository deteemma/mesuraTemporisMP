function estAdministrateur(utilisateur) {
  return utilisateur.role === 'administrateur';
}

module.exports = { estAdministrateur };
