import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const required = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required production acceptance secret: ${name}`);
  return value;
};

test('real authenticated owner journey persists through reload and RLS returns owner-only records', async ({ page }) => {
  const email = required('E2E_TEST_EMAIL');
  const password = required('E2E_TEST_PASSWORD');
  const supabaseUrl = required('E2E_SUPABASE_URL');
  const publishableKey = required('E2E_SUPABASE_PUBLISHABLE_KEY');

  const verifier = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: authData, error: authError } = await verifier.auth.signInWithPassword({ email, password });
  if (authError || !authData.user) throw authError ?? new Error('Acceptance user did not authenticate.');
  const userId = authData.user.id;

  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in or create account' }).click();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Signed in.');
  await page.getByRole('button', { name: 'Close account panel' }).click();

  await page.getByRole('button', { name: 'Open secure core journey' }).click();
  await expect(page.getByText(/Authenticated as/)).toBeVisible();

  const step = async (name: string) => {
    const button = page.getByRole('button', { name: new RegExp(name) });
    await expect(button).toBeEnabled();
    await button.click();
    await expect(button.getByText('✓ DONE')).toBeVisible({ timeout: 30_000 });
  };

  const uniqueBusinessName = `TRYAMM E2E ${Date.now()}`;
  await page.getByLabel('Business name').fill(uniqueBusinessName);
  await step('Authenticated Passport save/reload');
  await step('Authenticated Business creation');
  await step('Marketplace order');
  await step('JARVIS approval firewall');
  await step('Server-authoritative sandbox Money Engine');
  await step('Realtime Holo Delivery');
  await step('Business dashboard aggregation');
  await step('Persisted audit evidence');
  await step('Reload persistent evidence');
  await expect(page.getByText(/Completed steps this session: 9\/9/)).toBeVisible();

  const { data: businesses, error: businessError } = await verifier
    .from('tryamm_businesses')
    .select('id,owner_id,name,status')
    .eq('name', uniqueBusinessName);
  if (businessError) throw businessError;
  expect(businesses?.length).toBeGreaterThan(0);
  expect(businesses?.every((row) => row.owner_id === userId)).toBeTruthy();
  const business = businesses![0];

  const { data: orders, error: orderError } = await verifier
    .from('tryamm_orders')
    .select('id,buyer_id,business_id,status,total_minor')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })
    .limit(5);
  if (orderError) throw orderError;
  expect(orders?.length).toBeGreaterThan(0);
  expect(orders?.every((row) => row.buyer_id === userId)).toBeTruthy();
  expect(orders?.some((row) => row.status === 'delivered')).toBeTruthy();

  await page.reload();
  await page.getByRole('button', { name: 'Open secure core journey' }).click();
  await expect(page.getByText(/Authenticated as/)).toBeVisible();

  const { data: visibleBusinesses, error: visibleBusinessError } = await verifier
    .from('tryamm_businesses')
    .select('id,owner_id,name')
    .limit(200);
  if (visibleBusinessError) throw visibleBusinessError;
  expect(visibleBusinesses?.every((row) => row.owner_id === userId)).toBeTruthy();

  const { data: visibleOrders, error: visibleOrderError } = await verifier
    .from('tryamm_orders')
    .select('id,buyer_id,business_id,status')
    .limit(200);
  if (visibleOrderError) throw visibleOrderError;
  expect(visibleOrders?.every((row) => row.buyer_id === userId || row.business_id === business.id)).toBeTruthy();
});
