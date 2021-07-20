/**
 * 系统菜单
 *
 * @export
 * @enum {number}
 */
export enum ResourceTypeEnum {
    /**
     * 目录
     */
    CATALOG,
    /**
     * 菜单
     */
    MENU,
    /**
     * 按钮
     */
    BUTTON,

    /**
     * 元素
     */
    ELEMENT
}

/**
 * 系统菜单中文对应
 */
// tslint:disable-next-line:variable-name
export const ResourceTypeEnum_CN = [
    { text: '目录', value: 0 },
    { text: '菜单', value: 1 },
    { text: '按钮', value: 2 },
    { text: '元素', value: 3 },
];
