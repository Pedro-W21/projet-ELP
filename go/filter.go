package main

type Filter interface {
	GetPixel(x uint, y uint, image Image) Color
	PrepareImage(image Image, y_min uint, y_max uint)
}

type Gaussian struct {
	Strength float32
}

func (g Gaussian) GetPixel(x uint, y uint, image Image) Color {
	return Color{0, 0, 0}
}

func (g Gaussian) PrepareImage(image Image, y_min uint, y_max uint) {

}

type Negatif struct {
	strength float32
}

func (g Negatif) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	return Color{255 - color.r, 255 - color.g, 255 - color.b}
}

func (g Negatif) PrepareImage(image Image, y_min uint, y_max uint) {
	
}

type Froid 