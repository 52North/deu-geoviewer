import { NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import {
  Collection,
  CollectionResponse,
} from '../../services/OGCFeatures.service';

@Component({
  selector: 'app-collection',
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf],
})
export class CollectionComponent {
  @Input() collectionResponse: CollectionResponse | undefined;
  @Input() selectedCollection!: Signal<Collection | undefined>;
  @Output() collectionSelected = new EventEmitter<Collection>();

  selectCollection(collection: Collection): void {
    this.collectionSelected.emit(collection);
  }
}
