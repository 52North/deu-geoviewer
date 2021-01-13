import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-wms-feature-info',
  templateUrl: './wms-feature-info.component.html',
  styleUrls: ['./wms-feature-info.component.scss']
})
export class WmsFeatureInfoComponent implements OnInit {

  @Input() featureInfoUrl = '';

  public html: string | undefined;
  public loading = false;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    if (this.featureInfoUrl) {
      this.loading = true;
      this.http.get(this.featureInfoUrl, { responseType: 'text' }).subscribe(
        res => {
          this.html = res;
          this.loading = false;
        },
        error => {
          this.html = 'Error occured, while requesting the feature info.';
          this.loading = false;
        }
      );
    }
  }

}
