import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-no-service-available',
  templateUrl: './no-service-available.component.html',
  styleUrls: ['./no-service-available.component.scss']
})
export class NoServiceAvailableComponent implements OnInit {

  constructor(
    public modal: NgbActiveModal
  ) { }

  ngOnInit(): void {
  }

}
