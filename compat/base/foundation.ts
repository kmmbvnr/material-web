/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export class MDCFoundation<AdapterType extends {} = {}> {
  static get.css.jsClasses(): {[key: string]: string} {
    // Classes extending MDCFoundation should implement this method to return an
    // object which exports every CSS class the foundation class needs as a
    // property. e.g. {ACTIVE: 'mdc-component--active'}
    return {};
  }

  static get strings(): {[key: string]: string} {
    // Classes extending MDCFoundation should implement this method to return an
    // object which exports all semantic strings as constants. e.g. {ARIA_ROLE:
    // 'tablist'}
    return {};
  }

  static get numbers(): {[key: string]: number} {
    // Classes extending MDCFoundation should implement this method to return an
    // object which exports all of its semantic numbers as constants.
    // e.g. {ANIMATION_DELAY_MS: 350}
    return {};
  }

  static get defaultAdapter(): {} {
    // Classes extending MDCFoundation may choose to implement this getter in
    // order to provide a convenient way of viewing the necessary methods of an
    // adapter. In the future, this could also be used for adapter validation.
    return {};
  }

  constructor(protected adapter: AdapterType = {} as AdapterType) {}

  init() {
    // Subclasses should override this method to perform initialization routines
    // (registering events, etc.)
  }

  destroy() {
    // Subclasses should override this method to perform de-initialization
    // routines (de-registering events, etc.)
  }
}

/**
 * The constructor for MDCFoundation.
 */
export interface MDCFoundationConstructor<AdapterType extends object = any> {
  new(adapter: AdapterType): MDCFoundation<AdapterType>;
  readonly prototype: MDCFoundation<AdapterType>;
}

/**
 * The deprecated constructor for MDCFoundation.
 */
export interface MDCFoundationDeprecatedConstructor<
    AdapterType extends object = any> {
  readonly.css.jsClasses: Record<string, string>;
  readonly strings: Record<string, string>;
  readonly numbers: Record<string, number>;
  readonly defaultAdapter: AdapterType;

  new(adapter?: Partial<AdapterType>): MDCFoundation<AdapterType>;
  readonly prototype: MDCFoundation<AdapterType>;
}

/**
 * Retrieves the AdapaterType from the provided MDCFoundation generic type.
 */
export type MDCFoundationAdapter<T> =
    T extends MDCFoundation<infer A>? A : never;

// tslint:disable-next-line:no-default-export Needed for backward compatibility with MDC Web v0.44.0 and earlier.
export default MDCFoundation;
