import { Injectable } from '@angular/core';
import { AppConfig } from 'app/app.config';
import { environment } from 'environments/environment';
/**
 * 业务表名构建类
 */
Injectable();
export class WfTableHelper {
    protected appSettings = AppConfig.settings;
    // public tableCode;
    // public tableCodeId;
    // constructor(shortCode: string) {
    //     this.tableCode = this.getTableCode(shortCode);
    //     this.tableCodeId = `${this.tableCode}_ID`;
    // }
    /**
     * 根据 短表名 获得表名
     * @param shortCode 短表名
     * @returns 返回表名
     */
    public getTableCode(shortCode: string): string {
        if (!shortCode) {
            return;
        }
        const { GENERAL_TABLE_CODE, SALARY_TABLE_CODE } = this.appSettings.aad;
        let tableCode = shortCode;
        // 判断是否工资表
        if (shortCode.indexOf('GZ') === 0) {
            tableCode = `DATA_${SALARY_TABLE_CODE}_PERSON_${shortCode}`;
        } else {
            // 判断是否人员还是单位表
            let type;
            if (shortCode.indexOf('A') === 0) {
                type = 'PERSON';
            } else if (shortCode.indexOf('B') === 0) {
                type = 'UNIT';
            }
            // 判断 通用表编码 是否存在
            if (GENERAL_TABLE_CODE.length === 0) {
                tableCode = `DATA_${type}_${shortCode}`;
            } else {
                tableCode = `DATA_${GENERAL_TABLE_CODE}_${type}_${shortCode}`;
            }
        }

        return tableCode;
    }
}
