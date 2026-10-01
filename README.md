# Nuit Noire

Landing page d'un business fictif, des veillées d'astronomie sur le Causse Méjean (Lozère), reliée à une automatisation **n8n** : quand on remplit le formulaire en bas de page, on reçoit un mail récapitulatif.

**Voir le site :** https://vspilou.github.io/nuit-noire/

## Tester l'envoi du mail

1. Descendez jusqu'à l'aube (en bas de page).
2. Complétez la phrase avec votre prénom, une date et **votre adresse e-mail**, puis « Demander une nuit ».
3. Le récapitulatif arrive dans votre boîte en quelques secondes (pensez aux indésirables).

Le formulaire passe par le n8n de l'auteur, sur son ordinateur : il ne répond que pendant les démos.

## Ce qu'il y a dedans

| Fichier | Rôle |
|---|---|
| `index.html` | La page : HTML, CSS et JavaScript sans framework. Ciel dessiné en canvas, paysage en SVG, aucune image. |
| `scrollcraft.js`, `scrollcraft.css` | Moteur de défilement scrollcraft (licence MIT, Nate Herk, voir `LICENCE-scrollcraft.txt`). |
| `n8n/nuit-noire.workflow.json` | Le workflow à importer dans n8n : Webhook → Valider → mail à l'équipe → mail au visiteur → réponse. |
| `n8n/valider.js` | Le code du nœud « Valider » : contrôle des champs, anti-robot, calcul de la Lune, mise en page des deux mails. |
| `demo.mjs` | Ouvre le formulaire au public le temps d'une démo (tunnel Cloudflare gratuit). Seule l'adresse du formulaire est exposée, limitée à 5 demandes par minute et par IP. |
| `BRIEF.md` | Direction artistique et partis pris. |

## Lancer la démo (auteur)

1. Démarrer n8n (Docker) avec le workflow publié et un identifiant SMTP Gmail rattaché aux deux nœuds mail.
2. `node demo.mjs` : le script ouvre le tunnel, relie le formulaire à la nouvelle adresse et pousse la page sur GitHub.
3. Laisser la fenêtre ouverte pendant le test, Ctrl+C pour fermer.

En local, `index.html` servi sur `localhost` parle directement à `http://localhost:5678`.
