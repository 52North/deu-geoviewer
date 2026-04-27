import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

function getWindow(): any {
    return window;
}

function getMockWindow(): any {
    return {
        innerWidth: 0,
        innerHeight: 0,
        scrollY: 0,
        scrollX: 0,
        pageYOffset: 0,
        pageXOffset: 0,
        scroll: () => {},
        scrollTo: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
    }
}

@Injectable()
export class WindowRefService {
    private readonly isBrowser: boolean = false;

    get nativeWindow(): any {
        if (this.isBrowser) {
            return getWindow();
        } else {
            return getMockWindow();
        }
    }

    constructor() {
        const platformId = inject<Object>(PLATFORM_ID);

        this.isBrowser = isPlatformBrowser(platformId);
    }
}
