#!/bin/bash

###############################################################################
# AMM OMNIVERSE - Shopify Store Loader
# All American Marketplace LLC | tryamm.online | July 2026
#
# Loads the complete AMM AR/VR/XR product catalog into your Shopify store.
# 20 products across 5 collections.
#
# PREREQUISITES:
# 1. Shopify store (any plan)
# 2. Custom app with Admin API access token
#    Settings > Apps and sales channels > Develop apps > Create app
#    Scopes needed: write_products, write_metafields, read_products,
#                   write_collections, write_inventory
# 3. curl installed (pre-installed on Mac/Linux/Chromebook)
#
# USAGE:
#   chmod +x AMM_SHOPIFY_STORE_LOADER.sh
#   ./AMM_SHOPIFY_STORE_LOADER.sh
###############################################################################

set -e

# =============================================================================
# CONFIGURATION — VICTOR: FILL THESE IN
# =============================================================================

SHOPIFY_STORE="tryamm.myshopify.com"
SHOPIFY_ACCESS_TOKEN="shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
API_VERSION="2026-01"
API_URL="https://${SHOPIFY_STORE}/admin/api/${API_VERSION}"

# =============================================================================
# COLORS
# =============================================================================
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; PURPLE='\033[0;35m'; NC='\033[0m'

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[!]${NC} $1"; }
log_error()   { echo -e "${RED}[✗]${NC} $1"; }
log_section() { echo ""; echo -e "${CYAN}════════════════════════════════════════${NC}"; echo -e "${CYAN}  $1${NC}"; echo -e "${CYAN}════════════════════════════════════════${NC}"; echo ""; }

# =============================================================================
# API HELPER
# =============================================================================

shopify_api() {
    local method=$1 endpoint=$2 data=$3
    local url="${API_URL}${endpoint}"
    if [ -z "$data" ]; then
        curl -s -X "${method}" \
            -H "Content-Type: application/json" \
            -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
            "${url}"
    else
        curl -s -X "${method}" \
            -H "Content-Type: application/json" \
            -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
            -d "${data}" \
            "${url}"
    fi
}

create_product() {
    local response
    response=$(shopify_api "POST" "/products.json" "$1")
    if echo "$response" | grep -q '"product":'; then
        local pid
        pid=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        log_success "Created — ID: $pid"
        echo "$pid"
    else
        log_error "Failed: $response"
        echo ""
    fi
}

add_metafield() {
    local product_id=$1 ns=$2 key=$3 value=$4 type=$5
    local json="{\"metafield\":{\"namespace\":\"${ns}\",\"key\":\"${key}\",\"value\":\"${value}\",\"type\":\"${type}\"}}"
    shopify_api "POST" "/products/${product_id}/metafields.json" "$json" > /dev/null
}

create_collection() {
    local title=$1 desc=$2
    local json="{\"collection\":{\"title\":\"${title}\",\"body_html\":\"${desc}\",\"sort_order\":\"best-selling\"}}"
    local response
    response=$(shopify_api "POST" "/custom_collections.json" "$json")
    if echo "$response" | grep -q '"custom_collection":'; then
        local cid
        cid=$(echo "$response" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
        log_success "Collection '${title}' created — ID: $cid"
        echo "$cid"
    else
        log_warning "Collection may already exist or failed"
        echo ""
    fi
}

check_prerequisites() {
    log_section "Prerequisites Check"
    if ! command -v curl &> /dev/null; then
        log_error "curl not found. Install curl first."
        exit 1
    fi
    log_success "curl found"
    if [ "$SHOPIFY_STORE" = "tryamm.myshopify.com" ] && [ "$SHOPIFY_ACCESS_TOKEN" = "shpat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" ]; then
        log_error "Fill in SHOPIFY_STORE and SHOPIFY_ACCESS_TOKEN at top of script"
        exit 1
    fi
    log_success "Configuration looks set"
    # Test API connection
    local test
    test=$(shopify_api "GET" "/shop.json" "")
    if echo "$test" | grep -q '"shop":'; then
        log_success "Shopify API connection confirmed"
    else
        log_error "API connection failed. Check your token and store URL."
        exit 1
    fi
}

# =============================================================================
# ══ PHYSICAL PRODUCTS ══
# =============================================================================

# PRODUCT 1 — AMM AR Blaster (Physical Gun)
create_amm_ar_blaster() {
    log_section "Product 1: AMM AR Laser Tag Blaster (Physical)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM AR Laser Tag Blaster - Mobile Gaming Gun",
    "body_html": "<h2>Point. Aim. Eliminate.</h2><p>The AMM AR Blaster turns your phone into a precision laser tag weapon inside the AMM Omniverse AR game. Open your phone camera, enemies appear IN your real world — and this grip makes it feel exactly like a real gun in your hand.</p><ul><li><strong>Universal phone mount:</strong> Fits all phones up to 6.9 inches (iPhone 15 Pro Max, Galaxy S24 Ultra)</li><li><strong>Ergonomic trigger:</strong> Maps to your phone screen tap — no Bluetooth needed for Standard</li><li><strong>Gyroscope aiming:</strong> Tilt your whole body to aim. The gun amplifies real movement.</li><li><strong>Lightweight:</strong> 185g — play for hours without arm fatigue</li><li><strong>Works with:</strong> AMM Omniverse Laser Tag AR, Creature Capture AR, Card Battle AR</li></ul><p><strong>Includes:</strong> AMM AR Blaster grip + 1,000 AMM Tokens ($9.99 value) + Exclusive Ghost Soldier skin</p><p><strong>Pro Edition adds:</strong> Bluetooth trigger for no-lag precision, rumble haptics on every shot, and ESP32 chip for wireless score sync to your AMM profile.</p>",
    "vendor": "All American Marketplace",
    "product_type": "AR Gaming Accessory",
    "tags": "AR, augmented reality, laser tag, mobile gaming, VR accessory, AMM, faith gaming, physical",
    "status": "active",
    "variants": [
      {
        "title": "Standard Edition",
        "price": "24.99",
        "compare_at_price": "34.99",
        "sku": "AMM-BLASTER-STD",
        "inventory_quantity": 500,
        "inventory_management": "shopify",
        "weight": 0.185,
        "weight_unit": "kg",
        "requires_shipping": true,
        "taxable": true
      },
      {
        "title": "Pro Edition - Bluetooth + Haptics",
        "price": "49.99",
        "compare_at_price": "69.99",
        "sku": "AMM-BLASTER-PRO",
        "inventory_quantity": 250,
        "inventory_management": "shopify",
        "weight": 0.22,
        "weight_unit": "kg",
        "requires_shipping": true,
        "taxable": true
      },
      {
        "title": "Family Pack - 4 Blasters",
        "price": "79.99",
        "compare_at_price": "99.99",
        "sku": "AMM-BLASTER-FAM4",
        "inventory_quantity": 100,
        "inventory_management": "shopify",
        "weight": 0.8,
        "weight_unit": "kg",
        "requires_shipping": true,
        "taxable": true
      }
    ],
    "options": [
      {
        "name": "Edition",
        "values": ["Standard Edition", "Pro Edition - Bluetooth + Haptics", "Family Pack - 4 Blasters"]
      }
    ],
    "metafields": [
      {"namespace":"custom","key":"compatible_games","value":"Laser Tag AR, Creature Capture AR, Card Battle AR","type":"single_line_text_field"},
      {"namespace":"custom","key":"compatible_devices","value":"iOS 14+, Android 10+","type":"single_line_text_field"},
      {"namespace":"custom","key":"ar_type","value":"Mobile AR (Camera-based)","type":"single_line_text_field"},
      {"namespace":"custom","key":"multiplayer","value":"2-8 players","type":"single_line_text_field"},
      {"namespace":"custom","key":"includes_tokens","value":"1000","type":"number_integer"},
      {"namespace":"custom","key":"platform","value":"AMM Omniverse — tryamm.online","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid
    pid=$(create_product "$json")
    if [ -n "$pid" ]; then
        add_metafield "$pid" "ar" "experience" "Laser Tag AR" "single_line_text_field"
        add_metafield "$pid" "ar" "room_required" "3x3 meters minimum" "single_line_text_field"
        add_metafield "$pid" "ar" "players" "2-8" "single_line_text_field"
        add_metafield "$pid" "shipping" "origin" "Cary, IL, USA" "single_line_text_field"
        add_metafield "$pid" "shipping" "estimated_days" "5-7" "single_line_text_field"
    fi
    echo "$pid"
}

# PRODUCT 2 — AMM VR Boxing Gloves (Physical)
create_amm_vr_gloves() {
    log_section "Product 2: AMM VR Boxing Gloves (Physical)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM VR Boxing Gloves - Holographic Arena Accessory",
    "body_html": "<h2>Feel Every Punch. Win Every Round.</h2><p>Designed for the AMM Holographic Boxing Arena — the browser VR game that works on Quest, Vision Pro, and any phone. These gloves add physical resistance and controller mounts so your real punches translate to in-game knockout power.</p><ul><li><strong>Controller pockets:</strong> Secure mounts for Quest 3, Quest Pro, PS VR2, and phone holders</li><li><strong>Padding:</strong> 6oz foam padding for real punch training between VR rounds</li><li><strong>Wrist strap:</strong> Prevents controller drops during fast combinations</li><li><strong>Works without a headset:</strong> Phone holder mode for mobile AR boxing</li></ul><p><strong>Included:</strong> 1 pair gloves + 500 AMM Tokens + Exclusive 'Champion' fighter skin</p>",
    "vendor": "All American Marketplace",
    "product_type": "VR Gaming Accessory",
    "tags": "VR, virtual reality, boxing, Quest, Vision Pro, haptics, AMM, holographic arena, physical",
    "status": "active",
    "variants": [
      {"title":"Small / Medium","price":"34.99","compare_at_price":"49.99","sku":"AMM-GLOVES-SM","inventory_quantity":200,"inventory_management":"shopify","weight":0.35,"weight_unit":"kg","requires_shipping":true},
      {"title":"Large / XL","price":"34.99","compare_at_price":"49.99","sku":"AMM-GLOVES-LXL","inventory_quantity":200,"inventory_management":"shopify","weight":0.38,"weight_unit":"kg","requires_shipping":true},
      {"title":"Kids (ages 8-14)","price":"24.99","compare_at_price":"34.99","sku":"AMM-GLOVES-KIDS","inventory_quantity":150,"inventory_management":"shopify","weight":0.25,"weight_unit":"kg","requires_shipping":true}
    ],
    "options": [{"name":"Size","values":["Small / Medium","Large / XL","Kids (ages 8-14)"]}],
    "metafields": [
      {"namespace":"custom","key":"compatible_headsets","value":"Meta Quest 2/3/Pro, PlayStation VR2, Apple Vision Pro","type":"single_line_text_field"},
      {"namespace":"custom","key":"compatible_game","value":"AMM Holographic Boxing Arena","type":"single_line_text_field"},
      {"namespace":"custom","key":"vr_type","value":"Browser WebXR — no app download required","type":"single_line_text_field"},
      {"namespace":"custom","key":"includes_tokens","value":"500","type":"number_integer"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    [ -n "$pid" ] && add_metafield "$pid" "vr" "headset_required" "false — works phone-only" "single_line_text_field"
    echo "$pid"
}

# PRODUCT 3 — AMM MR Glasses Mount (Physical)
create_amm_mr_glasses() {
    log_section "Product 3: AMM Mixed Reality Glasses Mount (Physical)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM MR Phone-to-Glasses Mount - Mixed Reality Viewer",
    "body_html": "<h2>No $3,000 Headset Required.</h2><p>The AMM Mixed Reality Mount converts any smartphone into a passthrough mixed reality viewer for under $30. See your real room through the phone camera while AMM games overlay game elements directly into your space — no Apple Vision Pro, no Meta Quest required.</p><ul><li><strong>Passthrough MR:</strong> Camera sees your real room; games overlay on top</li><li><strong>Adjustable IPD:</strong> Fits all face shapes</li><li><strong>Phone compatibility:</strong> All phones up to 6.9 inches</li><li><strong>Works with:</strong> All 3 AMM AR games — Laser Tag, Creature Capture, Card Battle</li><li><strong>Head tracking:</strong> Built-in gyro uses your phone's sensors for look tracking</li></ul><p><strong>Includes:</strong> MR Mount + 750 AMM Tokens + Exclusive 'Pioneer' badge</p>",
    "vendor": "All American Marketplace",
    "product_type": "Mixed Reality Accessory",
    "tags": "MR, mixed reality, AR glasses, passthrough, mobile VR, Google Cardboard alternative, AMM, faith gaming",
    "status": "active",
    "variants": [
      {"title":"Standard MR Mount","price":"27.99","compare_at_price":"39.99","sku":"AMM-MR-MOUNT","inventory_quantity":300,"inventory_management":"shopify","weight":0.15,"weight_unit":"kg","requires_shipping":true},
      {"title":"Premium MR Mount + Controller Strap","price":"44.99","compare_at_price":"59.99","sku":"AMM-MR-PREMIUM","inventory_quantity":150,"inventory_management":"shopify","weight":0.22,"weight_unit":"kg","requires_shipping":true}
    ],
    "options":[{"name":"Type","values":["Standard MR Mount","Premium MR Mount + Controller Strap"]}],
    "metafields":[
      {"namespace":"custom","key":"technology","value":"Phone passthrough camera + WebXR overlay","type":"single_line_text_field"},
      {"namespace":"custom","key":"headset_required","value":"false — uses your phone","type":"single_line_text_field"},
      {"namespace":"custom","key":"compatible_games","value":"All 3 AMM AR games","type":"single_line_text_field"},
      {"namespace":"custom","key":"includes_tokens","value":"750","type":"number_integer"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 4 — AMM Creator Ring Light + Phone Rig (Physical)
create_amm_creator_rig() {
    log_section "Product 4: AMM Creator Live Stream Rig (Physical)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Creator Ring Light + Live Stream Rig",
    "body_html": "<h2>Go Live Looking Like a Pro.</h2><p>Built specifically for AMM Omniverse live streamers. Phone mount, ring light, microphone bracket, and green screen clip — everything you need for your AMM live stream setup for under $40.</p><ul><li><strong>10-inch ring light:</strong> 3 color temperatures, dimmable</li><li><strong>Adjustable phone mount:</strong> Landscape or portrait, any phone</li><li><strong>Mic bracket:</strong> Compatible with standard 3.5mm shotgun mics</li><li><strong>USB-C powered:</strong> No batteries needed</li><li><strong>Works with:</strong> AMM Live Hub — beauty filters, tap gifts, real-time streaming</li></ul><p><strong>Includes:</strong> Rig + 1 Month AMM Creator subscription ($9.99 value) + 500 AMM Tokens</p>",
    "vendor": "All American Marketplace",
    "product_type": "Creator Accessory",
    "tags": "live streaming, ring light, creator, AMM, streaming rig, phone mount, faith creator, Bigo Live alternative",
    "status": "active",
    "variants": [
      {"title":"Desktop Stand","price":"38.99","compare_at_price":"54.99","sku":"AMM-RIG-DESK","inventory_quantity":200,"inventory_management":"shopify","weight":0.5,"weight_unit":"kg","requires_shipping":true},
      {"title":"Tripod Mount","price":"44.99","compare_at_price":"62.99","sku":"AMM-RIG-TRIPOD","inventory_quantity":150,"inventory_management":"shopify","weight":0.65,"weight_unit":"kg","requires_shipping":true}
    ],
    "options":[{"name":"Mount Type","values":["Desktop Stand","Tripod Mount"]}],
    "metafields":[
      {"namespace":"custom","key":"compatible_platform","value":"AMM Omniverse Live Hub","type":"single_line_text_field"},
      {"namespace":"custom","key":"includes_subscription_months","value":"1","type":"number_integer"},
      {"namespace":"custom","key":"includes_tokens","value":"500","type":"number_integer"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# =============================================================================
# ══ DIGITAL PRODUCTS ══
# =============================================================================

# PRODUCT 5 — AMM Token Packs
create_amm_tokens() {
    log_section "Product 5: AMM Token Packs (Digital Currency)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Omniverse Tokens - Platform Currency",
    "body_html": "<h2>The Currency That Runs the Omniverse.</h2><p>AMM Tokens power everything inside AMM Omniverse. Send gifts on livestreams, unlock Drama Box episodes, buy creator boosts, tip your favorite artist, enter Card Battle tournaments, and more.</p><ul><li>Send 150, 500, 777, 1000, or 1500-token gifts on any live stream</li><li>Unlock Drama Box episodes (50-300 tokens per episode)</li><li>Boost your creator profile (+tokens = more discovery)</li><li>Enter Card Battle Arena tournaments</li><li>Purchase exclusive creature captures and card packs</li></ul><p>Tokens never expire. Creators receive 70% of every token gift.</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Currency",
    "tags": "tokens, digital currency, AMM, live stream gifts, tip creator, faith platform",
    "status": "active",
    "variants": [
      {"title":"500 Tokens","price":"4.99","sku":"AMM-TOKENS-500","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"1200 Tokens (Best Seller)","price":"9.99","sku":"AMM-TOKENS-1200","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"2750 Tokens (Best Value)","price":"19.99","sku":"AMM-TOKENS-2750","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"6000 Tokens (Power Pack)","price":"39.99","sku":"AMM-TOKENS-6000","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"15000 Tokens (Mogul Pack)","price":"99.99","sku":"AMM-TOKENS-15000","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Token Pack","values":["500 Tokens","1200 Tokens (Best Seller)","2750 Tokens (Best Value)","6000 Tokens (Power Pack)","15000 Tokens (Mogul Pack)"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"delivery","value":"Instant — added to your AMM account","type":"single_line_text_field"},
      {"namespace":"custom","key":"expiry","value":"Never expire","type":"single_line_text_field"},
      {"namespace":"custom","key":"creator_split","value":"70% goes to creator on gifts","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    [ -n "$pid" ] && add_metafield "$pid" "digital" "auto_credit" "true" "boolean"
    echo "$pid"
}

# PRODUCT 6 — AMM Creator Subscription
create_amm_subscription() {
    log_section "Product 6: AMM Creator Subscription"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Creator Subscription — Monthly or Annual",
    "body_html": "<h2>Your Creator Career Starts Here.</h2><p>AMM Creator gives you everything you need to build a faith-forward creator business: record music, go live, distribute to Spotify and Apple Music, publish books, run your label, and keep 90% of everything you earn.</p><h3>Creator Plan ($9.99/mo) includes:</h3><ul><li>62-track recording studio (DAW)</li><li>Music distribution to 40+ platforms (Spotify, Apple, Tidal, AMM)</li><li>Auto-generated ISRC and UPC codes</li><li>Podcast studio with monetization</li><li>Live streaming with gift economy</li><li>1000 AMM Tokens per month</li><li>Vocal Coach with AI feedback</li><li>Access to all 15+ games</li></ul><h3>Creator Pro ($24.99/mo) adds:</h3><ul><li>AMM Record Label deal (90% artist split)</li><li>KDP Book Publisher with AI writing assistant</li><li>Drama Box + AI Script Writer</li><li>Priority support</li><li>2500 Tokens per month</li><li>Revenue analytics dashboard</li></ul>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Subscription",
    "tags": "subscription, creator, music distribution, live stream, AMM, faith creator, gospel, record label",
    "status": "active",
    "variants": [
      {"title":"Creator Monthly","price":"9.99","sku":"AMM-SUB-CREATOR-MO","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Creator Annual (Save 17%)","price":"99.99","sku":"AMM-SUB-CREATOR-YR","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Creator Pro Monthly","price":"24.99","sku":"AMM-SUB-PRO-MO","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Creator Pro Annual (Save 20%)","price":"239.99","sku":"AMM-SUB-PRO-YR","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Plan","values":["Creator Monthly","Creator Annual (Save 17%)","Creator Pro Monthly","Creator Pro Annual (Save 20%)"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"platform","value":"tryamm.online","type":"single_line_text_field"},
      {"namespace":"custom","key":"artist_revenue_split","value":"90%","type":"single_line_text_field"},
      {"namespace":"custom","key":"distribution_platforms","value":"Spotify, Apple Music, Tidal, Amazon Music, AMM, 40+ more","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 7 — AMM Battle Pass (Seasonal)
create_amm_battlepass() {
    log_section "Product 7: AMM Battle Pass - Season 1"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Omniverse Battle Pass - Season 1: Kingdom Rising",
    "body_html": "<h2>50 Tiers of Faith-Forward Rewards.</h2><p>The Season 1 Battle Pass unlocks exclusive content across all 15+ AMM games and the creator platform. Each tier earned in any game counts toward your pass.</p><h3>50 Tier Rewards Include:</h3><ul><li><strong>Tier 1:</strong> 'Kingdom Soldier' player skin</li><li><strong>Tier 10:</strong> Holographic Gospel Lion creature for Creature Capture AR</li><li><strong>Tier 20:</strong> Legendary 'Seraphim' card for Card Battle Arena</li><li><strong>Tier 30:</strong> 'Zion Warrior' boxing skin for Holographic Arena</li><li><strong>Tier 40:</strong> Exclusive AMM Creator Hoodie discount code (50% off)</li><li><strong>Tier 50:</strong> 'Kingdom Champion' legendary title + 2000 bonus tokens</li></ul><p>Season ends September 30, 2026.</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Content",
    "tags": "battle pass, season pass, AMM, gaming, rewards, faith gaming",
    "status": "active",
    "variants": [
      {"title":"Standard Battle Pass","price":"9.99","sku":"AMM-BP-S1-STD","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Premium Battle Pass (+25 Tier Skip)","price":"19.99","sku":"AMM-BP-S1-PREM","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Pass Type","values":["Standard Battle Pass","Premium Battle Pass (+25 Tier Skip)"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"season","value":"1","type":"number_integer"},
      {"namespace":"custom","key":"tier_count","value":"50","type":"number_integer"},
      {"namespace":"custom","key":"season_end","value":"2026-09-30","type":"date"},
      {"namespace":"custom","key":"theme","value":"Kingdom Rising","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    [ -n "$pid" ] && add_metafield "$pid" "digital" "delivery" "instant" "single_line_text_field"
    echo "$pid"
}

# PRODUCT 8 — Gospel Beats Pack (Digital Music)
create_amm_gospel_beats() {
    log_section "Product 8: Gospel Beats Pack (Digital Music)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Gospel Beats Pack Vol. 1 - 50 Royalty-Free Tracks",
    "body_html": "<h2>50 Gospel Beats. Yours Forever.</h2><p>Produced exclusively for AMM Omniverse creators. Use these beats for YouTube, TikTok, church services, podcasts, and your AMM streams without copyright issues — ever.</p><ul><li>50 original gospel and contemporary Christian beats</li><li>BPM range: 60-140 (worship ballads to trap gospel)</li><li>Stems included: drums, keys, bass, choir samples</li><li>Formats: WAV (uncompressed) + MP3</li><li>License: Royalty-free for commercial use</li><li>Genres: Traditional gospel, afrobeats gospel, hip-hop gospel, R&B worship, lo-fi devotional</li></ul><p><strong>Includes:</strong> Beats pack + 300 AMM Tokens</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Music",
    "tags": "gospel beats, music production, royalty free, AMM, faith creator, hip hop gospel, afrobeats gospel, worship",
    "status": "active",
    "variants": [
      {"title":"Standard Pack - 50 Beats","price":"29.00","compare_at_price":"79.00","sku":"AMM-BEATS-VOL1","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Pro Pack - 50 Beats + Stems","price":"49.00","compare_at_price":"129.00","sku":"AMM-BEATS-VOL1-PRO","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Pack","values":["Standard Pack - 50 Beats","Pro Pack - 50 Beats + Stems"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"track_count","value":"50","type":"number_integer"},
      {"namespace":"custom","key":"license","value":"Royalty-free commercial","type":"single_line_text_field"},
      {"namespace":"custom","key":"formats","value":"WAV + MP3","type":"single_line_text_field"},
      {"namespace":"custom","key":"delivery","value":"Download link within 24 hours","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 9 — Card Battle Arena Starter Pack
create_amm_card_pack() {
    log_section "Product 9: Card Battle Arena Starter Pack (Digital)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Card Battle Arena - Starter Pack + Legendary Card",
    "body_html": "<h2>Enter the Omniverse Duel Realms.</h2><p>The AMM Card Battle Arena features 100 original faith-themed cards across 10 realms. This Starter Pack gives you an immediate competitive deck and a guaranteed Legendary pull.</p><ul><li><strong>40-card starter deck</strong> — balanced for new players</li><li><strong>1 Guaranteed Legendary card</strong> — from the Divine tier (Gospel Lion, Prophet Eagle, Storm Phoenix, or Seraphim Owl)</li><li><strong>5 Booster packs</strong> — random pulls from the full 100-card set</li><li><strong>Exclusive 'Jax Omari' protagonist card</strong> — only available in starter packs</li><li><strong>Hebrew calendar bonuses:</strong> Faith cards get power boosts during Passover, Hanukkah, and feast days</li></ul>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Gaming",
    "tags": "card game, card battle, AMM, faith cards, digital TCG, trading card game, gospel, El Saturn",
    "status": "active",
    "variants": [
      {"title":"Starter Pack + 1 Legendary","price":"9.99","sku":"AMM-CARDS-STARTER","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Elite Pack + 3 Legendaries + 15 Boosters","price":"24.99","sku":"AMM-CARDS-ELITE","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Collector Pack - Full 100-Card Set","price":"49.99","sku":"AMM-CARDS-FULL","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Pack","values":["Starter Pack + 1 Legendary","Elite Pack + 3 Legendaries + 15 Boosters","Collector Pack - Full 100-Card Set"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"card_count","value":"100","type":"number_integer"},
      {"namespace":"custom","key":"realm_count","value":"10","type":"number_integer"},
      {"namespace":"custom","key":"game_url","value":"tryamm.online","type":"single_line_text_field"},
      {"namespace":"custom","key":"calendar_integration","value":"Hebrew calendar events boost card power","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 10 — AR Skin Packs (Digital Cosmetics)
create_amm_skins() {
    log_section "Product 10: AMM AR/VR Skin Packs (Digital Cosmetics)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Omniverse Skin Packs - Player & Game Cosmetics",
    "body_html": "<h2>Look Like a Champion in Every Game.</h2><p>Skins work across all 15+ AMM games — your player character, your AR laser blaster, and your Card Battle creatures all get the upgrade at once.</p><h3>Available Collections:</h3><ul><li><strong>Kingdom Collection:</strong> Royal armor, crown, and faith emblems</li><li><strong>Gospel Artist Pack:</strong> Performer look with mic stand cosmetic and spotlight effect</li><li><strong>Lagos Heat Pack:</strong> Afrobeats-inspired patterns, Ankara prints, gold jewelry</li><li><strong>Prophet Pack:</strong> Ancient Hebrew warrior look with scroll cosmetic</li><li><strong>Cyber Saint Pack:</strong> Futuristic holographic armor with cross motif</li></ul>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Cosmetics",
    "tags": "skins, cosmetics, AMM, AR gaming, faith skins, gospel gamer, digital, avatar",
    "status": "active",
    "variants": [
      {"title":"Kingdom Collection (5 skins)","price":"7.99","sku":"AMM-SKIN-KINGDOM","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Gospel Artist Pack (5 skins)","price":"7.99","sku":"AMM-SKIN-GOSPEL","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Lagos Heat Pack (5 skins)","price":"7.99","sku":"AMM-SKIN-LAGOS","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Prophet Pack (5 skins)","price":"7.99","sku":"AMM-SKIN-PROPHET","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Cyber Saint Pack (5 skins)","price":"7.99","sku":"AMM-SKIN-CYBER","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"All 5 Collections Bundle (25 skins)","price":"29.99","compare_at_price":"39.95","sku":"AMM-SKIN-ALL","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Collection","values":["Kingdom Collection (5 skins)","Gospel Artist Pack (5 skins)","Lagos Heat Pack (5 skins)","Prophet Pack (5 skins)","Cyber Saint Pack (5 skins)","All 5 Collections Bundle (25 skins)"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"works_across_games","value":"All 15+ AMM games","type":"single_line_text_field"},
      {"namespace":"custom","key":"delivery","value":"Instant — unlocked in your AMM account","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 11 — AMM VR Arena Pass
create_amm_vr_arena() {
    log_section "Product 11: AMM WebXR VR Arena Access Pass"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM WebXR VR Arena Pass - Quest + Vision Pro Access",
    "body_html": "<h2>The Only VR Game That Needs No App Download.</h2><p>AMM Holographic Arena is real browser VR — it works inside the Meta Quest browser and Apple Vision Pro Safari with no app download, no developer mode, no sideloading. This pass unlocks premium tournament mode and exclusive VR-only content.</p><ul><li><strong>Tournament Mode:</strong> Ranked VR boxing matches with leaderboard</li><li><strong>Quest exclusive:</strong> Hand tracking mode (no controllers needed)</li><li><strong>Vision Pro mode:</strong> Eye-tracking powered combat system</li><li><strong>VR-only skins:</strong> 3 exclusive holographic looks only available in headset</li><li><strong>Monthly VR tournaments:</strong> Cash prize pool funded by entry fees</li></ul><p><strong>Supported:</strong> Meta Quest 2/3/Pro, Apple Vision Pro, HTC Vive, Valve Index (browser), any WebXR-compatible headset</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Access Pass",
    "tags": "VR, WebXR, Quest, Vision Pro, boxing arena, holographic, browser VR, no download, AMM",
    "status": "active",
    "variants": [
      {"title":"30-Day VR Arena Pass","price":"6.99","sku":"AMM-VR-PASS-30","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"90-Day VR Arena Pass","price":"17.99","compare_at_price":"20.97","sku":"AMM-VR-PASS-90","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Annual VR Arena Pass","price":"49.99","compare_at_price":"83.88","sku":"AMM-VR-PASS-YR","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Duration","values":["30-Day VR Arena Pass","90-Day VR Arena Pass","Annual VR Arena Pass"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"vr_type","value":"Browser WebXR — no app required","type":"single_line_text_field"},
      {"namespace":"custom","key":"compatible_headsets","value":"Quest 2/3/Pro, Vision Pro, HTC Vive, Valve Index, any WebXR browser","type":"single_line_text_field"},
      {"namespace":"custom","key":"tournament_access","value":"true","type":"boolean"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 12 — AMM Creature AR Collection Pack
create_amm_creatures() {
    log_section "Product 12: AMM Creature Capture AR - Rare Collection Pack"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Creature Capture AR - Rare + Legendary Collection",
    "body_html": "<h2>Catch Them All. Keep the Faith.</h2><p>AMM Creature Capture AR features 10 original faith-themed creatures. Use your phone camera, walk around your real space, and creatures appear in your world. Weaken them, throw a capture sphere, and add them to your collection. This pack gives you guaranteed catches from the top rarities.</p><ul><li><strong>Gospel Lion</strong> — Epic | Special: Holy Roar (stuns all enemies)</li><li><strong>Prophet Eagle</strong> — Legendary | Special: Prophecy Strike (triple hit)</li><li><strong>Storm Phoenix</strong> — Legendary | Special: Rebirth (restore HP on KO)</li><li><strong>Seraphim Owl</strong> — Divine (rarest) | Special: Divine Vision (instant capture)</li></ul><p>This pack guarantees 1 Legendary + 1 Epic + 3 Rare creatures added directly to your account.</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Gaming",
    "tags": "AR, creature capture, mobile AR, faith creatures, gospel lion, divine, legendary, AMM",
    "status": "active",
    "variants": [
      {"title":"Rare Pack (3 Rares guaranteed)","price":"5.99","sku":"AMM-CREATURE-RARE","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Epic Pack (1 Epic + 2 Rare)","price":"11.99","sku":"AMM-CREATURE-EPIC","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Legendary Pack (1 Legendary + 1 Epic + 3 Rare)","price":"19.99","sku":"AMM-CREATURE-LEG","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Divine Pack (Seraphim Owl guaranteed)","price":"39.99","sku":"AMM-CREATURE-DIV","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Pack","values":["Rare Pack (3 Rares guaranteed)","Epic Pack (1 Epic + 2 Rare)","Legendary Pack (1 Legendary + 1 Epic + 3 Rare)","Divine Pack (Seraphim Owl guaranteed)"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"total_creatures","value":"10","type":"number_integer"},
      {"namespace":"custom","key":"ar_type","value":"Camera passthrough — creatures appear in your real space","type":"single_line_text_field"},
      {"namespace":"custom","key":"rarity_tiers","value":"Common, Rare, Epic, Legendary, Divine","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 13 — AMM Vocal Coach Pro Session
create_amm_vocal_coaching() {
    log_section "Product 13: AMM AI Vocal Coach Session Pack (Digital)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM AI Vocal Coach - Session Pack for Gospel and R&B Singers",
    "body_html": "<h2>Your Personal Vocal Coach. Available 24/7.</h2><p>AMM's AI Vocal Coach is powered by Gemini and trained specifically for gospel, R&B, and contemporary Christian music. This session pack gives you unlimited AI coaching sessions plus curated warm-up routines for your voice type.</p><ul><li>Voice types: Soprano, Mezzo, Alto, Tenor, Baritone, Bass</li><li>6 warm-up exercises with countdown timers and breathing patterns</li><li>AI analyzes your specific struggle and gives targeted technique feedback</li><li>Pre-session checklist with your 62-track studio vocal setup</li><li>Gospel run drills for advanced melisma</li><li>Breathing fundamentals: Diaphragmatic support, resonance placement, passaggio navigation</li></ul><p>No AI key needed — works out of the box. Add VITE_GEMINI_API_KEY for personalized session feedback.</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Service",
    "tags": "vocal coach, AI coaching, gospel singing, R&B, worship vocalist, music coaching, AMM",
    "status": "active",
    "variants": [
      {"title":"30-Day Vocal Coach Access","price":"9.99","sku":"AMM-VOCAL-30","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"90-Day Vocal Coach + Studio Bundle","price":"19.99","sku":"AMM-VOCAL-90","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Plan","values":["30-Day Vocal Coach Access","90-Day Vocal Coach + Studio Bundle"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"ai_powered","value":"true","type":"boolean"},
      {"namespace":"custom","key":"genres","value":"Gospel, R&B, Contemporary Christian, Afrobeats Gospel","type":"single_line_text_field"},
      {"namespace":"custom","key":"voice_types_supported","value":"Soprano, Mezzo, Alto, Tenor, Baritone, Bass","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 14 — Drama Box Series Pass
create_amm_drama_pass() {
    log_section "Product 14: AMM Drama Box Series Pass (Digital)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Drama Box Series Pass - Faith Entertainment Streaming",
    "body_html": "<h2>Faith-Forward Drama. Your Phone. Your Schedule.</h2><p>AMM Drama Box is the faith-centered streaming studio inside AMM Omniverse. Series passes unlock all episodes of a show plus the AI Script Writer for aspiring filmmakers.</p><h3>Current Series Available:</h3><ul><li><strong>Kingdom Chronicles:</strong> Faith drama series — 8 episodes</li><li><strong>Redemption Road:</strong> Recovery and restoration story — 6 episodes</li><li><strong>The Prophet's Call:</strong> Biblical fiction drama — 10 episodes</li><li><strong>Lagos to Glory:</strong> Afrobeats gospel musical drama — 8 episodes</li></ul><p><strong>Creator Add-On:</strong> Access the AI Script Writer to pitch your own series concept and get a full series bible + Episode 1 script generated by AI.</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Streaming",
    "tags": "drama, faith streaming, AMM, gospel entertainment, Christian movies, Bible drama, faith TV",
    "status": "active",
    "variants": [
      {"title":"Single Series Pass (1 show, all episodes)","price":"7.99","sku":"AMM-DRAMA-SINGLE","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"All Series Pass (all 4 shows)","price":"19.99","sku":"AMM-DRAMA-ALL","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Creator Pass (all shows + AI Script Writer)","price":"29.99","sku":"AMM-DRAMA-CREATOR","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Pass Type","values":["Single Series Pass (1 show, all episodes)","All Series Pass (all 4 shows)","Creator Pass (all shows + AI Script Writer)"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"series_count","value":"4","type":"number_integer"},
      {"namespace":"custom","key":"genre","value":"Faith Drama, Gospel Musical, Biblical Fiction","type":"single_line_text_field"},
      {"namespace":"custom","key":"ai_script_writer","value":"Included in Creator Pass","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 15 — AMM Podcast Pro Suite
create_amm_podcast() {
    log_section "Product 15: AMM Podcast Studio Pro Suite (Digital)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Podcast Studio Pro - Faith Creator Bundle",
    "body_html": "<h2>Your Faith Podcast. Professional Sound.</h2><p>The AMM Podcast Studio is a full browser-based recording suite designed for faith content creators, pastors, church leaders, and gospel entertainers. No software to download — record, edit, publish, and monetize all from tryamm.online.</p><ul><li>8 topic categories: Faith & Gospel, Sports Commentary, Music Reviews, News Broadcast, Testimony Hour, Church Leadership, Community Conversations, Youth Ministry</li><li>Professional recording with noise gate and compression</li><li>Episode library management</li><li>Direct distribution to AMM Music platform and linked platforms</li><li>Monetization: listener tips, episode unlock pricing, sponsor integration</li><li>Co-host remote recording (up to 4 guests via LiveKit)</li></ul><p><strong>Pro Bundle adds:</strong> Custom intro/outro music from Gospel Beats Pack Vol. 1 + branded episode artwork generator + 1000 AMM Tokens/month</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Service",
    "tags": "podcast, faith podcast, AMM, church podcast, gospel radio, Christian content, podcast studio",
    "status": "active",
    "variants": [
      {"title":"Podcast Studio Access - Monthly","price":"7.99","sku":"AMM-POD-MO","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Podcast Studio Pro Bundle - Monthly","price":"14.99","sku":"AMM-POD-PRO-MO","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Plan","values":["Podcast Studio Access - Monthly","Podcast Studio Pro Bundle - Monthly"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"platform","value":"tryamm.online","type":"single_line_text_field"},
      {"namespace":"custom","key":"max_guests","value":"4","type":"number_integer"},
      {"namespace":"custom","key":"topic_categories","value":"8","type":"number_integer"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 16 — AMM Book Publisher Bundle
create_amm_book_bundle() {
    log_section "Product 16: AMM KDP Book Publisher + AI Writer Bundle"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Book Publisher Bundle - AI Writing + KDP Publishing + Print-on-Demand",
    "body_html": "<h2>Write Your Book. Publish to Amazon. Ship Worldwide.</h2><p>The AMM KDP Book Publisher gives faith authors everything needed to write, publish, and sell their book — from the first chapter to Amazon KDP to print-on-demand delivery worldwide — all inside AMM Omniverse.</p><h3>What's Included:</h3><ul><li><strong>AI Writing Assistant:</strong> Chapter outlines, writing prompts, grammar help powered by Gemini</li><li><strong>KDP Formatting:</strong> Auto-format your manuscript for Amazon Kindle and Print</li><li><strong>Print-on-Demand:</strong> Side-by-side comparison of KDP Print, IngramSpark (39,000+ retailers), Lulu, Blurb, and Printful</li><li><strong>Amazon KDP Guide:</strong> Step-by-step inside the app</li><li><strong>ISRC/UPC equivalent for books:</strong> ISBN guidance</li></ul><p><strong>AMM Recommended stack:</strong> KDP (free, Amazon) → IngramSpark ($49, 39k+ retailers) → Lulu (direct, 80% margin) → Printful bundle with merch</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Service",
    "tags": "book publishing, KDP, Amazon, print on demand, faith author, Christian book, AMM, AI writing",
    "status": "active",
    "variants": [
      {"title":"Book Publisher Access - 90 Days","price":"19.99","sku":"AMM-BOOK-90","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Book Publisher Pro - Annual","price":"49.99","sku":"AMM-BOOK-YR","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Plan","values":["Book Publisher Access - 90 Days","Book Publisher Pro - Annual"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"ai_writing","value":"true","type":"boolean"},
      {"namespace":"custom","key":"pod_services","value":"KDP Print, IngramSpark, Lulu, Blurb, Printful","type":"single_line_text_field"},
      {"namespace":"custom","key":"isbn_guidance","value":"true","type":"boolean"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 17 — AMM Africa Pay Gateway Access
create_amm_africa_pay() {
    log_section "Product 17: AMM Africa Pay Bundle (Paystack + Flutterwave + M-Pesa)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Africa Creator Bundle - Nigeria, Ghana, Kenya, Diaspora Payout Setup",
    "body_html": "<h2>Get Paid in Your Currency. From Anywhere.</h2><p>AMM Omniverse supports African payment methods natively. This bundle sets up your creator account to receive payouts via Paystack, Flutterwave, M-Pesa, OPay, and Chipper Cash — so a creator in Lagos, Accra, Nairobi, or London receives earnings in their local currency, not just USD.</p><h3>Supported Methods:</h3><ul><li><strong>Paystack:</strong> Nigeria, Ghana, South Africa, Kenya</li><li><strong>Flutterwave:</strong> 20+ African countries (pan-Africa leader)</li><li><strong>M-Pesa:</strong> Kenya, Tanzania, Uganda, East Africa</li><li><strong>OPay:</strong> Nigeria mobile money</li><li><strong>Chipper Cash:</strong> Diaspora transfers — US/UK to Africa</li></ul><p><strong>Includes:</strong> Payment setup guide + 500 Tokens + 30-day Creator subscription for African creators</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Service",
    "tags": "Africa payments, Paystack, Flutterwave, M-Pesa, Nigeria creator, Ghana creator, Kenya creator, diaspora, AMM",
    "status": "active",
    "variants": [
      {"title":"Africa Creator Setup Bundle","price":"9.99","sku":"AMM-AFRICA-BUNDLE","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Bundle","values":["Africa Creator Setup Bundle"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"payment_methods","value":"Paystack, Flutterwave, M-Pesa, OPay, Chipper Cash","type":"single_line_text_field"},
      {"namespace":"custom","key":"countries","value":"Nigeria, Ghana, Kenya, South Africa, Uganda, Tanzania, UK, US diaspora","type":"single_line_text_field"},
      {"namespace":"custom","key":"includes_tokens","value":"500","type":"number_integer"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# PRODUCT 18 — AMM Record Label Deal Package
create_amm_label_deal() {
    log_section "Product 18: AMM Record Label Deal Package"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Record Label Deal - Artist Distribution & Label Services",
    "body_html": "<h2>Your Own Label Deal. With Real Terms.</h2><p>AMM Record Label offers transparent deals with no recoupment traps, no ownership grabs, and royalty splits that make Sony and Universal look predatory. Get real label services — distribution, marketing support, territory management, revenue tracking — and keep the vast majority of what you earn.</p><h3>Deal Types:</h3><ul><li><strong>Distribution Only:</strong> Artist keeps 90%, AMM keeps 10%. We distribute to 40+ platforms. You own everything.</li><li><strong>Licensing Deal:</strong> Artist keeps 85%. Label licenses specific songs for sync and placement.</li><li><strong>Full Label:</strong> Artist keeps 80%. Label funds recording, marketing, distribution. No debt recoupment.</li><li><strong>Joint Venture:</strong> Artist keeps 75%. Equal partnership on specific projects.</li></ul><h3>Comparison:</h3><ul><li>Sony/Universal/Warner: Artist keeps 15-25% after recoupment</li><li>DistroKid alone: 100% but no support</li><li><strong>AMM: 75-90% WITH full label support</strong></li></ul><p><strong>Territories:</strong> US, Nigeria, Ghana, UK, Kenya, Caribbean, and expanding.</p>",
    "vendor": "All American Marketplace",
    "product_type": "Artist Services",
    "tags": "record label, music distribution, artist deal, gospel label, AMM, independent artist, royalties, Spotify distribution",
    "status": "active",
    "variants": [
      {"title":"Distribution Only Deal (Artist keeps 90%)","price":"49.99","compare_at_price":"149.99","sku":"AMM-LABEL-DIST","inventory_quantity":999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Full Label Deal (Artist keeps 80%) - Annual","price":"199.99","compare_at_price":"499.99","sku":"AMM-LABEL-FULL","inventory_quantity":100,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Deal Type","values":["Distribution Only Deal (Artist keeps 90%)","Full Label Deal (Artist keeps 80%) - Annual"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"artist_split_min","value":"80","type":"number_integer"},
      {"namespace":"custom","key":"artist_split_max","value":"90","type":"number_integer"},
      {"namespace":"custom","key":"distribution_platforms","value":"Spotify, Apple Music, Tidal, Amazon Music, AMM, Boomplay, 40+ total","type":"single_line_text_field"},
      {"namespace":"custom","key":"territories","value":"US, Nigeria, Ghana, UK, Kenya, Caribbean","type":"single_line_text_field"},
      {"namespace":"custom","key":"recoupment","value":"none","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}


# PRODUCT 19 — AMM Holographic Battle Decks (the 6 league decks)
create_amm_battle_decks() {
    log_section "Product 19: AMM Holographic Battle Decks (Digital)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Holographic Battle Decks - Fantasy Card League",
    "body_html": "<h2>Your Deck. Your Strategy. Live-Streamed Glory.</h2><p>Six complete 40-card holographic battle decks for the AMM Fantasy Card League. Every deck unlocks in-app with live 3D holographic card rendering (rainbow foil shimmer, floating animation) and qualifies you for streamed league duels where spectators watch and send gifts.</p><ul><li><strong>Tribe of Judah ($4.99):</strong> Aggressive warrior rush — best for beginners, 58% win rate</li><li><strong>Children of Light ($4.99):</strong> Healing and protection — outlast your opponent</li><li><strong>El Saturn Command ($9.99):</strong> Advanced fusion combos — one-shot potential</li><li><strong>Shadow Redeemer ($9.99):</strong> Control and disruption — win through card advantage</li><li><strong>Zion Omega ($19.99):</strong> Tournament tier — Hebrew calendar feast day power bonuses</li><li><strong>Seraphim Divine ($39.99):</strong> LIMITED — only 777 ever sold. 3 Divine cards that cannot be countered. 74% win rate.</li></ul><p>All decks work in Card Battle Arena (8000 LP Yu-Gi-Oh style duels) AND Fantasy Card League brackets. Buy once, own forever, duel live on stream.</p>",
    "vendor": "All American Marketplace",
    "product_type": "Digital Gaming",
    "tags": "battle deck, card game, holographic, fantasy league, TCG, faith cards, AMM, live stream dueling",
    "status": "active",
    "variants": [
      {"title":"Tribe of Judah (Rookie)","price":"4.99","sku":"AMM-DECK-JUDAH","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Children of Light (Rookie)","price":"4.99","sku":"AMM-DECK-LIGHT","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"El Saturn Command (Champion)","price":"9.99","sku":"AMM-DECK-SATURN","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Shadow Redeemer (Champion)","price":"9.99","sku":"AMM-DECK-SHADOW","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Zion Omega (Legend)","price":"19.99","sku":"AMM-DECK-ZION","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"Seraphim Divine (LIMITED 777)","price":"39.99","compare_at_price":"79.99","sku":"AMM-DECK-SERAPHIM","inventory_quantity":777,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false},
      {"title":"ALL 6 DECKS BUNDLE","price":"69.99","compare_at_price":"89.94","sku":"AMM-DECK-ALL6","inventory_quantity":99999,"inventory_management":"shopify","weight":0,"weight_unit":"kg","requires_shipping":false}
    ],
    "options":[{"name":"Deck","values":["Tribe of Judah (Rookie)","Children of Light (Rookie)","El Saturn Command (Champion)","Shadow Redeemer (Champion)","Zion Omega (Legend)","Seraphim Divine (LIMITED 777)","ALL 6 DECKS BUNDLE"]}],
    "metafields":[
      {"namespace":"custom","key":"digital_item","value":"true","type":"boolean"},
      {"namespace":"custom","key":"cards_per_deck","value":"40","type":"number_integer"},
      {"namespace":"custom","key":"holographic_3d","value":"true — live Three.js rendering in app","type":"single_line_text_field"},
      {"namespace":"custom","key":"league_eligible","value":"All 4 league tiers","type":"single_line_text_field"},
      {"namespace":"custom","key":"limited_edition","value":"Seraphim Divine capped at 777 units","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}


# PRODUCT 20 — PHYSICAL Holographic Battle Decks (printed, mailed to customer)
create_amm_physical_decks() {
    log_section "Product 20: PHYSICAL Holographic Battle Decks (Ships to customer)"
    local json
    json=$(cat << 'EOF'
{
  "product": {
    "title": "AMM Physical Holographic Battle Deck - Printed Cards Shipped to You",
    "body_html": "<h2>Hold the Kingdom in Your Hands.</h2><p>Real printed 44-card battle decks with holographic foil finish — the same decks from AMM Fantasy Card League, manufactured and mailed direct to your door. Every physical deck includes a QR unlock card: scan it and the matching digital deck unlocks FREE in the AMM app, with live 3D holographic rendering and league eligibility.</p><ul><li><strong>44 cards per deck</strong> — premium 300gsm card stock, holographic foil finish</li><li><strong>QR unlock card included</strong> — physical purchase unlocks the digital deck free ($4.99–$39.99 value)</li><li><strong>Play offline OR online</strong> — real card battles at home, digital duels streamed live on AMM</li><li><strong>Seraphim Divine physical</strong> — LIMITED to 777 numbered decks, individually serialized</li></ul><p>Ships in 5–9 business days within the US. International shipping available.</p>",
    "vendor": "All American Marketplace",
    "product_type": "Physical Trading Cards",
    "tags": "physical cards, holographic deck, trading cards, TCG, faith cards, AMM, printed deck, collectible",
    "status": "active",
    "variants": [
      {"title":"Tribe of Judah - Physical","price":"29.99","sku":"AMM-PDECK-JUDAH","inventory_quantity":500,"inventory_management":"shopify","weight":0.15,"weight_unit":"kg","requires_shipping":true},
      {"title":"El Saturn Command - Physical","price":"29.99","sku":"AMM-PDECK-SATURN","inventory_quantity":500,"inventory_management":"shopify","weight":0.15,"weight_unit":"kg","requires_shipping":true},
      {"title":"Zion Omega - Physical","price":"39.99","sku":"AMM-PDECK-ZION","inventory_quantity":300,"inventory_management":"shopify","weight":0.15,"weight_unit":"kg","requires_shipping":true},
      {"title":"Seraphim Divine - Physical LIMITED #/777","price":"59.99","compare_at_price":"99.99","sku":"AMM-PDECK-SERAPHIM","inventory_quantity":777,"inventory_management":"shopify","weight":0.15,"weight_unit":"kg","requires_shipping":true}
    ],
    "options":[{"name":"Deck","values":["Tribe of Judah - Physical","El Saturn Command - Physical","Zion Omega - Physical","Seraphim Divine - Physical LIMITED #/777"]}],
    "metafields":[
      {"namespace":"custom","key":"card_count","value":"44","type":"number_integer"},
      {"namespace":"custom","key":"includes_digital_unlock","value":"true — QR card unlocks digital deck free","type":"single_line_text_field"},
      {"namespace":"custom","key":"finish","value":"Holographic foil, 300gsm","type":"single_line_text_field"},
      {"namespace":"custom","key":"fulfillment","value":"MakePlayingCards.com POD dropship (launch) / bulk Shuffled Ink (scale)","type":"single_line_text_field"},
      {"namespace":"custom","key":"shipping_days","value":"5-9 business days US","type":"single_line_text_field"}
    ]
  }
}
EOF
)
    local pid; pid=$(create_product "$json")
    echo "$pid"
}

# =============================================================================
# COLLECTIONS
# =============================================================================

create_all_collections() {
    log_section "Creating Collections"

    local c1 c2 c3 c4 c5
    c1=$(create_collection "AR/VR/MR Gaming Gear" "<h2>Physical Gear for the Virtual World</h2><p>AMM AR Blasters, VR Boxing Gloves, Mixed Reality Mounts — real hardware that makes your AMM games feel real.</p>")
    c2=$(create_collection "AMM Creator Suite" "<h2>Build. Record. Publish. Earn 90%.</h2><p>Subscriptions, vocal coaching, podcast studio, book publishing, record label deals — everything a faith creator needs to build a career.</p>")
    c3=$(create_collection "Digital Games & Passes" "<h2>Level Up Your Game.</h2><p>Token packs, battle passes, skin packs, VR arena access, card packs, creature collections. Everything to maximize your AMM Omniverse experience.</p>")
    c4=$(create_collection "Faith Entertainment" "<h2>Drama. Music. Stories Worth Telling.</h2><p>Drama Box series passes, gospel beats, podcast access — faith-forward entertainment built by and for the Black diaspora.</p>")
    c5=$(create_collection "Africa Creator Hub" "<h2>For Creators Across the Diaspora.</h2><p>Africa payment gateway bundles, international distribution, and tools built for creators in Nigeria, Ghana, Kenya, UK, and the Caribbean.</p>")

    log_success "5 collections created"
}

# =============================================================================
# MAIN
# =============================================================================

main() {
    log_section "AMM OMNIVERSE — SHOPIFY STORE LOADER"
    echo -e "${PURPLE}  All American Marketplace LLC${NC}"
    echo -e "${PURPLE}  tryamm.online | Cary, IL | July 2026${NC}"
    echo -e "${PURPLE}  20 AR/VR/MR Products | 5 Collections${NC}"
    echo ""
    log_info "Store: $SHOPIFY_STORE"
    log_info "API Version: $API_VERSION"
    echo ""

    check_prerequisites

    echo ""
    log_info "This will create 20 products in your Shopify store:"
    echo ""
    echo "  ── PHYSICAL (Ships to customer) ──────────────────"
    echo "  1.  AMM AR Laser Tag Blaster              \$24.99–\$79.99"
    echo "  2.  AMM VR Boxing Gloves                  \$24.99–\$34.99"
    echo "  3.  AMM MR Glasses Mount                  \$27.99–\$44.99"
    echo "  4.  AMM Creator Live Stream Rig           \$38.99–\$44.99"
    echo ""
    echo "  ── DIGITAL (Instant delivery) ────────────────────"
    echo "  5.  AMM Token Packs                       \$4.99–\$99.99"
    echo "  6.  AMM Creator Subscription              \$9.99–\$239.99/yr"
    echo "  7.  AMM Battle Pass Season 1              \$9.99–\$19.99"
    echo "  8.  Gospel Beats Pack Vol. 1              \$29–\$49"
    echo "  9.  Card Battle Arena Starter Pack        \$9.99–\$49.99"
    echo " 10.  AMM Skin Packs (5 collections)        \$7.99–\$29.99"
    echo " 11.  WebXR VR Arena Pass                   \$6.99–\$49.99"
    echo " 12.  Creature Capture AR Pack              \$5.99–\$39.99"
    echo " 13.  AI Vocal Coach Session Pack           \$9.99–\$19.99"
    echo " 14.  Drama Box Series Pass                 \$7.99–\$29.99"
    echo " 15.  Podcast Studio Pro Suite              \$7.99–\$14.99"
    echo " 16.  Book Publisher + AI Writer Bundle     \$19.99–\$49.99"
    echo " 17.  Africa Creator Bundle (Paystack/M-Pesa) \$9.99"
    echo " 18.  Record Label Deal Package             \$49.99–\$199.99"
    echo ""
    echo "  ── 5 COLLECTIONS ─────────────────────────────────"
    echo "  AR/VR/MR Gaming Gear | Creator Suite | Digital Games"
    echo "  Faith Entertainment | Africa Creator Hub"
    echo ""
    read -p "Ready to load all 20 products? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Cancelled. Run again when ready."
        exit 0
    fi

    log_section "Loading Products"

    # Physical
    create_amm_ar_blaster
    create_amm_vr_gloves
    create_amm_mr_glasses
    create_amm_creator_rig

    # Digital
    create_amm_tokens
    create_amm_subscription
    create_amm_battlepass
    create_amm_gospel_beats
    create_amm_card_pack
    create_amm_skins
    create_amm_vr_arena
    create_amm_creatures
    create_amm_vocal_coaching
    create_amm_drama_pass
    create_amm_podcast
    create_amm_book_bundle
    create_amm_africa_pay
    create_amm_label_deal
    create_amm_battle_decks
    create_amm_physical_decks

    # Collections
    create_all_collections

    # Cleanup
    rm -f /tmp/product_*.json /tmp/collection_*.json

    log_section "✅ STORE LOAD COMPLETE"
    echo ""
    log_success "20 products loaded into your Shopify store"
    log_success "5 collections created"
    echo ""
    log_info "NEXT STEPS FOR VICTOR:"
    echo ""
    echo "  1. Shopify Admin → verify all 20 products appear"
    echo "  2. Add product images (AI-generated or photography)"
    echo "  3. Set shipping rates for physical products (Products 1–4)"
    echo "  4. Configure Stripe payment gateway"
    echo "  5. Add Paystack/Flutterwave for Africa buyers (Apps → Payment providers)"
    echo "  6. Build webhook: when order placed → POST to /api/shopify/order-webhook on Render backend"
    echo "  7. Webhook delivers: tokens to account, unlocks passes, confirms physical order"
    echo "  8. Set up Printful integration for Creator Rig (product 4) fulfillment"
    echo ""
    log_info "Store: https://$SHOPIFY_STORE"
    log_info "Admin: https://$SHOPIFY_STORE/admin"
    log_info "Public: https://tryamm.online"
    echo ""
    echo -e "${CYAN}  AMM Omniverse — The Faith-Forward Creator Metaverse${NC}"
    echo -e "${CYAN}  All American Marketplace LLC | tryamm.online${NC}"
}

main "$@"
