import { test, expect } from '@playwright/test';

const DESTINATION_KEY='tryamm.streetverse.chicago-destination.v2';

test.describe('Chicago 77 production certification', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(({ key }) => {
      localStorage.setItem(key, JSON.stringify({
        id:'ca-32',
        type:'community-area',
        communityAreaNumber:'32',
        name:'The Loop',
        label:'The Loop',
        city:'Chicago',
      }));

      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function(type: any, ...args: any[]) {
        if (String(type).includes('webgl')) return null;
        return (original as any).call(this, type, ...args);
      } as any;

      (window as any).__tryammCertificationEvents=[];
      for (const eventName of ['tryamm:streetverse-checkpoint','tryamm:streetverse-mission-complete','tryamm:open-reel-creator']) {
        window.addEventListener(eventName, (event: Event) => {
          (window as any).__tryammCertificationEvents.push({
            type:event.type,
            detail:(event as CustomEvent).detail,
          });
        });
      }
    }, { key: DESTINATION_KEY });
  });

  test('Loop #32 loads, completes checkpoints, emits mission completion and Reel handoff', async ({ page }) => {
    const probe = await page.request.get('/streetverse?communityArea=32&safe=1', { timeout:45_000 });
    expect(probe.status()).toBeLessThan(400);

    await page.goto('/streetverse?communityArea=32&safe=1', { waitUntil:'commit', timeout:45_000 });

    const world = page.locator('[data-streetverse-html-city="true"][data-community-area="32"]');
    await expect(world).toBeVisible({ timeout:45_000 });
    await expect(world).toContainText('STREETVERSE • THE LOOP');
    await expect(world).toContainText('COMMUNITY AREA 32');

    const missions = [
      'The Loop Business Scout',
      'The Loop Mobility Hub',
      'The Loop Creator Stage',
      'The Loop Community Mission',
    ];

    for (const mission of missions) {
      const button = world.getByRole('button', { name: new RegExp(mission, 'i') });
      await expect(button).toBeVisible();
      await button.click();
    }

    await expect(world).toContainText('THE LOOP COMPLETE ✓');

    const reelButton = world.getByRole('button', { name:/REEL/i });
    await reelButton.click();

    const events = await page.evaluate(() => (window as any).__tryammCertificationEvents || []);
    const checkpoints = events.filter((event:any)=>event.type==='tryamm:streetverse-checkpoint');
    const completion = events.find((event:any)=>event.type==='tryamm:streetverse-mission-complete');
    const reel = events.find((event:any)=>event.type==='tryamm:open-reel-creator');

    expect(checkpoints).toHaveLength(4);
    expect(completion?.detail?.communityAreaNumber).toBe('32');
    expect(completion?.detail?.communityAreaName).toBe('The Loop');
    expect(completion?.detail?.total).toBe(4);
    expect(reel?.detail?.communityAreaNumber).toBe('32');
    expect(reel?.detail?.communityAreaName).toBe('The Loop');
    expect(reel?.detail?.missionProgress).toBe('4/4');
  });
});