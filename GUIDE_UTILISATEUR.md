# Guide d'Utilisation - Africa Sound City

Bienvenue sur la plateforme web de réservation et de gestion d'Africa Sound City.
Ce document est conçu pour vous expliquer de manière simple et claire comment fonctionne votre site et comment vous pouvez le gérer en toute autonomie (sans avoir besoin de compétences techniques ou de codage).

---

## 1. Comment ça marche pour vos Clients (Visiteurs) ?

Lorsqu'un visiteur arrive sur votre site, il a accès à une interface fluide qui lui permet de :
- **Découvrir vos espaces :** Consulter les informations sur la salle de spectacle, le studio d'enregistrement et le restaurant-bar.
- **Voir vos horaires et tarifs :** Ces informations sont toujours à jour et proviennent de vos réglages.
- **Réserver en ligne :** Un client peut choisir un espace (salle, studio ou table au restaurant), indiquer la date et l'heure. Le système calcule immédiatement et automatiquement le prix total en fonction du temps et du service.
- **Payer de manière sécurisée (FedaPay) :** Une fois la réservation confirmée, le client clique sur "Payer". Une nouvelle fenêtre FedaPay s'ouvre pour effectuer le paiement de façon sécurisée (Mobile Money ou Carte Bancaire).
- **Finaliser la commande :** Une fois le paiement réussi, la réservation est enregistrée et un "Code Ticket" unique est généré.

---

## 2. Votre Espace Administrateur (Vos Privilèges)

L'espace administrateur est votre tableau de bord privé (Back-Office). C'est là que vous contrôlez toute l'activité et le contenu de votre site.

**Comment y accéder ?**
- Ajoutez `/admin` à l'adresse web de votre site (exemple: `www.votre-site.com/admin` ou en cliquant sur le logo Admin si disponible).
- Entrez votre mot de passe administrateur : **`asc-admin-2026`**. *(Ce mot de passe est la clé de votre entreprise, veillez à le garder secret).*

Une fois connecté, vous avez accès à un menu avec 5 grands onglets :

### A. L'onglet "Réservations" (Votre activité)
C'est le cœur de votre gestion. 
- **Historique complet :** Vous avez un tableau listant toutes les réservations (nom du client, date, type d'espace, montant).
- **Statut de création :** Vous pouvez voir si une commande a été payée (Statut "paid") ou si elle est en attente.
- **Validation des tickets :** Lorsqu'un client se présente physiquement dans vos locaux avec son Code Ticket, vous le tapez dans la barre de validation à l'écran. Le système vous dira instantanément s'il est valide et payé. Si oui, il passe en statut "Validé", pour éviter toute fraude (le même ticket ne pourra plus être utilisé 2 fois).
- **Export Comptable :** Vous pouvez exporter vos réservations en un clic sur un fichier **Excel** ou **PDF**. Très utile pour faire votre comptabilité en fin de mois.

### B. L'onglet "Tarifs"
Gérez vos prix en totale autonomie. Vous pouvez y modifier le prix horaire de la salle, du studio ou le prix d'une réservation au restaurant. Dès que vous sauvegardez, les prochains clients se verront facturer ce nouveau prix.

### C. L'onglet "Horaires"
Configurez vos jours et heures d'ouverture. Vous définissez l'heure d'ouverture et de fermeture pour chaque jour de la semaine. Le calendrier de réservation des clients sera automatiquement bloqué en dehors de ces heures.

### D. L'onglet "Avis"
Consultez et gérez les retours de vos clients pour surveiller la satisfaction et la réputation de votre établissement.

### E. L'onglet "Contenu" (Personnalisation du site)
Cet onglet vous offre le pouvoir de modifier l'apparence de votre site web, sans jamais appeler votre développeur !
- **Changer de Logo :** Mettez à jour le logo du site en modifiant simplement le lien de l'image.
- **Modifier les Images :** Changez les différentes photos affichées sur le site public (photos de présentation, de la salle, du studio, de vos plats, etc.).
- **Textes et Menus (Sections Dynamiques) :** Vous pouvez personnaliser les gros titres et les paragraphes accrocheurs pour chaque espace.
- *N'oubliez pas de cliquer sur "Enregistrer" en bas de page pour appliquer vos changements sur le site en direct.*

---

## 3. Ce qu'il faut absolument retenir
1. **Paiement et Argent :** L'argent de vos clients va directement sur votre propre compte FedaPay. Le site ne touche en aucun cas à votre argent corporel, il communique juste avec FedaPay pour s'assurer que "Le client a bien réglé la somme".
2. **Indépendance Totale :** Que ce soit pour un changement de prix de dernière minute, une modification d'horaire pour la fête nationale, ou changer la photo en page d'accueil d'un concert, **vous avez la main**. Vous ne dépendez pas du développeur techniquement pour faire du commerce.
3. **Sécurité :** Ne donnez accès au module administrateur qu'à des personnes de confiance. Ceux qui ont le mot de passe ont le pouvoir de modifier vos prix, il faut donc être vigilant.
