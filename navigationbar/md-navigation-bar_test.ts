/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {doesElementContainFocus} from '@material/web/compat/base/utils';
import {fixture, rafPromise, TestFixture} from '@material/web/compat/testing/helpers';
import {NavigationTabHarness} from '@material/web/navigationtab/harness';
import {MdNavigationTab} from '@material/web/navigationtab/navigation-tab';
import {html} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {MdNavigationBar} from './navigation-bar';

@customElement('md-test-navigation-bar')
class TestMdNavigationBar extends MdNavigationBar {
}
@customElement('md-test-navigation-bar-tab')
class TestMdNavigationTab extends MdNavigationTab {
}

declare global {
  interface HTMLElementTagNameMap {
    'md-test-navigation-bar': TestMdNavigationBar;
    'md-test-navigation-bar-tab': TestMdNavigationTab;
  }
}

interface NavigationBarProps {
  activeIndex: number;
  hideInactiveLabels: boolean;
  ariaLabel?: string;
}

const navBarWithNavTabsElement = (propsInit: Partial<NavigationBarProps>) => {
  return html`
      <md-test-navigation-bar
          .activeIndex="${propsInit.activeIndex ?? 0}"
          .hideInactiveLabels="${propsInit.hideInactiveLabels === true}"
          aria-label="${ifDefined(propsInit.ariaLabel)}">
        <md-test-navigation-bar-tab label="One"></md-test-navigation-bar-tab>
        <md-test-navigation-bar-tab label="Two"></md-test-navigation-bar-tab>
      </md-test-navigation-bar>
  `;
};

// The following is a Navbar with the tabs being out of sync with the bar.
const navBarWithIncorrectTabsElement = html`
    <md-test-navigation-bar activeIndex="0">
      <md-test-navigation-bar-tab label="One" hideInactiveLabel></md-test-navigation-bar-tab>
      <md-test-navigation-bar-tab label="One" active></md-test-navigation-bar-tab>
    </md-test-navigation-bar>`;

describe('md-navigation-bar', () => {
  let fixt: TestFixture;
  let element: MdNavigationBar;

  afterEach(() => {
    fixt.remove();
  });

  describe('basic', () => {
    beforeEach(async () => {
      fixt = await fixture(html`
        <md-test-navigation-bar>
          <md-test-navigation-bar-tab label="One"></md-test-navigation-bar-tab>
        </md-test-navigation-bar>`);
      element = fixt.root.querySelector('md-test-navigation-bar')!;
      await element.updateComplete;
    });

    it('initializes as a md-navigation-bar', () => {
      const navBarBase =
          element.shadowRoot!.querySelector('.md3-navigation-bar')!;
      expect(element).toBeInstanceOf(MdNavigationBar);
      expect(element.activeIndex).toEqual(0);
      expect(element.hideInactiveLabels).toBeFalse();
      expect(navBarBase.getAttribute('aria-label')).toEqual(null);
    });
  });

  describe('activeIndex', () => {
    beforeEach(async () => {
      fixt = await fixture(navBarWithNavTabsElement({activeIndex: 1}));
      element = fixt.root.querySelector('md-test-navigation-bar')!;
      await element.updateComplete;
    });

    it('on change emits activated event', async () => {
      const activatedHandler = jasmine.createSpy();
      element.addEventListener('navigation-bar-activated', activatedHandler);
      element.activeIndex = 0;
      await rafPromise();
      expect(activatedHandler).toHaveBeenCalled();
    });

    it('activated event detail contains the tab and activeIndex', async () => {
      const navigationBarActivatedSpy =
          jasmine.createSpy('navigationBarActivated');
      element.addEventListener(
          'navigation-bar-activated', navigationBarActivatedSpy);

      const tab = element.tabs[0];
      element.activeIndex = 0;

      await rafPromise();
      expect(navigationBarActivatedSpy)
          .toHaveBeenCalledWith(jasmine.any(CustomEvent));
      expect(navigationBarActivatedSpy)
          .toHaveBeenCalledWith(jasmine.objectContaining({
            detail: jasmine.objectContaining({tab, activeIndex: 0}),
          }));
    });

    it('#handleNavigationTabInteraction () updates on navigation tab click',
       async () => {
         const tab1Harness = new NavigationTabHarness(element.tabs[0]);
         const tab2Harness = new NavigationTabHarness(element.tabs[1]);

         await tab1Harness.clickWithMouse();
         expect(element.activeIndex).toEqual(0);
         await tab2Harness.clickWithMouse();
         expect(element.activeIndex).toEqual(1);
       });

    it('#onActiveIndexChange() sets tab at activeIndex to active', async () => {
      const tab = element.tabs[0];
      expect(tab.active).toBeFalse();
      element.activeIndex = 0;
      element.requestUpdate();
      await element.updateComplete;
      expect(tab.active).toBeTrue();
    });

    it('#onActiveIndexChange() sets previously active tab to inactive',
       async () => {
         const tab = element.tabs[1];
         expect(tab.active).toBeTrue();
         element.activeIndex = 0;
         element.requestUpdate();
         await element.updateComplete;
         expect(tab.active).toBeFalse();
       });
  });

  describe('hideInactiveLabels', () => {
    beforeEach(async () => {
      fixt =
          await fixture(navBarWithNavTabsElement({hideInactiveLabels: true}));
      element = fixt.root.querySelector('md-test-navigation-bar')!;
      await element.updateComplete;
    });

    it('#onHideInactiveLabelsChange() affects navigation tabs hideInactiveLabel state',
       async () => {
         const tab1 = element.tabs[0];
         const tab2 = element.tabs[1];
         expect(tab1.hideInactiveLabel).toBeTrue();
         expect(tab2.hideInactiveLabel).toBeTrue();
         element.hideInactiveLabels = false;
         element.requestUpdate();
         await element.updateComplete;
         expect(tab1.hideInactiveLabel).toBeFalse();
         expect(tab2.hideInactiveLabel).toBeFalse();
       });
  });

  describe('aria-label', () => {
    beforeEach(async () => {
      fixt = await fixture(navBarWithNavTabsElement({ariaLabel: 'foo'}));
      element = fixt.root.querySelector('md-test-navigation-bar')!;
      await element.updateComplete;
    });

    it('sets the root aria-label property', () => {
      const navBarBase =
          element.shadowRoot!.querySelector('.md3-navigation-bar')!;
      expect(navBarBase.getAttribute('aria-label')).toEqual('foo');
    });
  });

  describe('#onTabsChange()', () => {
    beforeEach(async () => {
      // navBarWithIncorrectTabsElement contains tabs with states that don't
      // match the bar. Below we test after updateComplete, everything is
      // in sync.
      fixt = await fixture(navBarWithIncorrectTabsElement);
      element = fixt.root.querySelector('md-test-navigation-bar')!;
      await element.updateComplete;
    });

    it('syncs tabs\' hideInactiveLabel state with the navigation bar\'s ' +
           'hideInactiveLabels state',
       () => {
         const tab1 = element.tabs[0];
         const tab2 = element.tabs[1];
         expect(element.hideInactiveLabels).toBeFalse();
         expect(tab1.hideInactiveLabel).toBeFalse();
         expect(tab2.hideInactiveLabel).toBeFalse();
       });

    it('syncs tabs\' active state with the navigation bar\'s activeIndex state',
       () => {
         const tab1 = element.tabs[0];
         const tab2 = element.tabs[1];
         expect(element.activeIndex).toBe(0);
         expect(tab1.active).toBeTrue();
         expect(tab2.active).toBeFalse();
       });
  });

  describe('#handleKeydown', () => {
    let bar: HTMLElement;
    let tab1: HTMLElement;
    let tab2: HTMLElement;

    beforeEach(async () => {
      fixt = await fixture(navBarWithNavTabsElement({activeIndex: 0}));
      element = fixt.root.querySelector('md-test-navigation-bar')!;
      await element.updateComplete;
      bar = element.shadowRoot!.querySelector('.md3-navigation-bar')!;
      tab1 = element.children[0] as HTMLElement;
      tab2 = element.children[1] as HTMLElement;
    });

    it('(Enter) activates the focused tab', async () => {
      const eventRight =
          new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true});
      const eventEnter =
          new KeyboardEvent('keydown', {key: 'Enter', bubbles: true});
      tab1.focus();
      expect(element.activeIndex).toBe(0);
      bar.dispatchEvent(eventRight);
      bar.dispatchEvent(eventEnter);
      element.requestUpdate();
      await element.updateComplete;
      expect(element.activeIndex).toBe(1);
    });

    it('(Spacebar) activates the focused tab', async () => {
      const eventRight =
          new KeyboardEvent('keydown', {key: 'ArrowRight', bubbles: true});
      const eventSpacebar =
          new KeyboardEvent('keydown', {key: 'Spacebar', bubbles: true});
      tab1.focus();
      expect(element.activeIndex).toBe(0);
      bar.dispatchEvent(eventRight);
      bar.dispatchEvent(eventSpacebar);
      element.requestUpdate();
      await element.updateComplete;
      expect(element.activeIndex).toBe(1);
    });

    it('(Home) sets focus on the first tab', () => {
      const event = new KeyboardEvent('keydown', {key: 'Home', bubbles: true});
      tab2.focus();
      expect(doesElementContainFocus(tab1)).toBeFalse();
      bar.dispatchEvent(event);
      expect(doesElementContainFocus(tab1)).toBeTrue();
    });

    it('(End) sets focus on the last tab', () => {
      const event = new KeyboardEvent('keydown', {key: 'End', bubbles: true});
      bar.dispatchEvent(event);
      expect(doesElementContainFocus(tab2)).toBeTrue();
    });

    describe('(ArrowLeft)', () => {
      // Use the same key for all tests
      const key = 'ArrowLeft';

      it(`sets focus on previous tab`, () => {
        const event = new KeyboardEvent('keydown', {key, bubbles: true});
        tab2.focus();
        bar.dispatchEvent(event);
        expect(doesElementContainFocus(tab1)).toBeTrue();
      });

      it(`sets focus to last tab when focus is on the first tab`, () => {
        const event = new KeyboardEvent('keydown', {key, bubbles: true});
        tab1.focus();
        bar.dispatchEvent(event);
        expect(doesElementContainFocus(tab2)).toBeTrue();
      });

      it(`sets focus on next tab in RTL`, () => {
        document.body.style.direction = 'rtl';
        const event = new KeyboardEvent('keydown', {key, bubbles: true});
        tab1.focus();
        bar.dispatchEvent(event);
        expect(doesElementContainFocus(tab2)).toBeTrue();
      });
    });

    describe('(ArrowRight)', () => {
      // Use the same key for all tests
      const key = 'ArrowRight';

      it(`sets focus on next tab`, () => {
        const event = new KeyboardEvent('keydown', {key, bubbles: true});
        tab1.focus();
        bar.dispatchEvent(event);
        expect(doesElementContainFocus(tab2)).toBeTrue();
      });

      it(`sets focus to first tab when focus is on the last tab`, () => {
        const event = new KeyboardEvent('keydown', {key, bubbles: true});
        tab2.focus();
        bar.dispatchEvent(event);
        expect(doesElementContainFocus(tab1)).toBeTrue();
      });

      it(`sets focus on previous tab in RTL`, () => {
        document.body.style.direction = 'rtl';
        const event = new KeyboardEvent('keydown', {key, bubbles: true});
        tab2.focus();
        bar.dispatchEvent(event);
        expect(doesElementContainFocus(tab1)).toBeTrue();
      });
    });
  });
});
