package main

import (
	"net"
)

type ClientData struct {
	connection         net.TCPConn
	client_id          uint
	last_request_id    uint
	requests_in_flight []ClientRequest
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
	final_image Image
	id          uint
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
