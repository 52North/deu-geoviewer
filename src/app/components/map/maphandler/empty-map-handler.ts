import { Map, View } from 'ol';
import Projection from 'ol/proj/Projection';
import { Observable, of } from 'rxjs';

import { MapHandler } from './map-handler';
import { MapProjection } from './model';

export class EmptyMapHandler extends MapHandler {

    public createMap(mapId: string): Observable<void> {
        const projection = new Projection({ code: MapProjection.EPSG_4326 });

        const map = new Map({
            layers: this.createBaseLayers(projection),
            controls: [],
            target: mapId,
            view: new View({
                projection: projection.getCode(),
                maxZoom: 18,
            })
        });

        map.getView().fit(this.getDefaultExtent(projection));
        return of(undefined);
    }

    public activateFeatureInfo(): void { }

    public deactivateFeatureInfo(): void { }
}
