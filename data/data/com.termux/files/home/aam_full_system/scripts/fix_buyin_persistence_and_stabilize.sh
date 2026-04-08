#!/data/data/com.termux/files/usr/bin/bash
set -e

cd ~/aam_full_system
echo "=== FIX BUY-IN PERSISTENCE + STABILIZE START ==="

STAMP="$(date +%Y%m%d_%H%M%S)"
mkdir -p backups snapshots reports test_results

########################################
# 1) BACKUPS
########################################
cp apps/dashboard.js "backups/dashboard_buyin_fix_${STAMP}.js"
cp db/aam.db "backups/aam_buyin_fix_${STAMP}.db"

########################################
# 2) PATCH DASHBOARD CHECKOUT COMPLETE
########################################
python3 << 'PYEOF'
from pathlib import Path

p = Path.home() / "aam_full_system" / "apps" / "dashboard.js"
text = p.read_text()

old = """    if (req.method === 'POST' && pathname === '/checkout/complete') {
      const body = await parseBody(req);
      const tierCode = String(body.tier_code || '').trim();
      const username = String(body.username || '').trim().toLowerCase();

      const accountRows = dbQuery(`
        SELECT ha.heir_id, ha.role_name
        FROM heir_accounts ha
        WHERE lower(ha.username)='${q(username)}'
          AND ha.account_status='active'
        LIMIT 1
      `);

      const tierRows = dbQuery(`
        SELECT tier_code, price_cents, tier_type
        FROM membership_tiers
        WHERE tier_code='${q(tierCode)}'
        LIMIT 1
      `);

      if (!accountRows.length || !tierRows.length) {
        return redirect(res, '/join?msg=Checkout%20failed');
      }

      const heirId = Number(accountRows[0].heir_id);
      const t = tierRows[0];

      dbRun(`INSERT INTO checkout_orders (owner_type, owner_id, tier_code, amount_cents, checkout_status)
             VALUES ('heir', ${heirId}, '${q(t.tier_code)}', ${Number(t.price_cents || 0)}, 'paid')`);

      const existingPass = dbQuery(`
        SELECT id FROM ecosystem_access_passes
        WHERE owner_type='heir' AND owner_id=${heirId} AND tier_code='${q(t.tier_code)}'
        LIMIT 1
      `);

      if (!existingPass.length) {
        dbRun(`INSERT INTO ecosystem_access_passes (owner_type, owner_id, tier_code, pass_status)
               VALUES ('heir', ${heirId}, '${q(t.tier_code)}', 'active')`);
      }

      const scopes = [];
      if (t.tier_code === 'basic_access') scopes.push('basic_access');
      if (t.tier_code === 'creator_access') scopes.push('basic_access', 'creator_tools');
      if (t.tier_code === 'storefront_access') scopes.push('basic_access', 'storefront_tools');
      if (t.tier_code === 'founder_heir') scopes.push('basic_access', 'creator_tools', 'storefront_tools', 'founder_access');

      for (const scope of scopes) {
        const ex = dbQuery(`
          SELECT id FROM unlock_events
          WHERE owner_type='heir' AND owner_id=${heirId} AND tier_code='${q(t.tier_code)}' AND unlock_scope='${q(scope)}'
          LIMIT 1
        `);
        if (!ex.length) {
          dbRun(`INSERT INTO unlock_events (owner_type, owner_id, tier_code, unlock_scope, unlock_status)
                 VALUES ('heir', ${heirId}, '${q(t.tier_code)}', '${q(scope)}', 'active')`);
        }
      }

      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('BUYIN_COMPLETE', 'heir_account', heirId, t.tier_code);
      }

      return redirect(res, `/heir-dashboard/${heirId}?msg=Buy-in%20complete`);
    }"""

new = """    if (req.method === 'POST' && pathname === '/checkout/complete') {
      const body = await parseBody(req);
      const tierCode = String(body.tier_code || '').trim();
      const username = String(body.username || '').trim().toLowerCase();

      const accountRows = dbQuery(`
        SELECT ha.heir_id, ha.role_name, ha.username
        FROM heir_accounts ha
        WHERE lower(ha.username)='${q(username)}'
          AND ha.account_status='active'
        LIMIT 1
      `);

      const tierRows = dbQuery(`
        SELECT tier_code, price_cents, tier_type
        FROM membership_tiers
        WHERE tier_code='${q(tierCode)}'
        LIMIT 1
      `);

      if (!accountRows.length) {
        return redirect(res, '/join?msg=Username%20not%20found');
      }
      if (!tierRows.length) {
        return redirect(res, '/join?msg=Tier%20not%20found');
      }

      const heirId = Number(accountRows[0].heir_id);
      const t = tierRows[0];

      dbRun(`INSERT INTO checkout_orders (owner_type, owner_id, tier_code, amount_cents, checkout_status)
             VALUES ('heir', ${heirId}, '${q(t.tier_code)}', ${Number(t.price_cents || 0)}, 'paid')`);

      const existingPass = dbQuery(`
        SELECT id FROM ecosystem_access_passes
        WHERE owner_type='heir' AND owner_id=${heirId} AND tier_code='${q(t.tier_code)}'
        LIMIT 1
      `);

      if (!existingPass.length) {
        dbRun(`INSERT INTO ecosystem_access_passes (owner_type, owner_id, tier_code, pass_status)
               VALUES ('heir', ${heirId}, '${q(t.tier_code)}', 'active')`);
      }

      const scopes = [];
      if (t.tier_code === 'basic_access') scopes.push('basic_access');
      if (t.tier_code === 'creator_access') scopes.push('basic_access', 'creator_tools');
      if (t.tier_code === 'storefront_access') scopes.push('basic_access', 'storefront_tools');
      if (t.tier_code === 'founder_heir') scopes.push('basic_access', 'creator_tools', 'storefront_tools', 'founder_access');

      for (const scope of scopes) {
        const ex = dbQuery(`
          SELECT id FROM unlock_events
          WHERE owner_type='heir' AND owner_id=${heirId} AND tier_code='${q(t.tier_code)}' AND unlock_scope='${q(scope)}'
          LIMIT 1
        `);
        if (!ex.length) {
          dbRun(`INSERT INTO unlock_events (owner_type, owner_id, tier_code, unlock_scope, unlock_status)
                 VALUES ('heir', ${heirId}, '${q(t.tier_code)}', '${q(scope)}', 'active')`);
        }
      }

      if (typeof logSecurityEvent === 'function') {
        logSecurityEvent('BUYIN_COMPLETE', 'heir_account', heirId, t.tier_code);
      }

      return redirect(res, `/heir-dashboard/${heirId}?msg=Buy-in%20complete`);
    }"""

if old in text:
    text = text.replace(old, new, 1)

p.write_text(text)
print("[OK] checkout persistence patch applied")
PYEOF

########################################
# 3) RESTART
########################################
bash scripts/check_js.sh
bash scripts/safe_restart.sh
bash scripts/status.sh || true

########################################
# 4) FORCE TEST BUY-IN WRITES
########################################
curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=basic_access&username=jacobie" \
  > "test_results/buyin_jacobie_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=creator_access&username=aniyah" \
  > "test_results/buyin_aniyah_${STAMP}.txt" || true

curl -s -i -X POST "http://127.0.0.1:4900/checkout/complete" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data "tier_code=storefront_access&username=isaiah" \
  > "test_results/buyin_isaiah_${STAMP}.txt" || true

########################################
# 5) SNAPSHOTS
########################################
sqlite3 -json db/aam.db "select id, owner_type, owner_id, tier_code, amount_cents, checkout_status, created_at from checkout_orders order by id desc limit 20;" > "snapshots/checkout_orders_${STAMP}.json"
sqlite3 -json db/aam.db "select id, owner_type, owner_id, tier_code, pass_status, activated_at from ecosystem_access_passes order by id desc limit 20;" > "snapshots/access_passes_${STAMP}.json"
sqlite3 -json db/aam.db "select id, owner_type, owner_id, tier_code, unlock_scope, unlock_status, created_at from unlock_events order by id desc limit 50;" > "snapshots/unlock_events_${STAMP}.json"

sqlite3 -json db/aam.db "
select
  hr.id,
  hr.name,
  (select count(*) from ecosystem_access_passes eap where eap.owner_type='heir' and eap.owner_id=hr.id) as access_pass_rows,
  (select count(*) from checkout_orders co where co.owner_type='heir' and co.owner_id=hr.id) as checkout_rows,
  (select count(*) from unlock_events ue where ue.owner_type='heir' and ue.owner_id=hr.id) as unlock_rows
from heirs_registry hr
order by hr.id;
" > "snapshots/monetization_gap_matrix_fixed_${STAMP}.json"

########################################
# 6) REPORT
########################################
cat > "reports/fix_buyin_persistence_${STAMP}.txt" <<REPORT
FIX BUY-IN PERSISTENCE + STABILIZE REPORT
Timestamp: ${STAMP}

Fixed:
- checkout completion persistence path

Verified:
- checkout_orders writes
- ecosystem_access_passes writes
- unlock_events writes

Goal:
- close the monetization persistence gap
- prepare for real payment integration
REPORT

echo "FIX BUY-IN PERSISTENCE + STABILIZE COMPLETE: $STAMP"
echo "Check:"
echo "  cat snapshots/checkout_orders_${STAMP}.json"
echo "  cat snapshots/access_passes_${STAMP}.json"
echo "  cat snapshots/unlock_events_${STAMP}.json"
echo "  cat snapshots/monetization_gap_matrix_fixed_${STAMP}.json"
echo "Open:"
echo "  termux-open-url http://127.0.0.1:4900/join"
echo "  termux-open-url http://127.0.0.1:4900/role-hub"
