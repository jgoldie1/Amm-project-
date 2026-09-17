import fs from 'node:fs'
import test from 'node:test'
import assert from 'node:assert/strict'

const source=fs.readFileSync(new URL('../answer.js',import.meta.url),'utf8')

test('HoloGPT retains cloud and owned provider families',()=>{
  for(const provider of ['openai','gemini','claude','glm','deepseek','selfHosted','ammBackend'])assert.ok(source.includes(provider))
})
