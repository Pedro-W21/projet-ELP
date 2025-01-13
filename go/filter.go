package main

import (
	"math"
)

type Filter interface {
	GetPixel(x uint, y uint, image Image) Color
	PrepareImage(image Image, y_min uint, y_max uint)
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
			total_R += float32(col_calc.R) * g.Kernel[y_t*GAUSSIAN_KERNEL_OFFSET+x_t]
			total_G += float32(col_calc.G) * g.Kernel[y_t*GAUSSIAN_KERNEL_OFFSET+x_t]
			total_B += float32(col_calc.B) * g.Kernel[y_t*GAUSSIAN_KERNEL_OFFSET+x_t]
		}
	}
	return Color{uint8(total_R * g.Kernel_total), uint8(total_G * g.Kernel_total), uint8(total_B * g.Kernel_total)}
}

func (g Gaussian) PrepareImage(image Image, y_min uint, y_max uint) {
	g.Kernel = make([]float32, GAUSSIAN_KERNEL_SIDE*GAUSSIAN_KERNEL_SIDE)
	total := 0.0
	for x := 0; x < GAUSSIAN_KERNEL_SIDE; x++ {
		for y := 0; y < GAUSSIAN_KERNEL_SIDE; y++ {
			g.Kernel[y*GAUSSIAN_KERNEL_SIDE+x] = float32((1.0 / (2.0 * math.Pi * math.Pow(float64(g.Strength), 2.0))) * math.Exp(-((math.Pow(float64(x-GAUSSIAN_KERNEL_OFFSET), 2.0) + math.Pow(float64(y-GAUSSIAN_KERNEL_OFFSET), 2.0)) / (2.0 * math.Pow(float64(g.Strength), 2.0)))))
			total += float64(g.Kernel[y*GAUSSIAN_KERNEL_SIDE+x])
		}
	}
	g.Kernel_total = 1.0 / float32(total)
}

type Negatif struct {
	strength float32
}

func (g Negatif) GetPixel(x uint, y uint, image Image) Color {
	color := image.GetAt(x, y)
	return Color{255 - color.R, 255 - color.G, 255 - color.B}
}

func (g Negatif) PrepareImage(image Image, y_min uint, y_max uint) {

}
