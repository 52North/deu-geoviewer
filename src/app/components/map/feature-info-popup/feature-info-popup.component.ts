import { Component, input } from '@angular/core';

import { KeyValuePair } from '../../../model';

@Component({
  selector: 'app-feature-info-popup',
  templateUrl: './feature-info-popup.component.html',
  styleUrls: ['./feature-info-popup.component.scss'],
  imports: [],
})
export class FeatureInfoPopupComponent {
  readonly title = input('');

  readonly properties = input<KeyValuePair[]>([]);
}
