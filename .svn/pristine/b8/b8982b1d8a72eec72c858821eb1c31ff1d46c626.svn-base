import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { R } from 'app/entity/vo/R';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NoteInfoVO } from '../../db/vo/NoteInfoVO';

@Injectable({
    providedIn: 'root',
})
export class NotesService {
    constructor(private http: HttpClient) {}

    /**
     * 查询最新笔记
     * @param {number} count 条数
     */
    getNotesCountList(count: number): Observable<Array<any>> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/note/info/findCount';
        return this.http.get<R>(`${url}/${count}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 增加笔记
     */
    addNoteData(data) {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/note/info/save';
        return this.http.post<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 查询所有笔记
     */
    getNotesAllList() {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/note/info/findAll';
        return this.http.get<R>(url).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 查询标记
     * @param {string} noteId 笔记编码
     */
    getNotesTagsList(noteId: string) {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/tag/info/findByNoteId';
        return this.http.get<R>(`${url}/${noteId}`).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 删除标记
     * @param {string} tagId 标记编码
     */
    deleteTagData(tagId: string): Observable<boolean> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/tag/info/delete';
        return this.http.delete<R>(`${url}/${tagId}`).pipe(map(json => json.code === 0));
    }

    /**
     * 查询笔记列表
     */
    getNotesList(data): Observable<any> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/note/info/select';
        const params = new HttpParams({ fromObject: data });
        return this.http
            .get<R>(url, { params })
            .pipe(
                map(json => {
                    if (json.code === 0) {
                        return json.data;
                    }
                })
            );
    }

    /**
     * 更新笔记
     */
    updateNoteData(data: NoteInfoVO): Observable<any> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/note/info/update';
        return this.http.put<R>(url, data).pipe(
            map(json => {
                if (json.code === 0) {
                    return json.data;
                }
            })
        );
    }

    /**
     * 删除笔记
     */
    deleteNoteData(noteId: string): Observable<boolean> {
        const url = 'api/gl-plug-policy-inquiries-v2/v1/note/info/delete';
        return this.http.delete<R>(`${url}/${noteId}`).pipe(map(json => json.code === 0));
    }
}
