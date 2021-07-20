import { CommonService } from 'app/util/common.service';
import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    CanActivateChild,
} from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd/message';

@Injectable({
    providedIn: 'root',
})
export class InitGuardService implements CanActivateChild {
    constructor(
        private router: Router,
        private message: NzMessageService,
        private commonService: CommonService
    ) {}

    /**
     * 子路由守卫
     * @param next 路由信息
     * @param state 当前路由
     */
    canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const url: string = state.url;
        const list = this.commonService.getNavigeList();
        if (!list) {
            this.router.navigate(['login']);
            return false;
        }
        // 获得权限菜单列表
        const navGuard = list
            .filter(v => !!v.SYSTEM_RESOURCE_GUARD_ID)
            .map(v => v.SYSTEM_RESOURCE_GUARD_ID);
        const guardList = navGuard.filter(v => url.indexOf(`/${v}`) > -1);
        if (guardList.length > 0) {
            return true;
        }

        // 无权限路由直接跳转主路由
        this.router.navigate(['client']);
        return false;
    }
}
