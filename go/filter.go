package main

type Filter interface {
	GetPixel(x uint, y uint, image Image) Color
}

type Gaussian struct {
	Strength float32
}

func (g Gaussian) GetPixel(x uint, y uint, image Image) Color {
	last_color := image.GetAt(x, y)
	return Color{255 - last_color.R, 255 - last_color.G, 255 - last_color.B}
}
