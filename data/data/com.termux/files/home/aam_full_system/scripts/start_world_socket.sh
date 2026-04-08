#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system
nohup node apps/world_socket.js > logs/world_socket.log 2>&1 &
echo $! > pids/world_socket.pid
echo "World socket started on 5090"
