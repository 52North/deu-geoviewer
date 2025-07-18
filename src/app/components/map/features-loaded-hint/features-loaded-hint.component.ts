import { Component, inject } from '@angular/core';
import { OGCFeatureMapHandler } from '../maphandler/ogc-feature-handler';

@Component({
  selector: 'app-features-loaded-hint',
  templateUrl: './features-loaded-hint.component.html',
  styleUrls: ['./features-loaded-hint.component.scss'],
})
export class FeaturesLoadedHintComponent {
  private handler = inject(OGCFeatureMapHandler);

  loadingFeatures = this.handler.loadingFeatures;
  featureResults = this.handler.featureResults;

  loadMore() {
    this.handler.loadAdditionalFeatures();
  }
}
