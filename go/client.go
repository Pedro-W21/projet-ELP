package main

import (
	"bufio"
	"encoding/gob"
	"fmt"
	"image"
	"image/color"
	_ "image/jpeg"
	"image/png"
	_ "image/png"
	"io"
	"net"
	"os"
	"strconv"
	"strings"
)

// fonction pour demander une data à l'utilisateur
func requete(chaine string, reader io.Reader) string {
	bufReader := reader.(*bufio.Reader) // Conversion de reader io.Reader en *bufio.Reader
	fmt.Print(chaine + " : \n")
	nom, _ := bufReader.ReadString('\n')
	return nom
}

// fonction principale
func client() {
	//connexion au serveur
	var port int
	fmt.Print("Saisissez le port sur lequel vous voulez communiquer avec le serveur : \n")
	fmt.Scanln(&port)
	address := fmt.Sprintf("localhost:%d", port)
	conn, err := net.Dial("tcp", address)

	if err != nil {
		fmt.Println("Erreur lors de la connexion avec le serveur:", err)
		return
	}

	defer conn.Close() //pour être sûr que la connexion va se fermer
	fmt.Println("Connexion établie avec le serveur sur le port ", port)

	//création de demandes à l'utilisateur pour récoter les données
	var chemin, filtre string
	reader := bufio.NewReader(os.Stdin)
	chemin = requete("Entrez le chemin de l'image", reader)
	chemin = strings.TrimSpace(chemin)

	filtre = requete("Entrez le filtre que vous voulez appliquer à l'image. Vous avez le choix entre : \n1. Le filtre Gaussien: dans ce cas tapez Gaussien\n2. Un floutage: dans ce cas tapez Flou", reader)
	filtre = strings.TrimSpace(filtre)

	var typeFiltre int
	var P float64
	var puissance float32
	var probleme error
	if filtre == "Gaussien" {
		typeFiltre = 1
		p := requete("Quelle puissance voulez-vous pour le filtre gaussien? Entrez une valeur décimale de 0.5 à 5.", reader)
		p = strings.TrimSpace(p)
		P, probleme = strconv.ParseFloat(p, 32) //conversion de p (string) en float64
		puissance = float32(P)                  //conversion de P (float64) en  float32
		if probleme != nil {
			fmt.Println("Erreur lors de la conversion de p en float 32:", probleme)
			return
		}
	} else {
		typeFiltre = 2
		P = 0
		puissance = 0
	}

	// aller à l'emplacement de l'image, lire les données et les récupérer sous forme de pixels entier 32 bits
	fichier, err := os.Open(chemin)           //on ouvre l'image
	img, format, err := image.Decode(fichier) //le decode

	if err != nil {
		fmt.Println("Erreur lors de l'ouverture et/ou décodage de l'image:", err)
		return
	}
	if format != "jpeg" && format != "png" {
		fmt.Println("Erreur, fichier pas en jpeg ou png")
		return
	}

	//récupère la taille
	bound := img.Bounds()
	var haut, long int
	haut = bound.Max.Y - bound.Min.Y
	long = bound.Max.X - bound.Min.X
	var hauteur uint = uint(haut)
	var longueur uint = uint(long)

	//crée le struct à envoyer
	structCouleur := []Color{}
	for i := bound.Min.X; i <= bound.Max.X; i++ {
		for j := bound.Min.Y; j <= bound.Max.Y; j++ {
			pixel := img.At(i, j)
			r, g, b, _ := pixel.RGBA()
			//ici convertir type de uint32 en uint8
			var R uint8 = uint8(r / 256)
			var G uint8 = uint8(g / 256)
			var B uint8 = uint8(b / 256)
			sousStructCouleur := Color{R, G, B}
			structCouleur = append(structCouleur, sousStructCouleur)
		}
	}
	structImage := Image{structCouleur, longueur, hauteur}

	var structFiltre Filter
	if typeFiltre == 1 {
		structFiltre = Gaussian{puissance}
	} else {
		structFiltre = Gaussian{puissance} //A VOIR POUR LES AUTRES FILTRES
	}
	structAenvoyer := ClientRequest{1, structImage, structFiltre} //le request_id à changer (la 1e variable)

	//crée un nouveau encodeur pour envoyer
	nouveauEncodeur := gob.NewEncoder(conn)
	erreur := nouveauEncodeur.Encode(structAenvoyer) //envoi des données
	if erreur != nil {
		fmt.Println("Erreur lors de l'encodage:", erreur)
		return
	}
	fmt.Println("Les données ont été envoyées avec succès!:", erreur)

	//code pour recevoir des données du serveur
	decoder := gob.NewDecoder(conn)
	var recu ClientRequestResponse //variable pour stocker l'image
	er := decoder.Decode(&recu)
	if er != nil {
		fmt.Println("Erreur lors du décodage:", er)
		return
	}
	//pour recréer l'image
	imageFinale := Image{recu.final_image.data, longueur, hauteur}
	RESULTAT := image.NewRGBA(image.Rect(bound.Min.X, bound.Min.Y, bound.Max.X, bound.Max.Y))
	for i := bound.Min.X; i <= bound.Max.X; i++ {
		for j := bound.Min.Y; j <= bound.Max.Y; j++ {
			//pour trouver le curseur dans liste de couleur
			var longueurTot int
			longueurTot = int(imageFinale.longueur)
			index := j*longueurTot + i

			//pour déterminer les couleurs rgb dans la liste à l'index donné
			r := imageFinale.data[index].r
			g := imageFinale.data[index].g
			b := imageFinale.data[index].b

			// convertissage de uint8 en uint32 pour pouvoir faire le calcul avec 256
			R := uint32(r) / 256
			G := uint32(g) / 256
			B := uint32(b) / 256

			// enfin, on reconvertit le résultat en uint8 pour l'installer dans l'image finale
			var red uint8 = uint8(R)
			var green uint8 = uint8(G)
			var blue uint8 = uint8(B)
			var A uint8 = 255
			RESULTAT.Set(i, j, color.RGBA{red, green, blue, A})
		}
	}

	//pour enregistrer l'image
	file, err := os.Create("resultat.png")
	if err != nil {
		fmt.Println("Erreur lors de la création du fichier résultat : ", err)
		return
	}
	defer file.Close()

	ERREUR := png.Encode(file, RESULTAT)
	if ERREUR != nil {
		fmt.Println("Erreur lors de l'encodage de l'image résultat :", ERREUR)
		return
	}

	fmt.Println("Image enregistrée sous le nom 'resultat.png'.")
}

//reste à changer:
//voir le request id (ligne 116) et les autres filtres (ligne 67 et 113)
