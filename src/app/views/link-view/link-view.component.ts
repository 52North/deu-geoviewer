import { Component, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-link-view',
  templateUrl: './link-view.component.html',
  styleUrls: ['./link-view.component.scss'],
  standalone: true,
  imports: [RouterLink]
})
export class LinkViewComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
