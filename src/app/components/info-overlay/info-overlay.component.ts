import { ConnectedPosition } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { LangTitle } from './../../model';

interface Entry {
  '@language': string;
  '@value': string;
}

interface DeuDataset {
  '@context': any;
  '@graph': {
    '@id': string;
    '@type'?: string;
    'title': (Entry | string)[]
  }[]
}

const CATALOG_ID_PARAM = 'catalog';
const DATASET_ID_PARAM = 'dataset';
const DISTRIBUTION_ID_PARAM = 'distribution';

@Component({
  selector: 'app-info-overlay',
  templateUrl: './info-overlay.component.html',
  styleUrls: ['./info-overlay.component.scss']
})
export class InfoOverlayComponent implements OnInit {

  distributionTitle: LangTitle[] | undefined;
  catalogTitle: LangTitle[] | undefined;

  datasetId: string | undefined;
  catalogId: string | undefined;

  isOpen = true;

  position: ConnectedPosition[] = [{
    overlayX: 'start',
    overlayY: 'top',
    originX: 'start',
    originY: 'top'
  }];

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    @Inject('API_URL') private apiUrl: string,
    @Inject('DEPLOY_URL') private deployUrl: string,
    private route: ActivatedRoute
  ) { }

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
    this.http.get<DeuDataset>(`${this.apiUrl}datasets/${datasetId}.jsonld?useNormalizedId=true`).subscribe(res => {
      const match = res['@graph'].find(e => e['@id'].indexOf(distributionId) >= 0);
      const titles = match?.title;
      if (titles) {
        this.distributionTitle = this.getLanguageList(titles);
      }
    });
  }

  private loadCatalog(catalogId: string) {
    this.catalogId = catalogId;
    this.http.get<DeuDataset>(`${this.apiUrl}catalogues/${catalogId}.jsonld`).subscribe(res => {
      const match = res['@graph'].find(e => e['@type'] ? e['@type']?.indexOf('dcat:Catalog') >= 0 : false);
      if (match?.title) {
        this.catalogTitle = this.getLanguageList(match.title);
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
            if (typeof e === 'object' && e.hasOwnProperty('@language') && e.hasOwnProperty('@value')) {
              return { code: e['@language'].substring(0, 2), title: e['@value'] };
            }
            return undefined;
          })
        );
      }
    }
    if (titles instanceof Object && titles.hasOwnProperty('@language') && titles.hasOwnProperty('@value')) {
      return [{
        code: (titles as Entry)['@language'].substring(0, 2),
        title: (titles as Entry)['@value']
      }]
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