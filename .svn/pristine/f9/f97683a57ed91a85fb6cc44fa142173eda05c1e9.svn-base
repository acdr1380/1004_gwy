import { LoadingServiceModule } from './loading-service.module';
import { LoadingBaseService } from './loading-base.service';

import { Overlay } from '@angular/cdk/overlay';
import { ApplicationRef, ComponentFactoryResolver, Injectable, Injector } from '@angular/core';

@Injectable({
    providedIn: LoadingServiceModule,
})
export class LoadingService {
    constructor(private overlay: Overlay) {}

    /**
     * 显示全屏加载
     * @param message 加载文字
     */
    public show(message?) {
        return this.create(true, message);
    }

    create(visible = false, message?: string) {
        return new LoadingBaseService(this.overlay, { visible, message }).getInstance();
    }
}
