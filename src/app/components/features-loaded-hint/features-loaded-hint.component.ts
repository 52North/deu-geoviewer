import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Signal,
  computed,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Collection } from '../../services/OGCFeatures.service';
import { FeatureResult } from '../map/maphandler/ogc-feature-handler';

@Component({
  selector: 'app-features-loaded-hint',
  templateUrl: './features-loaded-hint.component.html',
  styleUrls: ['./features-loaded-hint.component.scss'],
  standalone: true,
  imports: [NgIf, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeaturesLoadedHintComponent {
  @Input() loadingFeatures!: Signal<boolean>;
  @Input() featureResults!: Signal<FeatureResult | undefined>;
  @Input() selectedCollection!: Signal<Collection | undefined>;
  @Input() loadAdditionalFeatures!: () => void;

  hasMoreFeatures = computed(() => {
    const results = this.featureResults?.();
    return !!results && results.displayedCount < results.completeCount;
  });
}
