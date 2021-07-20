// 测试库打包config相关内容
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
