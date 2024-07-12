import { Component, OnInit } from "@angular/core";

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  standalone: true
})
export class CounterComponent implements OnInit {

  public count!: number;

  constructor() { }

  ngOnInit(): void {
  }

}
