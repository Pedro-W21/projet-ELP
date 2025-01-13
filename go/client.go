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

// fonction pour demander une data à l'utilisateur ////////////////////////////////////////////////////////////////
func requete(chaine string, reader io.Reader) string {
	bufReader := reader.(*bufio.Reader) // Conversion de reader io.Reader en *bufio.Reader
	fmt.Print(chaine + " : \n")
	nom, _ := bufReader.ReadString('\n')
	return nom
}

// fonction pour traiter les data reçus en parallèle d'écouter le canal ///////////////////////////////////////////
func traitement(recu ClientRequestResponse, longueur uint, hauteur uint) {
	fmt.Print("données reçue du serveur!")

	//pour recréer l'image
	imageFinale := Image{recu.Final_image.Data, longueur, hauteur}
	var long int = int(longueur)
	var haut int = int(hauteur)
	RESULTAT := image.NewRGBA(image.Rect(0, 0, long, haut))
	for i := 0; i < long; i++ {
		for j := 0; j < haut; j++ {
			//pour trouver le curseur dans liste de couleur
			var longueurTot int
			longueurTot = int(imageFinale.Longueur)
			index := j*longueurTot + i

			//pour déterminer les couleurs rgb dans la liste à l'index donné
			//fmt.Println("data à (x,y) : ", i, j, imageFinale.Data[index].R, imageFinale.Data[index].G, imageFinale.Data[index].B)
			r := imageFinale.Data[index].R
			g := imageFinale.Data[index].G
			b := imageFinale.Data[index].B

			// convertissage de uint8 en uint32 pour pouvoir faire le calcul avec 256
			R := uint32(r)
			G := uint32(g)
			B := uint32(b)

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

// fonction pour demander des trucs au client /////////////////////////////////////////////////////////////////////
func client(reader io.Reader, request_id int) ClientRequest {
	//initialisation d'un clientrequest à vide pour sortir de la fonction en cas d'erreur
	data := []Color{}
	data = append(data, Color{0, 0, 0})
	img_vide := Image{data, 1, 1}
	filt := Gaussian{0.5}
	none := ClientRequest{0, img_vide, filt}

	//récolte le reste des data
	var chemin, filtre string
	texte1 := fmt.Sprintf("Entrez le chemin de l'image numéro : %d", request_id)
	chemin = requete(texte1, reader)
	chemin = strings.TrimSpace(chemin)

	texte2 := fmt.Sprintf("Entrez le filtre que vous voulez appliquer à l'image %d. Vous avez le choix entre : \n1. Le filtre Gaussien: dans ce cas tapez Gaussien\n2. Un floutage: dans ce cas tapez Flou", request_id)
	filtre = requete(texte2, reader)
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
			return none
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
		return none
	}
	if format != "jpeg" && format != "png" {
		fmt.Println("Erreur, fichier pas en jpeg ou png")
		return none
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
	for j := bound.Min.Y; j < bound.Max.Y; j++ {
		for i := bound.Min.X; i < bound.Max.X; i++ {
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
		structFiltre = Gaussian{puissance, make([]float32, 0), 0.0}
	} else {
		structFiltre = Gaussian{puissance, make([]float32, 0), 0.0} //A VOIR POUR LES AUTRES FILTRES
	}
	var req_id uint = uint(request_id)
	structAenvoyer := ClientRequest{req_id, structImage, structFiltre}
	return structAenvoyer
}

// fonction pour écouter le canal /////////////////////////////////////////////////////////////////////////////////
func ecoute(conn net.Conn, longueur uint, hauteur uint) {
	decoder := gob.NewDecoder(conn)
	var recu ClientRequestResponse //variable pour stocker l'image
	er := decoder.Decode(&recu)
	if er != nil {
		fmt.Println("Erreur lors du décodage:", er)
		return
	}
	go traitement(recu, longueur, hauteur) //pour traiter ce qu'on a reçu en même temps
}

func pour_chaque_requete(id_en_cours int, reader io.Reader, conn net.Conn) {
	//crée un nouveau encodeur pour envoyer
	structAenvoyer := client(reader, id_en_cours)
	nouveauEncodeur := gob.NewEncoder(conn)
	erreur := nouveauEncodeur.Encode(structAenvoyer) //envoi des données
	if erreur != nil {
		fmt.Println("Erreur lors de l'encodage:", erreur)
		return
	}
	fmt.Println("Les données ont été envoyées avec succès pour la requete %d", id_en_cours)

	//boucle continue pour écouter le canal en continu
	longueur := structAenvoyer.Sent_image.Longueur
	hauteur := structAenvoyer.Sent_image.Hauteur
	go ecoute(conn, longueur, hauteur)
}

// fonction principale //////////////////////////////////////////////////////////////////////////////////
func principale() {
	//pour se connecter au serveur
	gob.Register(Gaussian{}) //RAJOUTER TOUS LES FILTRES APRES
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

	//déjà récupérer sur combien d'images on fait
	reader := bufio.NewReader(os.Stdin)
	var id string
	id = requete("Sur combien d'images voulez-vous appliquer des filtres? ", reader)
	id = strings.TrimSpace(id)
	//traitement des erreurs :
	var ERR error
	var request_id int
	request_id, ERR = strconv.Atoi(id)
	c := 0
	for c != 1 {
		if ERR != nil {
			id = requete("Veuillez entrer le nombre d'images avec un nombre entier ", reader)
			c = -1
		} else {
			c = 1
		}
		request_id, ERR = strconv.Atoi(id)
	}

	// boucle pour faire les actions sur toutes les requetes
	for i := 1; i <= request_id; i++ {
		go pour_chaque_requete(request_id, reader, conn)
	}
}

//reste à changer:
//les autres filtres (ligne 95 et 103) avec les autres
