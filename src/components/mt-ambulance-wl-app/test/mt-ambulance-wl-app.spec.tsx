import { newSpecPage } from '@stencil/core/testing';
import { MtAmbulanceWlApp } from '../mt-ambulance-wl-app';

describe('mt-ambulance-wl-app', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [MtAmbulanceWlApp],
      html: `<mt-ambulance-wl-app></mt-ambulance-wl-app>`,
    });
    page.win.navigation = new EventTarget()
    const child = await page.root.shadowRoot.firstElementChild;
    expect(child.tagName.toLocaleLowerCase()).toEqual ("mt-ambulance-wl-editor");

    it('renders list', async () => {
      const page = await newSpecPage({
        url: `http://localhost/ambulance-wl/`,
        components: [MtAmbulanceWlApp],
        html: `<mt-ambulance-wl-app base-path="/ambulance-wl/"></mt-ambulance-wl-app>`,
      });
      page.win.navigation = new EventTarget()
      const child = await page.root.shadowRoot.firstElementChild;
      expect(child.tagName.toLocaleLowerCase()).toEqual("mt-wac");
    });
  });
});
