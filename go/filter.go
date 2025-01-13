package main

type Filter interface {
	GetPixel(x uint, y uint, image Image) Color
}

type Gaussian struct {
	Strength float32
}

func (g Gaussian) GetPixel(x uint, y uint, image Image) Color {
<<<<<<< HEAD
	return Color{0, 0, 0}
=======
	last_color := image.GetAt(x, y)
	return Color{255 - last_color.R, 255 - last_color.G, 255 - last_color.B}
>>>>>>> fd73357d6428f90ca3e541a90006159225bf54c2
}

type Negatif struct {
	strength float32
}

func (g Negatif) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	return Color{255 - color.r, 255 - color.g, 255 - color.b}
}
