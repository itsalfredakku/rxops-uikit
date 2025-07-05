import { test, expect } from '@playwright/test';

test('Capture current UI state', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(2000);
  
  // Take a full page screenshot
  await expect(page).toHaveScreenshot('current-ui-overview.png', {
    fullPage: true,
    animations: 'disabled'
  });
  
  // Navigate to patient profile
  await page.click('text=Patient Profile');
  await page.waitForTimeout(1000);
  
  await expect(page).toHaveScreenshot('patient-profile-view.png', {
    fullPage: true,
    animations: 'disabled'
  });
  
  // Navigate to calendar
  await page.click('text=Calendar');
  await page.waitForTimeout(1000);
  
  await expect(page).toHaveScreenshot('calendar-view.png', {
    fullPage: true,
    animations: 'disabled'
  });
});
