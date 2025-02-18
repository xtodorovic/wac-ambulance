import { newSpecPage } from '@stencil/core/testing';
import { MtWac } from '../mt-wac';

describe('mt-wac', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MtWac],
      html: `<mt-wac></mt-wac>`,
    });
    expect(page.root).toEqualHtml(`
      <mt-wac>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </mt-wac>
    `);
  });
});
