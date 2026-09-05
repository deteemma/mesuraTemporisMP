export interface Utilisateur {
  id: string;
  login: string;
  nom: string;
  role: 'utilisateur' | 'administrateur';
  doitChangerMotDePasse: boolean;
}
