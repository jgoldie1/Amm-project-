#!/data/data/com.termux/files/usr/bin/bash
set +e

wait_for() {
  local port="$1"
  local tries=20
  local count=0
  while [ $count -lt $tries ]; do
    curl -s "http://127.0.0.1:${port}/health" >/dev/null 2>&1
    if [ $? -eq 0 ]; then
      echo "Port ${port} is ready."
      return 0
    fi
    sleep 1
    count=$((count+1))
  done
  echo "Port ${port} failed to become ready."
  return 1
}

wait_for 4100
wait_for 4200
wait_for 4300
wait_for 4400
wait_for 4500
wait_for 4600
wait_for 4700
wait_for 4800
wait_for 4900
wait_for 5000
wait_for 4000
