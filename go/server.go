package main

import (
	"net"
)

type TCPServer struct {
	listener net.TCPListener
}
