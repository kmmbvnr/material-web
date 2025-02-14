/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ReactiveElement} from 'lit';

/**
 * A property decorator that helps proxy an aria attribute to an internal node.
 *
 * This decorator is only intended for use with ARIAMixin properties,
 * such as `ariaLabel`, to help with screen readers.
 *
 * This decorator will remove the host `aria-*` attribute at runtime and add it
 * to a `data-aria-*` attribute to avoid screenreader conflicts between the
 * host and internal node.
 *
 * `@ariaProperty` decorated properties should sync with LitElement to the
 * `data-aria-*` attribute, not the native `aria-*` attribute.
 *
 * @example
 * ```ts
 * class MyElement extends LitElement {
 *   \@ariaProperty
 *   // TODO(b/210730484): replace with @soyParam annotation
 *   \@property({ type: String, attribute: 'data-aria-label', noAccessor: true})
 *   ariaLabel!: string;
 * }
 * ```
 * @category Decorator
 * @ExportDecoratedItems
 */
export function ariaProperty<E extends ReactiveElement, K extends keyof E&
                             (`aria${string}` | 'role')>(
    prototype: E, property: K) {
  // Replace the ARIAMixin property with data-* attribute syncing instead of
  // using the native aria-* attribute reflection. This preserves the attribute
  // for SSR and avoids screenreader conflicts after delegating the attribute
  // to a child node.
  Object.defineProperty(prototype, property, {
    configurable: true,
    enumerable: true,
    get(this: ReactiveElement) {
      return this.dataset[property] ?? '';
    },
    set(this: ReactiveElement, value: unknown) {
      // Coerce non-string values to a string
      const strValue = String(value ?? '');
      const oldValue = this.dataset[property];
      if (strValue === oldValue) {
        return;
      }

      if (strValue) {
        this.dataset[property] = strValue;
      } else {
        delete this.dataset[property];
      }

      this.requestUpdate(property, oldValue);
    }
  });

  // Define an internal property that syncs from the `aria-*` attribute with lit
  // and delegates to the real ARIAMixin property, which renders an update.
  // This property will immediately remove the `aria-*` attribute, which doesn't
  // work well with SSR (which is why there's a separate synced property).
  const internalAriaProperty = Symbol(property);
  // "ariaLabel" -> "aria-label" / "ariaLabelledBy" -> "aria-labelledby"
  const ariaAttribute = property.replace('aria', 'aria-').toLowerCase();
  const constructor = (prototype.constructor as typeof ReactiveElement);
  let removingAttribute = false;
  Object.defineProperty(prototype, internalAriaProperty, {
    get(this: ReactiveElement) {
      // tslint is failing here, but the types are correct (ARIAMixin
      // properties do not obfuscate with closure)
      // tslint:disable-next-line:no-dict-access-on-struct-type
      return (this as E)[property];
    },
    set(this: ReactiveElement, value: E[K]) {
      if (removingAttribute) {
        // Ignore this update, which is triggered below
        return;
      }

      // Set the ARIAMixin property, which will sync the `data-*` attribute
      // and trigger rendering if the value changed.
      // tslint is failing here, but the types are correct (ARIAMixin
      // properties do not obfuscate with closure)
      // tslint:disable-next-line:no-dict-access-on-struct-type
      (this as E)[property] = value;
      // Remove the `aria-*` attribute, which will call this setter again with
      // the incorrect value. Ignore these updates.
      removingAttribute = true;
      this.removeAttribute(ariaAttribute);
      removingAttribute = false;
    }
  });

  // Tell lit to observe the `aria-*` attribute and set the internal property,
  // which acts as a "aria-* attribute changed" observer.
  constructor.createProperty(internalAriaProperty, {
    attribute: ariaAttribute,
    noAccessor: true,
  });
}
