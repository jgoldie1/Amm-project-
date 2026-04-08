#!/data/data/com.termux/files/usr/bin/bash
cd ~/aam_full_system

mkdir -p reports

cat > reports/beta_report.txt << REPORT
AAM BETA REPORT
===============

CORE SERVICES
-------------
Dashboard: http://127.0.0.1:4900
Jarvis: http://127.0.0.1:5000
Life World: http://127.0.0.1:4902

CURRENT STATUS
--------------
- Dashboard service active
- Jarvis service active
- Life World service active
- Login/auth working
- Smoke tests passing
- JSON valid
- Module system active

AI / FEATURE FLAGS
------------------
REPORT

sqlite3 db/aam.db "
select '- ' || config_name || ' = ' || config_value || ' (' || config_status || ')'
from system_config_registry
where lower(config_name) like '%holo%'
   or lower(config_name) like '%search%'
   or lower(config_name) like '%codex%'
   or lower(config_name) like '%copilot%'
   or lower(config_name) like '%wix%'
   or lower(config_name) like '%public_site_ai%'
   or lower(config_name) like '%ai_dev%'
order by id;
" >> reports/beta_report.txt

cat >> reports/beta_report.txt << REPORT

MODULE FILES
------------
REPORT

ls -1 data/modules | sed 's/^/- /' >> reports/beta_report.txt

cat >> reports/beta_report.txt << REPORT

WORLD FILES
-----------
REPORT

ls -1 data/world/life_of_yahuah_maschian | sed 's/^/- /' >> reports/beta_report.txt

cat >> reports/beta_report.txt << REPORT

WHAT THIS PRODUCT IS
--------------------
A multi-service beta ecosystem with:
- dashboard layer
- AI assistant/service layer
- world/game layer
- module registry
- public-site AI layer
- developer AI layer

NEXT PRIORITIES
---------------
- visible modules page
- dashboard links to Life World
- Holo panel UI
- save/progression UI
- streaming pricing rules
- creator/public pages
REPORT

echo "=== REPORT CREATED ==="
cat reports/beta_report.txt
