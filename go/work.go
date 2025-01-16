package main

import "sync"

type Input struct {
	image  Image
	filter Filter
	y_min  uint
	y_max  uint
	fin    bool
}

type Output struct {
	image Image
	y_min uint
	y_max uint
}

func Work(input chan Input, output chan Output, cmap *sync.Map, sync_group *sync.WaitGroup) {
	for {
		pb := <-input
		if pb.fin {
			break
		}
		work := MakeImage(pb.image.Longueur, pb.y_max-pb.y_min, Color{0, 0, 0})
		var x, y uint
		pb.filter = pb.filter.PrepareImage(pb.image, pb.y_min, pb.y_max, cmap)
		if pb.filter.NeedToSync() {
			sync_group.Done()
			sync_group.Wait()
			pb.filter = pb.filter.ChangeAfterSync(cmap)
		}

		for y = pb.y_min; y < pb.y_max; y++ {
			for x = 0; x < pb.image.Longueur; x++ {
				work.Data[(y-pb.y_min)*work.Longueur+x] = pb.filter.GetPixel(x, y, pb.image)
			}
		}
		output <- Output{work, pb.y_min, pb.y_max}
	}
}
