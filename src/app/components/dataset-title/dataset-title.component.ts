import { Component, Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DatasetTitleService {
  public title: Subject<string> = new Subject();
}

@Component({
  selector: 'app-dataset-title',
  templateUrl: './dataset-title.component.html',
  styleUrls: ['./dataset-title.component.scss']
})
export class DatasetTitleComponent {

  constructor(
    public titleSrvc: DatasetTitleService
  ) { }

}
