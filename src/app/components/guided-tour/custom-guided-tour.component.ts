import { Component, ViewEncapsulation } from '@angular/core';
import { GuidedTourComponent } from 'ngx-guided-tour';

@Component({
    selector: 'ngx-guided-tour',
    templateUrl: 'custom-guided-tour.component.html',
    styleUrls: ['./custom-guided-tour.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CustomGuidedTourComponent extends GuidedTourComponent { }
