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
- il décode les requêtes entrantes puis envoie ça à un thread ordonnanceur
- reçoit les réponses calculées aux requêtes depuis le thread ordonnanceur puise encode ça et envoie à l'utilisateur

#### Le thread ordonnanceur 
- a des canaux de communications vers et depuis tous les thread de travail, et un état associé à chaque thread de travail
- reçoit les requêtes décodées du thread d'écoute et les stocke dans une pile FIFO
- compte le nombre de threads de travail libres N puis leur envoie la requête prioritaire (premier élément de la pile, le plus vieux) configurée pour travailler sur N threads en parallèle
    - stocke au passage une "image finale" qui est mise à jour avec le retour des thread de calcul
    - met à jour l'état du thread de travail à "travail"
- attend de recevoir des réponses à ses calculs pour les mettre en commun ET attend de recevoir les requêtes décodées du thread d'écoute
    - si il recçoit une réponse de calcul, met à jour l'état du thread de travail correspondant 
- une fois un calcul fini


#### Les thread de travail

- a un canal de communication recevant du thread ordonnanceur et un canal envoyant
- attend de recevoir une demande de travail du thread ordonnanceur, qui contient une vue read-only sur l'image originale ainsi que sur les paramètres de calcul
- effectue le calcul demandé, et renvoie le résultat au thread ordonnanceur