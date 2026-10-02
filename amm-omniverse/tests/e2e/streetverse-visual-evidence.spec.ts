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

test.describe('StreetVerse compact iPhone visual evidence', () => {
  test('Circle Park renders with one compact mobile control layer', async ({ page }, testInfo) => {
    await page.addInitScript(() => {
      try {
        Object.defineProperty(navigator, 'hardwareConcurrency', { configurable: true, get: () => 8 });
        Object.defineProperty(navigator, 'deviceMemory', { configurable: true, get: () => 8 });
        localStorage.setItem('tryamm:streetverse-control-mode','one-hand');
      } catch {}
    });

    await page.goto('/streetverse', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    await expect(page.locator('#root')).toBeAttached();
    await expect(page.locator('#root')).not.toBeEmpty();

    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 25_000 });
    const canvasBox = await canvas.boundingBox();
    expect(canvasBox?.width || 0).toBeGreaterThan(250);
    expect(canvasBox?.height || 0).toBeGreaterThan(250);

    const joystick = page.getByLabel('StreetVerse analog joystick');
    await expect(joystick).toBeVisible({ timeout: 20_000 });

    const quickMenu = page.getByRole('button', { name: 'Open StreetVerse quick menu' });
    await expect(quickMenu).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Open Holo FON' })).toBeVisible({ timeout: 20_000 });

    // Retired shell/proof controls must not cover the actual 3D world.
    await expect(page.locator('[data-streetverse-mobile-shell]')).toHaveCount(0);
    await expect(page.getByLabel('StreetVerse always visible joystick')).toHaveCount(0);
    await expect(page.getByRole('button', { name: '☰ TOOLS' })).toHaveCount(0);
    await expect(page.getByText('IPHONE FIRST JOURNEY', { exact: true })).toHaveCount(0);
    await expect(page.getByText('FAME • UNKNOWN', { exact: false })).toHaveCount(0);

    const mission = page.getByRole('button', { name: /Start or focus mission/i });
    await expect(mission).toBeVisible({ timeout: 20_000 });

    type Rect={x:number;y:number;width:number;height:number};
    const travel=page.getByRole('button',{name:'Travel to Taylor Street UIC Medical District'});
    const stores=page.locator('#sv-retail-open');
    const enterStore=page.locator('#sv-store-open');
    await expect(travel).toBeVisible();
    await expect(stores).toBeVisible();
    await expect(enterStore).toBeVisible();
    const visibleCore=[joystick,quickMenu,page.getByRole('button',{name:'Open Holo FON'}),mission,travel,stores,enterStore];
    const boxes:Rect[]=[];
    for(const locator of visibleCore){
      const box=await locator.boundingBox();
      if(box)boxes.push(box);
    }
    const viewportArea=390*844;
    const summedControlArea=boxes.reduce((sum,box)=>sum+box.width*box.height,0);
    expect(summedControlArea/viewportArea).toBeLessThan(0.25);

    const overlaps=(a:Rect,b:Rect)=>
      Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x))*
      Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));
    for(let i=0;i<boxes.length;i++)for(let j=i+1;j<boxes.length;j++){
      expect(overlaps(boxes[i],boxes[j])).toBeLessThan(1);
    }

    await page.waitForTimeout(2200);
    await page.screenshot({
      path:testInfo.outputPath('streetverse-circle-park-compact-iphone.png'),
      fullPage:true,
    });
    await joystick.screenshot({
      path:testInfo.outputPath('streetverse-single-analog-joystick.png'),
    });

    await quickMenu.click();
    const menu=page.getByRole('menu',{name:'StreetVerse quick navigation'});
    await expect(menu).toBeVisible();
    await expect(page.getByRole('menuitem',{name:/FAITHVERSE/})).toBeVisible();
    await expect(page.getByRole('menuitem',{name:/RIDE SHARE/})).toBeVisible();
    await expect(page.getByRole('menuitem',{name:/POCKET DIMENSION/})).toBeVisible();
    await expect(page.getByRole('menuitem',{name:/LEFT HAND/})).toBeVisible();

    const menuBox=await menu.boundingBox();
    expect(menuBox?.width||0).toBeLessThanOrEqual(210);
    expect(menuBox?.height||0).toBeLessThan(620);

    await page.screenshot({
      path:testInfo.outputPath('streetverse-compact-quick-menu.png'),
      fullPage:true,
    });

    await quickMenu.click();
    // Switching hands must mirror the external shop launchers away from the joystick.
    await quickMenu.click();
    await page.getByRole('menuitem',{name:/RIGHT HAND/}).click();
    await expect(page.locator('[data-streetverse-world-root]')).toHaveAttribute('data-control-side','right');
    const rightJoystick=await joystick.boundingBox();
    for(const launcher of [stores,enterStore]){
      const box=await launcher.boundingBox();
      expect(box).not.toBeNull();
      expect(rightJoystick).not.toBeNull();
      expect(overlaps(box!,rightJoystick!)).toBe(0);
    }
    await quickMenu.click();
    await page.getByRole('menuitem',{name:/LEFT HAND/}).click();
    const socialShortcut=page.getByRole('button',{name:'Open StreetVerse social panel'});
    const peopleShortcut=page.getByRole('button',{name:'Open StreetVerse people search'});
    const ticketShortcut=page.getByRole('button',{name:'Open StreetVerse stream tickets'});
    await expect(socialShortcut).toBeVisible();
    await expect(peopleShortcut).toBeVisible();
    await expect(ticketShortcut).toBeVisible();

    await socialShortcut.click();
    const socialPanel=page.getByRole('region',{name:'StreetVerse social panel'});
    await expect(socialPanel).toBeVisible();
    const socialBox=await socialPanel.boundingBox();
    expect(socialBox?.width||0).toBeLessThanOrEqual(374);
    expect(socialBox?.height||0).toBeLessThanOrEqual(390);
    expect((socialBox?.y||0)+(socialBox?.height||0)).toBeLessThanOrEqual(844);
    await page.screenshot({path:testInfo.outputPath('streetverse-social-panel-iphone.png'),fullPage:true});
    await page.getByRole('button',{name:'Close StreetVerse panel'}).click();

    await peopleShortcut.click();
    await expect(page.getByRole('region',{name:'StreetVerse people search panel'})).toBeVisible();
    await expect(page.getByRole('textbox',{name:'Search StreetVerse users and groups'})).toBeVisible();
    await page.getByRole('button',{name:'Close StreetVerse panel'}).click();

    await ticketShortcut.click();
    await expect(page.getByRole('region',{name:'StreetVerse stream ticket center'})).toBeVisible();
    await expect(page.getByText('No authoritative ticket records loaded. The panel will not invent approvals or access.')).toBeVisible();
    await page.screenshot({path:testInfo.outputPath('streetverse-ticket-panel-iphone.png'),fullPage:true});
  });
});
