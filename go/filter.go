package main

import (
	"math"
	"math/cmplx"
	"sync"
)

type Filter interface {
	GetPixel(x uint, y uint, image Image) Color
	PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter
	NeedToSync() bool
	ChangeAfterSync(cmap *sync.Map) Filter
}

const GAUSSIAN_KERNEL_SIDE int = 7
const GAUSSIAN_KERNEL_OFFSET int = 3

type Gaussian struct {
	Strength     float32
	Kernel       []float32
	Kernel_total float32
}

func (g Gaussian) GetPixel(x uint, y uint, image Image) Color {
	total_R := float32(0.0)
	total_G := float32(0.0)
	total_B := float32(0.0)
	for x_t := 0; x_t < GAUSSIAN_KERNEL_SIDE; x_t++ {
		for y_t := 0; y_t < GAUSSIAN_KERNEL_SIDE; y_t++ {
			col_calc := image.GetAtInfaillible(x_t+int(x)-GAUSSIAN_KERNEL_OFFSET, y_t+int(y)-GAUSSIAN_KERNEL_OFFSET)
			//fmt.Println("kernel last")
			total_R += float32(col_calc.R) * g.Kernel[y_t*GAUSSIAN_KERNEL_SIDE+x_t]
			total_G += float32(col_calc.G) * g.Kernel[y_t*GAUSSIAN_KERNEL_SIDE+x_t]
			total_B += float32(col_calc.B) * g.Kernel[y_t*GAUSSIAN_KERNEL_SIDE+x_t]
		}
	}
	return Color{uint8(total_R * g.Kernel_total), uint8(total_G * g.Kernel_total), uint8(total_B * g.Kernel_total)}
}

func (g Gaussian) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	g.Kernel = make([]float32, GAUSSIAN_KERNEL_SIDE*GAUSSIAN_KERNEL_SIDE)
	total := 0.0
	for x := 0; x < GAUSSIAN_KERNEL_SIDE; x++ {
		for y := 0; y < GAUSSIAN_KERNEL_SIDE; y++ {
			g.Kernel[y*GAUSSIAN_KERNEL_SIDE+x] = float32((1.0 / (2.0 * math.Pi * math.Pow(float64(g.Strength), 2.0))) * math.Exp(-((math.Pow(float64(x-GAUSSIAN_KERNEL_OFFSET), 2.0) + math.Pow(float64(y-GAUSSIAN_KERNEL_OFFSET), 2.0)) / (2.0 * math.Pow(float64(g.Strength), 2.0)))))
			total += float64(g.Kernel[y*GAUSSIAN_KERNEL_SIDE+x])
		}
	}
	g.Kernel_total = 1.0 / float32(total)
	return g
}
func (g Gaussian) NeedToSync() bool {
	return false
}
func (g Gaussian) ChangeAfterSync(cmap *sync.Map) Filter {
	return g
}

type Negatif struct {
}

func (g Negatif) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	return g
}

func (g Negatif) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	return Color{255 - color.R, 255 - color.G, 255 - color.B}
}
func (g Negatif) NeedToSync() bool {
	return false
}
func (g Negatif) ChangeAfterSync(cmap *sync.Map) Filter {
	return g
}

type Neg_Fondu struct {
	Strength float32
	// % de fondu vers le négatif
	// renvoie input pour 0
	// renvoie neg pour 1
}

func (g Neg_Fondu) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	return g
}

func (g Neg_Fondu) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	coeff := g.Strength / 100
	red := float32(255-color.R)*coeff + float32(color.R)*(1-coeff)
	green := float32(255-color.G)*coeff + float32(color.G)*(1-coeff)
	blue := float32(255-color.B)*coeff + float32(color.B)*(1-coeff)
	return Color{uint8(red), uint8(green), uint8(blue)}
}

func (g Neg_Fondu) NeedToSync() bool {
	return false
}
func (g Neg_Fondu) ChangeAfterSync(cmap *sync.Map) Filter {
	return g
}

type Froid struct { //renforce ou diminue les composantes froides, selon si str + ou -
	Strength float32
	// % de bleu ajouté et de rouge/vert retiré
	//renvoie input pour 0
}

func (g Froid) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	return g
}

func (g Froid) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	red := float32(color.R) * (1 - g.Strength/100)
	green := float32(color.G) * (1 - g.Strength/100)
	blue := float32(color.B) * (1 + g.Strength/100)
	if blue > 255 {
		blue = 255
	}
	return Color{uint8(red), uint8(green), uint8(blue)}
}

func (g Froid) NeedToSync() bool {
	return false
}
func (g Froid) ChangeAfterSync(cmap *sync.Map) Filter {
	return g
}

type Chaud struct { //renforce ou diminue les composantes chaudes, selon si str + ou -
	Strength float32
	// % de rouge ajouté et de bleu retiré (et double du % ajouté au vert)
	//renvoie input pour 0
}

func (g Chaud) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	return g
}

func (g Chaud) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	red := float32(color.R) * (1 + g.Strength/100)
	green := float32(color.G) * (1 + g.Strength/200)
	blue := float32(color.B) * (1 - g.Strength/100)
	if red > 255 {
		red = 255
	}
	if green > 255 {
		green = 255
	}
	return Color{uint8(red), uint8(green), uint8(blue)}
}

func (g Chaud) NeedToSync() bool {
	return false
}
func (g Chaud) ChangeAfterSync(cmap *sync.Map) Filter {
	return g
}

type Luminosite struct { //illumine ou assombrit l'image, selon si str resp. > ou < à 0
	Strength float32
	// % de chaque couleur ajouté
	//renvoie image noire pour -100%
	//renvoie input pour 0%
	//fait saturer pour str élevée
}

func (g Luminosite) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	return g
}

func (g Luminosite) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	red := float32(color.R) * (1 + g.Strength/100)
	green := float32(color.G) * (1 + g.Strength/100)
	blue := float32(color.B) * (1 + g.Strength/100)
	if red > 255 {
		red = 255
	}
	if green > 255 {
		green = 255
	}
	if blue > 255 {
		blue = 255
	}
	return Color{uint8(red), uint8(green), uint8(blue)}
}
func (g Luminosite) NeedToSync() bool {
	return false
}
func (g Luminosite) ChangeAfterSync(cmap *sync.Map) Filter {
	return g
}

type Flou_moy struct { //Réduit la définition perçue, mais pas la définition réelle
	Strength float32 // % de flou (0=input à 100=1pixel pour toute l'image)
	pas_x    int     //longueur du gros pixel
	pas_y    int     //hauteur du gros pixel
}

func (g Flou_moy) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	g.pas_x = int(g.Strength / 100 * float32(image.Longueur))
	g.pas_y = int(g.Strength / 100 * float32(image.Hauteur))
	return g
}

func (g Flou_moy) GetPixel(x uint, y uint, image Image) Color {
	X := int(x)
	Y := int(y)
	var sumR, sumG, sumB, count float32 = 0, 0, 0, 0
	for i := X - (X % g.pas_x); i < X-(X%g.pas_x)+g.pas_x; i++ {
		for j := Y - (Y % g.pas_y); j < Y-(Y%g.pas_y)+g.pas_y; j++ {
			color := image.GetAtInfaillible(i, j)
			sumR += float32(color.R)
			sumG += float32(color.G)
			sumB += float32(color.B)
			count += 1
		}
	}
	R := uint8(sumR / count)
	G := uint8(sumG / count)
	B := uint8(sumB / count)
	return Color{R, G, B}
}
func (g Flou_moy) NeedToSync() bool {
	return false
}
func (g Flou_moy) ChangeAfterSync(cmap *sync.Map) Filter {
	return g
}

type Flou_Fondu struct { //Génère un fondu entre input et flou_moy
	Strength float32 // % de flou (0=input à 100=1pixel pour toute l'image)
	Fondu    float32 // % de fondu (0=input à 100=flou_moy)
	pas_x    int     //longueur du gros pixel
	pas_y    int     //hauteur du gros pixel
}

func (g Flou_Fondu) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	g.pas_x = int(g.Strength / 100 * float32(image.Longueur))
	g.pas_y = int(g.Strength / 100 * float32(image.Hauteur))
	return g
}

func (g Flou_Fondu) GetPixel(x uint, y uint, image Image) Color {
	X := int(x)
	Y := int(y)
	var sumR, sumG, sumB, count float32 = 0, 0, 0, 0
	for i := X - (X % g.pas_x); i < X-(X%g.pas_x)+g.pas_x; i++ {
		for j := Y - (Y % g.pas_y); j < Y-(Y%g.pas_y)+g.pas_y; j++ {
			color := image.GetAtInfaillible(i, j)
			sumR += float32(color.R)
			sumG += float32(color.G)
			sumB += float32(color.B)
			count += 1
		}
	}
	color := image.GetAtInfaillible(X, Y)
	R := uint8((sumR/count)*g.Fondu/100 + float32(color.R)*(1-g.Fondu/100))
	G := uint8((sumG/count)*g.Fondu/100 + float32(color.G)*(1-g.Fondu/100))
	B := uint8((sumB/count)*g.Fondu/100 + float32(color.B)*(1-g.Fondu/100))
	return Color{R, G, B}
}

func (g Flou_Fondu) NeedToSync() bool {
	return false
}
func (g Flou_Fondu) ChangeAfterSync(cmap *sync.Map) Filter {
	return g
}

type Jeu_Vie struct {
	// % de fondu vers flou par moyenne (forme +)
	// renvoie input pour 0
	// renvoie flou pour 1
}

func (g Jeu_Vie) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	return g
}

func (g Jeu_Vie) GetPixel(x uint, y uint, image Image) Color {
	X := int(x)
	Y := int(y)
	res := image.GetAt(x, y)
	//couleurs :
	color := make([]Color, 9)
	color[0] = image.GetAtInfaillible(X-1, Y-1) //haut gauche
	color[1] = image.GetAtInfaillible(X, Y-1)   //haut centre
	color[2] = image.GetAtInfaillible(X+1, Y-1) //haut droite
	color[3] = image.GetAtInfaillible(X-1, Y)   //centre gauche
	color[4] = image.GetAtInfaillible(X, Y)     //centre
	color[5] = image.GetAtInfaillible(X+1, Y)   //centre droite
	color[6] = image.GetAtInfaillible(X-1, Y+1) //bas gauche
	color[7] = image.GetAtInfaillible(X, Y+1)   //bas centre
	color[8] = image.GetAtInfaillible(X+1, Y+1) //bas droite
	//vie ou mort
	vie := make([]bool, 9)
	for i := 0; i < 9; i++ {
		if color[i].R == 255 && color[i].G == 255 && color[i].B == 255 {
			vie[i] = true
		} else if color[i].R == 0 && color[i].G == 0 && color[i].B == 0 {
			vie[i] = false
		} else {
			//Erreur du client
			return Color{255, 0, 0}
		}
	}
	//compte voisins
	voisins := 0
	for i := 0; i < 9; i++ {
		if i != 4 && vie[i] {
			voisins += 1
		}
	}
	//application règles
	if vie[4] {
		if voisins != 2 && voisins != 3 {
			res = Color{0, 0, 0}
		}
	} else {
		if voisins == 3 {
			res = Color{255, 255, 255}
		}
	}
	return res
}

func (g Jeu_Vie) NeedToSync() bool {
	return false
}
func (g Jeu_Vie) ChangeAfterSync(cmap *sync.Map) Filter {
	return g
}

type Fourier struct {
	Max_value     float64
	Internal_data []float64
}

func (f Fourier) PrepareImage(image Image, y_min uint, y_max uint, cmap *sync.Map) Filter {
	max := 0.0
	internal_data := make([]float64, image.Longueur*image.Hauteur)
	un_sur_longueur := 1.0 / float64(image.Longueur)
	un_sur_hauteur := 1.0 / float64(image.Hauteur)
	for y := y_min; y < y_max; y++ {
		for x := uint(0); x < image.Longueur; x++ {
			final_r := complex(0, 0)
			for m := 0; m < int(image.Hauteur); m++ {
				for n := 0; n < int(image.Longueur); n++ {
					m_centered := (m + int(image.Hauteur)/2) % int(image.Hauteur)
					y_centered := (y + image.Hauteur/2) % image.Hauteur
					x_centered := ((x + image.Longueur/2) % image.Longueur)
					n_centered := (n + int(image.Longueur)/2) % int(image.Longueur)
					color := image.GetAt(uint(n_centered), uint(m_centered))
					local_complex := cmplx.Exp(complex(0, -2.0*math.Pi*(float64(n_centered*int(x_centered))*un_sur_longueur+float64(m_centered*int(y_centered))*un_sur_hauteur)))
					final_r += local_complex * complex(float64(color.R)*0.00392156862, 0) // On multiplie par 1/255
				}
			}
			real_part_r := math.Log(1.0 + cmplx.Abs(final_r))
			if real_part_r > max {
				max = real_part_r
			}
			internal_data[y*image.Longueur+x] = real_part_r
		}
	}
	f.Internal_data = internal_data
	f.Max_value = 1.0 / max
	cmap.Store(y_min, f.Max_value)
	return f
}

func (f Fourier) GetPixel(x uint, y uint, image Image) Color {
	real_part_r := f.Internal_data[y*image.Longueur+x] * f.Max_value * 255.0
	return Color{uint8(real_part_r), uint8(real_part_r), uint8(real_part_r)}
}

func (g Fourier) NeedToSync() bool {
	return true
}
func (g Fourier) ChangeAfterSync(cmap *sync.Map) Filter {
	cmap.Range(func(key, value interface{}) bool {
		float_value := value.(float64)
		if float_value < g.Max_value {
			g.Max_value = float_value
		}
		return true
	})
	return g
}
