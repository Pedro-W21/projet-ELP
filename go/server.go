package main

import (
	"encoding/gob"
	"fmt"
	"net"
	"runtime"
)

type ClientData struct {
	connection         net.Conn
	decoder            gob.Decoder
	last_request_id    uint
	requests_in_flight map[uint]ClientRequestResponse
}

type ClientRequest struct {
	request_id  uint
	image       Image
	filter_data Filter
}

type TCPServer struct {
	listener       net.Listener
	last_client_id uint
}

type ClientRequestResponse struct {
	final_image         Image
	input               chan Input
	waiting_for_threads uint
}

type TCPServerSenderThread struct {
	client_data           ClientData
	finished_work_channel chan ClientRequestResponse
}

func MakeTCPServer(ip_and_port string) (TCPServer, error) {
	listener, err := net.Listen("tcp", ip_and_port)
	if err != nil {
		return TCPServer{listener, 0}, nil
	}
	return TCPServer{listener, 0}, err
}

func HandleClient(connection net.Conn) {
	client := ClientData{connection, *gob.NewDecoder(connection), 0, make(map[uint]ClientRequestResponse)}
	defer client.connection.Close()
	val := &ClientRequest{}
	for {
		result := client.decoder.Decode(val)
		if result != nil {
			input := make(chan Input)
			output := make(chan Output)
			for i := 0; i < runtime.NumCPU(); i++ {
				go work(input, output)
			}
			for i := 0; i < runtime.NumCPU(); i++ {

			}
			final := ClientRequestResponse{final_image: MakeImage(val.image.longueur, val.image.hauteur, Color{0, 0, 0})}
			for i := 0; i < runtime.NumCPU(); i++ {
				partiel := <-output
				partiel.
					input <- Input{}
			}
		}
	}
}

func InitResponseFromRequest(request ClientRequest) ClientRequestResponse {
	return ClientRequestResponse{MakeImage(request.image.longueur, request.image.hauteur, Color{0, 0, 0}), uint(runtime.NumCPU())}
}

func (server TCPServer) listening_loop() {
	defer server.listener.Close()
	for {
		// Accept incoming connections
		conn, err := server.listener.Accept()
		if err != nil {
			fmt.Println("Error:", err)
			continue
		}

		// Handle client connection in a goroutine
		go HandleClient(conn)
	}
}
