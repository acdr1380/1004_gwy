import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IAppConfig } from './entity/iapp-config';
import { environment } from 'environments/environment';
import { tap } from 'rxjs/operators';

@Injectable()
export class AppConfig {
    static settings: IAppConfig;
    constructor(private http: HttpClient) {}

    init() {
        const url = `web.settings/settings.${environment.name}.json`;
        return this.http
            .get<IAppConfig>(url)
            .pipe(
                tap(response => {
                    AppConfig.settings = response;
                })
            )
            .toPromise()
            .catch((response: any) => {
                console.log(`Could not load file '${url}': ${JSON.stringify(response)}`);
            });
    }
}
