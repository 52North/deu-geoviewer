import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LinkViewComponent } from './views/link-view/link-view.component';
import { MapViewComponent } from './views/map-view/map-view.component';

const routes: Routes = [
  { path: 'samples', component: LinkViewComponent },
  { path: '**', component: MapViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
