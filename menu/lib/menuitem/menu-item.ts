/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {ListItem} from '@material/web/list/lib/listitem/list-item';
import {ARIARole} from '@material/web/types/aria';

/** Base class for menu item component. */
export class MenuItem extends ListItem {
  override role: ARIARole = 'menuitem';
}
