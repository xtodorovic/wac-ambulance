import { newE2EPage } from '@stencil/core/testing';

describe('mt-wac', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<mt-wac></mt-wac>');

    const element = await page.find('mt-wac');
    expect(element).toHaveClass('hydrated');
  });
});
