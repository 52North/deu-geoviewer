import { ConnectedPosition } from '@angular/cdk/overlay';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


interface DeuDataset {
  catalog?: {
    title?: {
      [key: string]: string
    };
    id?: string;
  };
  title?: {
    [key: string]: string
  }
}

const CATALOG_DATASET_ID_PARAM = 'catalog-dataset';

@Component({
  selector: 'app-info-overlay',
  templateUrl: './info-overlay.component.html',
  styleUrls: ['./info-overlay.component.scss']
})
export class InfoOverlayComponent implements OnInit {

  datasetTitle: string | undefined;

  catalogTitle: string | undefined;

  isOpen = true;

  position: ConnectedPosition[] = [{
    overlayX: 'start',
    overlayY: 'top',
    originX: 'start',
    originY: 'top'
  }];

  datasetId: string | undefined;
  private dataset: DeuDataset | undefined;

  constructor(
    private http: HttpClient,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    if (params[CATALOG_DATASET_ID_PARAM]) {
      this.datasetId = params[CATALOG_DATASET_ID_PARAM];
    }

    if (this.datasetId) {
      this.http.get<{ result?: DeuDataset }>(`https://data.europa.eu/api/hub/search/datasets/${this.datasetId}`).subscribe(ds => {
        this.dataset = ds.result;
        this.setValues();
      });
      this.translate.onLangChange.subscribe(lang => this.setValues())
    } else {
      this.isOpen = false;
    }
  }

  private setValues() {
    const langCode = this.translate.currentLang;
    if (this.dataset?.title) {
      if (this.dataset.title[langCode] !== undefined) {
        this.datasetTitle = this.dataset.title[langCode];
      } else {
        const props = Object.getOwnPropertyNames(this.dataset.title);
        if (props.length > 0) {
          this.datasetTitle = this.dataset.title[props[0]];
        }
      }
    }

    if (this.dataset?.catalog?.title) {
      if (this.dataset.catalog.title[langCode] !== undefined) {
        this.catalogTitle = this.dataset.catalog.title[langCode];
      } else {
        const props = Object.getOwnPropertyNames(this.dataset.catalog.title);
        if (props.length > 0) {
          this.catalogTitle = this.dataset.catalog.title[props[0]];
        }
      }
    }
  }

  datasetClick() {
    const langCode = this.translate.currentLang;
    const url = `https://data.europa.eu/data/datasets/${this.datasetId}?locale=${langCode}`;
    window.open(url, '_traget');
  }

  catalogClick() {
    if (this.dataset?.catalog?.id) {
      const langCode = this.translate.currentLang;
      const url = `https://data.europa.eu/data/datasets?catalog=${this.dataset?.catalog?.id}&showcatalogdetails=true&locale=${langCode}`;
      window.open(url, '_traget');
    }
  }

}
