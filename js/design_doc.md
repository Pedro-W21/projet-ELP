# Just One directement en client/serveur

## Etape 0 : choisir le joueur actif
- tous les joueurs se connectent (ou on choisit le nombre de joueurs en local)
- le serveur choisit un joueur qui commence (ou le premier joueur qui joue)


# Just One en full local

## Etape 0 : setup du jeu
- on donne le nombre de joueurs
- le premier joueur est le joueur actif
- on clear la console

## Etape 1 : Sélection du mot mystère
- on choisit un chevalet de 5 mots parmi le dictionnaire par défaut
- on demande au joueur actif le mot voulu de 1 à 5
- une fois choisi, on le stocke et on clear la console en attendant un input du prochain joueur poura afficher la suite

## Etape 2 : Choix des indices
- chacun leur tour, les autres joueurs :
    - font un input pour indiquer qu'ils ont le clavier, on clear la console
    - on affiche le mot mystère à faire deviner
    - le joueur peut soit demander à avoir un autre mot, soit deviner
    - si il devine, il n'a pas nécessairement besoin d'entrer un indice valide
- si à la fin de cette partie, tous les joueurs non-actifs ont demandé un autre mot, on repart à l'étape 0

## Etape 3 : comparaison des indices
- le joueur actif ne revient toujours pas, on affiche tous les indices et leurs conflits
- après un input, on clear et on affiche les indices finaux


## Etape 4 : Réponse

- le joueur actif revient, et il n'a le droit qu'à 1 SEULE REPONSE 
- si c'est réussi
    - on augmente le nombre de cartes réussies de 1
    - on repart de l'étape 1 en faisant jouer le prochain joueur 
- si c'est pas réussi
    - on augmente pas le nombre de cartes réussies et on enlève les 5 mots possibles du dictionnaire (la copie bien-sûr, pas l'original)
    - on repart de l'étape 1 en faisant jouer le prochain joueur

Remarque : besoin de garder le compte des cartes totales jouées car le max c'est 13