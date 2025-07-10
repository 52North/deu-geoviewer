
import { HttpClient } from "@angular/common/http";
import { Component, OnInit, inject, input } from "@angular/core";
import { forkJoin } from "rxjs";

@Component({
    selector: 'app-wms-feature-info',
    templateUrl: './wms-feature-info.component.html',
    styleUrls: ['./wms-feature-info.component.scss'],
    imports: []
})
export class WmsFeatureInfoComponent implements OnInit {
  private http = inject(HttpClient);


  readonly featureInfoUrl = input<string[]>([]);

  public html: string[] = [];
  public loading = false;

  ngOnInit(): void {
    const featureInfoUrl = this.featureInfoUrl();
    if (featureInfoUrl.length) {
      this.loading = true;
      const temp = featureInfoUrl.map(e => this.http.get(e, { responseType: 'text' }));
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
