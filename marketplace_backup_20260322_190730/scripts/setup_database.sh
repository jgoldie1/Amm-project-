#!/data/data/com.termux/files/usr/bin/bash
cd ~/marketplace || exit 1
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export FLASK_APP=wsgi.py
flask db init 2>/dev/null || true
flask db migrate -m "initial production foundation" || true
flask db upgrade || true
echo "Database setup complete."
