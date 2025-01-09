# Système de filtrage d'image en client-serveur

## définition d'une image en interne
- longueur et largeur de l'image (entiers 64 bit non signés)
- liste de pixels mono dimensionnelle de longueur {largeur de l'image * hauteur de l'image} (l'accès à un pixel est légèrement plus compliqué à programmer mais beaucoup plus rapdie à l'exécution)
- un pixel est un triplet d'entiers 8 bits représentant les couleurs rouges, vertes et bleues de ce pixel

## Définition d'un filtre

- nom du filtre
- paramètres liés au filtre (nombre et types variables)
- comme on a pas de type de somme en Go, pour jsonifier un filtre on va utiliser un dictionnaire
{
    "filter_name":"{nom du filtre}"
    "filter_data":{données du filtre précis voulu}
}

puis on pourra extraire le filtre avec un switch case sur "filter_name"

## architecture globale

### Client
- le client a les images, et l'utilisateur donne l'addresse IP + port du serveur pour s'y connecter en TCP
- l'utilisateur décrit l'image qu'il veut filtrer et le filtre correspondant 
- le client envoie une requête de la forme
{   
    "image_name":"{nom de l'image}",
    "image_width":{largeur de l'image},
    "image_height":{hauteur de l'image},
    "image_data":{les pixels, possiblement sous forme d'entiers 32 bits pour être rapide à l'encodage/décodage},
    "applied_filter":{le filtre, jsonifié}
}
- le client attend la réponse du serveur, tout en laissant l'utilisateur faire d'autres requêtes pendant ce temps

### Le serveur

- le serveur écoute sur son port TCP puis établit les connections de clients
- il décode les requêtes entrantes puis envoie ça dans des goroutines qui gèrent les requêtes client

#### Le thread qui gère la requête client

- a une connection TCP vers son client associé
- spawn N={nombre de coeurs} goroutines de travail avec un channel input et output
- envoie le travail divisé en N dans le channel input
- attend de recevoir et de rassembler l'image finale puis l'envoie au client

#### Les thread de travail

- a un canal de communication recevant du thread ordonnanceur et un canal envoyant
- attend de recevoir une demande de travail du thread ordonnanceur, qui contient une vue read-only sur l'image originale ainsi que sur les paramètres de calcul
- effectue le calcul demandé, et renvoie le résultat au thread ordonnanceur