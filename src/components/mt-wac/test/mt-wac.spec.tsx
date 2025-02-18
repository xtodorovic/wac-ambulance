import { newSpecPage } from '@stencil/core/testing';
import { MtWac } from '../mt-wac';

describe('mt-wac', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MtWac],
      html: `<mt-wac></mt-wac>`,
    });
    const wlList = page.rootInstance as MtWac;
    const expectedPatients = wlList?.waitingPatients?.length

    const items = page.root.shadowRoot.querySelectorAll("md-list-item");
    expect(items.length).toEqual(expectedPatients);
  });
});
