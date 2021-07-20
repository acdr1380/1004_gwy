// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { version, description } from './../assets/web.version.json';

export const environment = {
    version,
    description,
    production: false,
    name: 'dev',
    config: {
        /**
         * 项目根目录
         */
        PROJECT_PATH_ROOT: 'gl_1004_gwygz',
        /**
         * 加密逻辑
         */
        NB_NETWORK_CONFIG_DESKey: 'glsoft88',
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
