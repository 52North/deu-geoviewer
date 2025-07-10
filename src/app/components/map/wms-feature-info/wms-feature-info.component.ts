
import { HttpClient } from "@angular/common/http";
import { Component, Input, OnInit, inject } from "@angular/core";
import { forkJoin } from "rxjs";

@Component({
    selector: 'app-wms-feature-info',
    templateUrl: './wms-feature-info.component.html',
    styleUrls: ['./wms-feature-info.component.scss'],
    imports: []
})
export class WmsFeatureInfoComponent implements OnInit {
  private http = inject(HttpClient);


  @Input() featureInfoUrl: string[] = [];

  public html: string[] = [];
  public loading = false;

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
