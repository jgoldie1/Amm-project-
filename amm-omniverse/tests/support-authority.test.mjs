import test from 'node:test'
import assert from 'node:assert/strict'
import {hasSupportAuthority} from '../api/_lib/support-authority.js'
test('user-editable profile data cannot grant support access',()=>{assert.equal(hasSupportAuthority({id:'user',user_metadata:{role:'admin',roles:['support']}},''),false)})
test('server-managed role or exact configured account can authorize operators',()=>{assert.equal(hasSupportAuthority({id:'operator',app_metadata:{role:'support'}},''),true);assert.equal(hasSupportAuthority({id:'operator'},'operator'),true);assert.equal(hasSupportAuthority({id:'oper'},'operator'),false)})
