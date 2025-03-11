import { newE2EPage } from '@stencil/core/testing';

describe('mt-ambulance-wl-app', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mt-ambulance-wl-app></mt-ambulance-wl-app>');

    const element = await page.find('mt-ambulance-wl-app');
    expect(element).toHaveClass('hydrated');
  });
});
