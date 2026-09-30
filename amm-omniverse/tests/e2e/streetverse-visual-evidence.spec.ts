import { test, expect } from '@playwright/test';

test.use({
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_7_16 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6.2 Mobile/15E148 Safari/604.1',
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  launchOptions: {
    args: ['--use-angle=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'],
  },
});

test.describe('StreetVerse iPhone visual evidence', () => {
  test('Circle Park controls and driving are visibly rendered in the 3D iPhone path', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, get: () => 8 });
        Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => 8 });
      } catch {}
    });

    await page.goto('/streetverse', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await expect(page.locator('#root')).toBeAttached();
    await expect(page.locator('#root')).not.toBeEmpty();

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 25_000 });

    const joystick = page.getByLabel('StreetVerse always visible joystick');
    await expect(joystick).toBeVisible({ timeout: 20_000 });

    const drive = page.getByRole('button', { name: 'Drive nearest StreetVerse vehicle' });
    await expect(drive).toBeVisible({ timeout: 20_000 });

    const canvasBox = await canvas.boundingBox();
    expect(canvasBox?.width || 0).toBeGreaterThan(250);
    expect(canvasBox?.height || 0).toBeGreaterThan(250);

    const toolsButton = page.getByRole('button', { name: '☰ TOOLS' });
    await expect(toolsButton).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read Ethiopian Bible' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open Chicago Time Machine' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open Holographic LIVE from StreetVerse' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open Holographic PK Battle from StreetVerse' })).toHaveCount(0);

    type Rect={x:number;y:number;width:number;height:number};
    const shellButtons = page.locator('[data-streetverse-mobile-shell] button:visible');
    expect(await shellButtons.count()).toBeLessThanOrEqual(12);
    const boxes:Rect[]=[];
    for(let i=0;i<await shellButtons.count();i++){
      const box=await shellButtons.nth(i).boundingBox();
      if(box)boxes.push(box);
    }
    const joystickBox=await joystick.boundingBox();
    if(joystickBox)boxes.push(joystickBox);

    const viewportArea = 390 * 844;
    const summedControlArea = boxes.reduce((sum, box) => sum + box.width * box.height, 0);
    expect(summedControlArea / viewportArea).toBeLessThan(0.24);

    const overlaps = (a:Rect,b:Rect) =>
      Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)) *
      Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
      expect(overlaps(boxes[i],boxes[j])).toBeLessThan(120);
    }

    await toolsButton.click();
    const toolsDrawer = page.getByRole('dialog', { name: 'StreetVerse tools drawer' });
    await expect(toolsDrawer).toBeVisible();
    await expect(page.getByRole('button', { name: 'Read Ethiopian Bible' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Open Chicago Time Machine' })).toBeVisible();
    const drawerBox = await toolsDrawer.boundingBox();
    expect((drawerBox?.width || 0)).toBeLessThanOrEqual(370);
    expect((drawerBox?.height || 0)).toBeLessThan(410);
    await page.getByRole('button', { name: 'Close StreetVerse tools' }).click();
    await expect(toolsDrawer).toHaveCount(0);

    await page.waitForTimeout(2500);
    await page.screenshot({
      path: testInfo.outputPath('streetverse-circle-park-iphone-on-foot.png'),
      fullPage: true,
    });

    await joystick.screenshot({
      path: testInfo.outputPath('streetverse-visible-joystick.png'),
    });

    await drive.click();
    const driving = page.getByRole('button', { name: 'Driving active' });
    await expect(driving).toBeVisible({ timeout: 8_000 });

    await page.waitForTimeout(1200);
    await page.screenshot({
      path: testInfo.outputPath('streetverse-circle-park-iphone-driving.png'),
      fullPage: true,
    });

    await canvas.screenshot({
      path: testInfo.outputPath('streetverse-world-canvas-driving.png'),
    });
  });
});
