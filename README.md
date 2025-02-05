# projet-ELP
repo contenant le projet ELP de 3TC

## Go

sujet choisi : filtres d'image

filtres : 
- Négatif
- Gaussien
- Flou moyenneur
- Fondu Négatif
- Filtres Chaud/Froid
- Luminosité
- Flou fondu
- Jeu de la vie (sur les images noires/blanches)
- Transformée de Fourier discrète 2D

pour lancer le projet :
- une version de go >= 1.23 est nécessaire
- aller dans le répertoire `go`
- exécuter `go run *.go` (au moins 2 fois en parallèle pour lancer un serveur et un client !)


## Elm

Pour lancer le projet :
- avoir elm stable le plus récent d'installé
- aller dans le répertoire `elm`
- `elm make` dans une invite de commande
- lancer le site index.html résultant dans votre navigateur favori (testé sur Firefox et Chrome)

Remarque :
- notre comparaison Elm/JS écrite se trouve dans le fichier `comparaison_elm_js.md` dans le dossier `elm` du projet

## JS

Pour lancer le projet :
- avoir node.js installé
- aller dans le répertoire `js`
- `npm install` puis `npm start` dans une invite de commande
- suivre les instructions données (il faut bien au moins 2 clients pour lancer une partie !)

Remarque :
- bien que le code target `localhost` comme adresse d'hôte hardcodée pour rendre le test plus simple, nous avons bien testé le client/serveur sur plusieurs machines en utilisant un hotspot wifi, et tout fonctionnait