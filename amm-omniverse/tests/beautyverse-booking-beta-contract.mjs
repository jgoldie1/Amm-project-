import fs from 'node:fs'
import assert from 'node:assert/strict'
const entry=fs.readFileSync(new URL('../src/main.tsx',import.meta.url),'utf8')
const booking=fs.readFileSync(new URL('../src/components/BeautyVerseBookingBeta.tsx',import.meta.url),'utf8')
assert.ok(entry.includes("'/beautyverse/book-preview'"),'Booking demo route missing')
assert.ok(entry.includes('VITE_ENABLE_TAMPA_VOLCANO_BETA'), 'Feature gate missing')
assert.match(booking,/No payment, customer information, or appointments are collected/, 'Demo limitations required')
assert.doesNotMatch(booking,/fetch\(|WebSocket\(|localStorage\.|sessionStorage\./,'Booking demo cannot persist or transmit customer data')
console.log('PASS BeautyVerse booking beta isolation contract')
