import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-wms-feature-info',
  templateUrl: './wms-feature-info.component.html',
  styleUrls: ['./wms-feature-info.component.scss']
})
export class WmsFeatureInfoComponent implements OnInit {

  @Input() featureInfoUrl: string[] = [];

  public html: string[] = [];
  public loading = false;

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    if (this.featureInfoUrl.length) {
      this.loading = true;
      const temp = this.featureInfoUrl.map(e => this.http.get(e, { responseType: 'text' }));
      forkJoin(temp).subscribe(
        res => {
          res.forEach(r => this.html.push(r));
          this.loading = false;
        },
        error => {
          this.html = ['Error occured, while requesting the feature info.'];
          this.loading = false;
        }
      );
    }
  }

}
