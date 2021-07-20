import { Injectable } from '@angular/core';
import { AppConfig } from 'app/app.config';
import { environment } from 'environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CameraCzurService {
    protected appSettings = AppConfig.settings;
    constructor() {}

    /**
     * 获得cdk 授权码 （本地缓存）
     */
    getCameraSetData() {
        const data = localStorage.getItem(
            environment.config.PROJECT_PATH_ROOT + '_camera_czur_setting'
        );
        const result = data ? JSON.parse(data) : {};
        return result;
    }

    setCameraSetData(data) {
        const str = JSON.stringify(data);
        localStorage.setItem(environment.config.PROJECT_PATH_ROOT + '_camera_czur_setting', str);
    }
}
