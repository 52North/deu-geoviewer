import { Component, Input, OnInit } from '@angular/core';

import { KeyValuePair } from '../model';

@Component({
  selector: 'app-feature-info-popup',
  templateUrl: './feature-info-popup.component.html',
  styleUrls: ['./feature-info-popup.component.scss']
})
export class FeatureInfoPopupComponent implements OnInit {

  @Input() title: string = '';

  @Input() properties: KeyValuePair[] = [];

  constructor() { }

  ngOnInit(): void {
  }

}
