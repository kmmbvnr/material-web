/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {MDCChipActionType} from './constants';
import {MDCChipActionFoundation} from './foundation';

/**
 * MDCChipTrailingActionFoundation provides the business logic for the trailing
 * chip action.
 */
export class MDCChipTrailingActionFoundation extends MDCChipActionFoundation {
  isSelectable() {
    return false;
  }

  actionType() {
    return MDCChipActionType.TRAILING;
  }

  protected shouldEmitInteractionOnRemoveKey() {
    return true;
  }
}
