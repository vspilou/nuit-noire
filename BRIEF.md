# Nuit Noire · BRIEF

**Self-authored under explicit creative delegation.** Demande de l'utilisateur, mot pour mot :
« une landing page ultra designer […] la landing page doit être un business dont je n'ai jamais travaillé, choisis la DA ».
Seule contrainte fonctionnelle donnée : « un utilisateur peut écrire dans la page et recevoir un mail » via son n8n.

## Le business (choisi)
Nuit Noire : veillées d'astronomie en petit groupe sur le Causse Méjean (Lozère), dans la Réserve internationale
de ciel étoilé des Cévennes (labellisée en 2018). Marque fictive, lieu réel.
Action unique : **Demander une nuit** (une demande, pas une réservation confirmée : la page ne promet que ce que le flux fait).

## Les huit sujets (décisions d'auteur)
1. **Ambiance** : patient, vertigineux, exact. Références : les atlas célestes du XIXᵉ (Burritt, 1835, didones et italiques pour les constellations), les poses longues de filé d'étoiles, le silence d'un plateau calcaire la nuit.
2. **Parcours** : le crépuscule arrive, on mesure ce qu'on a perdu en ville, on éteint tout, le ciel tourne, on comprend le déroulé, l'aube et la demande.
3. **Énergie** : calme, tension, très calme, sommet, posé, résolu.
4. **Ressenti et moment unique** : voir courbe ci-dessous. Le moment : faire tourner le ciel avec sa molette.
5. **Ce qu'aucun site ne fait** : le défilement est le temps d'obturation. Chaque cran de molette ajoute des minutes de pose, et les étoiles tracent leurs arcs au vrai rythme du ciel (15° par heure).
6. **Distance au premium-minimal** : éditorial nocturne. Sombre parce que le sujet est la nuit, pas par réflexe. Un accent rouge parce que c'est la seule lumière qu'on garde la nuit en astronomie (elle préserve l'adaptation de l'œil).
7. **Un monde ou des scènes** : des scènes, une par heure de la nuit, en coupes franches.
8. **Ressources** : aucune. Tout est codé (canvas, SVG). Zéro image téléchargée, zéro dépense.

## Grammaire : « Nocturne horaire » (nouvelle, définie ici)
- **Unité** : un chapitre = une heure de la nuit (21:40, 22:30, 23:15, 00:30, 03:00, 06:10).
- **Navigation** : un rail d'heures fixe à droite, cliquable ; l'heure courante est marquée par un point de lumière rouge. Sur mobile, l'heure courante dans la barre.
- **Séquence** : le fond s'assombrit chapitre après chapitre, en coupes franches (pas de dégradé interpolé), puis remonte à l'aube.
- **Fin** : l'aube. La demande est une phrase à trous, pas un bloc de formulaire.
- **Interdits** : magnet, spotlight, tilt, vidéo scrub, compteurs (aucun chiffre vérifié à animer), cartes, indicateur « scroll », numéros de section, accent en confettis.

Pourquoi pas les huit grammaires existantes : filmic one-shot interdit la séquence visible, or ici l'heure *est* l'information ; chaptered editorial impose une page de titre sans image, ce qui tue le ciel du héros ; continuous world exige une vidéo de vol continu (pas de rush, zéro dépense) ; live surface, gallery, split stage et cutlist ne collent pas à une nuit qui s'écoule lentement ; typographic poster interdit le fond « photographique » que joue ici le ciel codé.

## Courbe de ressenti (écrite avant la partition)
| Heure | Émotion | Ce qui la provoque |
|---|---|---|
| 21:40 Crépuscule | émerveillement calme | les plans du Causse se séparent, les étoiles s'allument une à une, le titre passe derrière la crête |
| 22:30 Le ciel perdu | manque | un ciel de ville orangé avec trois douzaines d'étoiles, effacé par le ciel du Causse |
| 23:15 Extinction | patience, chuchotement | presque rien : une phrase, une lampe rouge. **Silence voulu** (pas du vide mort) |
| 00:30 Pose longue | vertige (SOMMET) | la molette ouvre l'obturateur, le ciel tourne autour de la Polaire, le compteur de pose est réel |
| 03:00 Le déroulé | confiance | la nuit défile latéralement, heure par heure, concrète |
| 06:10 Aube | résolution, envie | la lumière revient, la date de la prochaine nouvelle lune, une phrase à compléter |

**Le sommet** : « J'ai fait tourner le ciel avec ma molette. » Acte 00:30, plus grande longueur de défilement de la page (3,8 écrans), précédé de l'acte le plus calme.
**La phrase à raconter** : « C'est le site où ton scroll devient une pose longue du ciel étoilé. »

## Partition
| Heure | Dispositif | Pourquoi |
|---|---|---|
| 21:40 | parallax (plans SVG + ciel canvas, épinglé 1,9) | la profondeur d'un plateau la nuit : loin, brume, titre, crête, premier plan |
| 22:30 | reveal (épinglé 2,2) | un ciel en devient un autre : c'est un changement d'état |
| 23:15 | flow + in | la seule section qui se lit comme une page, et le calme avant le sommet |
| 00:30 | pin + canvas piloté par `--sc-p` (3,8) | le signature move, le plus long |
| 03:00 | pan (3,0) | une chronologie se lit en largeur |
| 06:10 | flow + in, fin tenue | la demande, sur fond d'aube, pied de page dedans |

Cinq familles, jamais deux fois de suite, zéro scrub vidéo. 6 actes, environ 13 écrans au total sur desktop (pas 13,6–13,8 avec 6–7 actes : vérifié à la livraison).

## Contrat de calques du héros
| Plan | Matière | Mouvement | Règle |
|---|---|---|---|
| Ciel | canvas : dégradé de crépuscule, ~1 400 étoiles, Voie lactée | les étoiles s'allument avec le défilement | — |
| Causse lointain | SVG, mesas plates, bleu-gris | monte de 4 vh, ±6 px souris | perspective atmosphérique |
| Brume des gorges | dégradés CSS | dérive lente, boucle 38 s | sépare loin et proche |
| Titre | HTML | monte de 6 vh, s'efface | entièrement lisible à l'arrivée |
| Crête proche | SVG, télescope et tente à lampe rouge | monte de 24 vh, ±14 px | recouvre le titre en fin de héros |
| Premier plan | SVG, rochers | monte de 36 vh, ±24 px | — |

Mobile : titre au-dessus des crêtes (il ne passe pas derrière), course réduite.
Mouvement réduit : composition statique en plans superposés, héros d'un seul écran, traînées d'étoiles affichées complètes.

## Faits utilisés (vérifiables)
- Réserve internationale de ciel étoilé des Cévennes, labellisée par l'IDA en 2018.
- Plus d'un tiers de l'humanité ne voit plus la Voie lactée (Falchi et al., *Science Advances*, 2016).
- L'œil met 20 à 30 minutes à s'adapter à l'obscurité ; la lumière rouge préserve cette adaptation.
- Le ciel tourne d'environ 15° par heure autour du pôle céleste (15,04° en temps sidéral).
- Dates de nouvelle lune calculées dans la page (algorithme de Meeus, termes principaux).
Aucun tarif, aucun avis, aucune statistique de l'entreprise : elle n'existe pas.
