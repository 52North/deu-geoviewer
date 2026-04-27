import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectedPosition,
} from '@angular/cdk/overlay';

import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { API_URL, DEPLOY_URL } from '../../../main';
import { LanguageLabelComponent } from '../language-label/language-label.component';
import { LangTitle } from './../../model';

interface Entry {
  '@language': string;
  '@value': string;
}

interface DeuDataset {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  '@context': any;
  '@id'?: string;
  '@graph': {
    '@id': string;
    '@type'?: string;
    title: (Entry | string)[];
    publisher?: string;
    name?: string;
    'dct:title'?: (Entry | string)[];
    'dct:publisher'?: string;
    'dct:name'?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }[];
}

const CATALOG_ID_PARAM = 'catalog';
const DATASET_ID_PARAM = 'dataset';
const DISTRIBUTION_ID_PARAM = 'distribution';

@Component({
  selector: 'app-info-overlay',
  templateUrl: './info-overlay.component.html',
  styleUrls: ['./info-overlay.component.scss'],
  imports: [CdkOverlayOrigin, CdkConnectedOverlay, LanguageLabelComponent],
})
export class InfoOverlayComponent implements OnInit {
  private http = inject(HttpClient);
  private translate = inject(TranslateService);
  private apiUrl = inject<string>(API_URL);
  private deployUrl = inject<string>(DEPLOY_URL);
  private route = inject(ActivatedRoute);

  distributionTitle: LangTitle[] | undefined;
  catalogTitle: LangTitle[] | undefined;
  publisherTitle: LangTitle[] | undefined;

  datasetId: string | undefined;
  catalogId: string | undefined;

  isOpen = false;

  position: ConnectedPosition[] = [
    {
      overlayX: 'start',
      overlayY: 'top',
      originX: 'start',
      originY: 'top',
    },
  ];

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    if (params[CATALOG_ID_PARAM]) {
      this.loadCatalog(params[CATALOG_ID_PARAM]);
    }
    if (params[DATASET_ID_PARAM] && params[DISTRIBUTION_ID_PARAM]) {
      this.loadDataset(params[DATASET_ID_PARAM], params[DISTRIBUTION_ID_PARAM]);
    }
  }

  private loadDataset(datasetId: string, distributionId: string) {
    this.datasetId = datasetId;
    this.http
      .get<DeuDataset>(
        `${this.apiUrl}datasets/${datasetId}.jsonld?useNormalizedId=true`
      )
      .subscribe(res => {
        this.tryToGetPublisher(res, datasetId);
        const match = res['@graph'].find(
          e => e['@id'].indexOf(distributionId) >= 0
        );
        const titles = match?.title || match?.['dct:title'];
        if (titles) {
          this.distributionTitle = this.getLanguageList(titles);
        }
        this.isOpen = true;
      });
  }

  private tryToGetPublisher(res: DeuDataset, datasetId: string) {
    const match = res['@graph'].find(e => e['@id'].indexOf(datasetId) >= 0);
    const titles = match?.title || match?.['dct:title'];
    if (titles) {
      this.publisherTitle = this.getLanguageList(titles);
    }
  }

  private loadCatalog(catalogId: string) {
    this.catalogId = catalogId;
    this.http
      .get<DeuDataset>(`${this.apiUrl}catalogues/${catalogId}.jsonld`)
      .subscribe(res => {
        // first option to find catalog title
        const match = res['@graph'].find(e =>
          e['@type'] ? e['@type']?.indexOf('dcat:Catalog') >= 0 : false
        );
        const titles = match?.title || match?.['dct:title'];
        if (titles) {
          this.catalogTitle = this.getLanguageList(titles);
          return;
        }
        // second option to find catalog title
        const id = res['@id'];
        if (id) {
          const entry = res['@graph'].find(e => e['@id'] === id);
          if (entry && entry['http://purl.org/dc/terms/title']) {
            this.catalogTitle = this.getLanguageList(
              entry['http://purl.org/dc/terms/title']
            );
          }
        }
      });
  }

  private getLanguageList(titles: (string | Entry)[] | Entry): LangTitle[] {
    if (titles instanceof Array) {
      const match: Entry = titles.find(e => !(e instanceof String)) as Entry;
      if (match['@language']) {
        return filterUndefined(
          titles.map(e => {
            if (typeof e === 'string') {
              return { code: match['@language'].substring(5, 7), title: e };
            }
            if (
              typeof e === 'object' &&
              Object.prototype.hasOwnProperty.call(e, '@language') &&
              Object.prototype.hasOwnProperty.call(e, '@value')
            ) {
              return {
                code: e['@language'].substring(0, 2),
                title: e['@value'],
              };
            }
            return undefined;
          })
        );
      }
    }
    if (
      titles instanceof Object &&
      Object.prototype.hasOwnProperty.call(titles, '@language') &&
      Object.prototype.hasOwnProperty.call(titles, '@value')
    ) {
      return [
        {
          code: (titles as Entry)['@language'].substring(0, 2),
          title: (titles as Entry)['@value'],
        },
      ];
    }
    return [];
  }

  datasetClick() {
    const langCode = this.translate.currentLang;
    const url = `${this.deployUrl}data/datasets/${this.datasetId}?locale=${langCode}`;
    window.open(url, '_traget');
  }

  catalogClick() {
    const langCode = this.translate.currentLang;
    const url = `${this.deployUrl}data/datasets?catalog=${this.catalogId}&showcatalogdetails=true&locale=${langCode}`;
    window.open(url, '_traget');
  }
}

export function filterUndefined<T>(list: (T | undefined)[]): T[] {
  return list.filter(e => e !== undefined) as T[];
}
