#!/usr/bin/env bash
set -e
cd "$HOME/aam_full_system"
node services/oracle/indexer.js
node services/oracle/search.js lion
node services/oracle/search.js bethlehem
node services/oracle/search.js gift
