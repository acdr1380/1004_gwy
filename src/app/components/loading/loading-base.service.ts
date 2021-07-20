import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoadingComponent } from './loading.component';

export class LoadingBaseService {
    private overlayRef: OverlayRef;
    private drawerRef: LoadingComponent;

    private unsubscribe$ = new Subject<void>();

    constructor(private overlay: Overlay, options) {
        this.overlayRef = this.overlay.create();
        this.drawerRef = this.overlayRef.attach(new ComponentPortal(LoadingComponent)).instance;
        if (options.message) {
            this.drawerRef.message = options.message;
        }

        this.drawerRef.nzOnViewInit.pipe(takeUntil(this.unsubscribe$)).subscribe(() => {
            this.drawerRef.show();
        });
    }

    getInstance() {
        return this.drawerRef;
    }
}
