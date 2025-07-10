import { NgClass, NgTemplateOutlet } from "@angular/common";
import { Component, ViewEncapsulation } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { GuidedTourComponent } from "ngx-guided-tour";

@Component({
    selector: 'ngx-guided-tour',
    templateUrl: 'custom-guided-tour.component.html',
    styleUrls: ['./custom-guided-tour.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [NgClass, NgTemplateOutlet, TranslateModule]
})
export class CustomGuidedTourComponent extends GuidedTourComponent { }
