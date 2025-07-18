import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import {
  Collection,
  CollectionResponse,
} from '../../../services/OGCFeatures.service';
import { OGCFeatureMapHandler } from '../maphandler/ogc-feature-handler';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  imports: [NgClass],
  standalone: true,
})
export class CollectionComponent {
  collectionResponse: CollectionResponse | undefined;
  private handler = inject(OGCFeatureMapHandler);

  selectedCollection = this.handler.selectedCollection;

  selectCollection(collection: Collection) {
    this.handler.loadCollection(collection);
  }
}
