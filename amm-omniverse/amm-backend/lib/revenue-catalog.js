const REVENUE_STREAMS = {
  live_streaming: ['subscriptions','creator_gifts','pk_boosters','paid_rooms','ppv','sponsorships','live_ads','virtual_goods'],
  short_video_media: ['ads','subscriptions','creator_tips','brand_campaigns','premium_content'],
  holodrama_tv: ['ads','subscriptions','episode_unlocks','season_passes','sponsorships','product_placement','licensing','merchandise','soundtracks','premieres'],
  starverse: ['sponsorships','audition_events','fan_gifts','tickets','brand_campaigns','merchandise'],
  music_audio: ['subscriptions','streaming_revenue','downloads','tips','soundtracks','publishing','sync_licensing','creator_tools'],
  gaming_quantumverse: ['subscriptions','cosmetics','battle_pass','expansions','events','sponsorships','holo_ads','virtual_goods','creator_marketplace'],
  marketplace: ['seller_fees','commissions','featured_listings','live_commerce','auctions','group_buy','subscriptions','advertising'],
  quantum_sourcing: ['sourcing_fees','inspection_fees','procurement_management','private_label_margin','supplier_subscriptions'],
  logistics_delivery: ['dispatch_fees','delivery_fees','freight_brokerage','warehouse_margin','fulfillment_fees','premium_service'],
  holo_advertising: ['display_ads','holographic_ads','world_sponsorships','product_placement','creator_campaigns','auctioned_inventory'],
  ai_cafe: ['food_beverage','subscriptions','franchise_licensing','delivery','events','merchandise','brand_partnerships'],
  education: ['tuition','courses','certifications','enterprise_training','employer_partnerships','labs','continuing_education'],
  workforce_call_center: ['bpo_contracts','per_seat_fees','per_call_fees','insurance_support','customer_service_contracts','training'],
  omnicare_360: ['subscriptions','partner_referrals','care_coordination','employer_plans','family_plans'],
  omnishield_360: ['consumer_subscriptions','family_subscriptions','business_seats','enterprise_api','carrier_licensing','verification_services'],
  omni_protect: ['auto_partner_revenue','home_partner_revenue','device_partner_revenue','travel_partner_revenue','service_marketplace_fees'],
  app_store: ['developer_fees','app_commissions','subscriptions','promoted_apps','enterprise_distribution'],
  creator_tools: ['daw_tools','video_tools','game_tools','publishing_tools','ai_tools','storage','rendering'],
  kingdoms_press: ['book_sales','subscriptions','publishing_services','audiobooks','licensing','events'],
  omni_exchange: ['marketplace_fees','licensing_fees','business_services','digital_goods','approved_exchange_services'],
  holo_exchange: ['holo_inventory_fees','ad_auction_fees','spatial_commerce','world_sponsorships'],
  crypto_stock_simulation: ['education_subscriptions','data_tools','simulation_tournaments','enterprise_training'],
  api_platform: ['api_usage','sdk_licensing','enterprise_contracts','white_label','data_services'],
}

function flattenRevenueStreams(){
  return Object.entries(REVENUE_STREAMS).flatMap(([system,streams])=>streams.map(stream=>({system,stream})))
}

module.exports={REVENUE_STREAMS,flattenRevenueStreams}
