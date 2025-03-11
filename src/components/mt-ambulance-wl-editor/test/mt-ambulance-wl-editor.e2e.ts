import { newE2EPage } from '@stencil/core/testing';

describe('mt-ambulance-wl-editor', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mt-ambulance-wl-editor></mt-ambulance-wl-editor>');

    const element = await page.find('mt-ambulance-wl-editor');
    expect(element).toHaveClass('hydrated');
  });
});
