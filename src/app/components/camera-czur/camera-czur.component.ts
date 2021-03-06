import { CameraCzurService } from './camera-czur.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { LoadingService } from 'app/components/loading/loading.service';
import {
    Component,
    OnInit,
    ViewChild,
    ViewContainerRef,
    AfterViewInit,
    Output,
    EventEmitter,
} from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, TemplatePortalDirective } from '@angular/cdk/portal';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'gl-camera-czur',
    templateUrl: './camera-czur.component.html',
    styleUrls: ['./camera-czur.component.scss'],
})
export class CameraCZURComponent implements OnInit, AfterViewInit {
    @Output() takedBase64Change = new EventEmitter<any>();
    @Output() takedBlobChange = new EventEmitter<Blob>();
    @Output() takedFormDataChange = new EventEmitter<FormData>();

    @ViewChild('overlayGlobalTemplate', { static: false })
    templateGlobalPortals: TemplatePortalDirective;
    private overlayRef: OverlayRef;

    /**
     * 显示侧栏
     */
    sideIfy = {
        showSide: false,
        isSetting_show: false,
        showSetting: () => {
            this.sideIfy.isSetting_show = !this.sideIfy.isSetting_show;
            this.sideIfy.showSide = !this.sideIfy.showSide;
        },
        close: () => {
            this.sideIfy.isSetting_show = false;
            this.sideIfy.showSide = false;
        },
    };

    /**
     * 设备参数
     */
    settingIfy = {
        info: {
            /**
             * cdk授权码
             */
            license: null,
            /**
             * 分辨率
             */
            resolution: '2048*1536',
        },
        load: () => {
            const data = this.service.getCameraSetData();
            this.settingIfy.info = Object.assign(this.settingIfy.info, data);
            console.dir(this.settingIfy.info);
        },
        save: () => {
            const data = this.settingIfy.info;
            this.service.setCameraSetData(data);
        },
        setResolution: () => {
            this.CZUR_SetMCPreviewResolution();
            this.settingIfy.save();
        },
    };

    //#region CZUR 高拍仪设备参数

    // 日志
    txtlog = [];

    m_cav_frame;
    m_ctx_frame;
    m_img_frame = new Image();

    //记录主头处理方式
    m_process_type = 0;

    //指令通道信息
    ws_cmd = null;
    cmd_svc_port = 25014;
    cmd_svc_connect = false;

    //主头通道信息
    ws_mc = null;
    mc_svc_port = 9999;
    mc_svc_connect = false;

    //是否绘制主头视频画面
    is_draw_m_frame = false;
    //是否绘制副头视频画面
    is_draw_s_frame = false;

    // 图像数据
    j_img_base64 = new Image();

    //#endregion

    constructor(
        public overlay: Overlay,
        public viewContainerRef: ViewContainerRef,
        private sanitizer: DomSanitizer,
        private loading: LoadingService,
        private message: NzMessageService,
        private service: CameraCzurService
    ) {}

    ngOnInit(): void {
        this.settingIfy.load();
    }

    ngAfterViewInit() {
        this.m_cav_frame = document.getElementById('camera_czur_m');
        if (this.m_cav_frame) {
            this.m_cav_frame.width = this.m_cav_frame.scrollWidth;
            this.m_cav_frame.height = this.m_cav_frame.scrollHeight;
            this.m_ctx_frame = this.m_cav_frame.getContext('2d');
        }
        this.connect_cmd_svc();
        this.connect_mc_svc();
    }

    /**
     * 显示在线预览
     */
    public show() {
        // config: OverlayConfig overlay的配置，配置显示位置，和滑动策略
        const config = new OverlayConfig();
        config.positionStrategy = this.overlay.position().global(); // 全局显示
        // .centerHorizontally() // 水平居中
        // .centerVertically(); // 垂直居中
        // config.hasBackdrop = true; // 设置overlay后面有一层背景, 当然你也可以设置backdropClass 来设置这层背景的class
        config.backdropClass = 'overlay-shade';
        this.overlayRef = this.overlay.create(config); // OverlayRef, overlay层
        this.overlayRef.backdropClick().subscribe(() => {
            // 点击了backdrop背景
            this.overlayRef.dispose();
        });
        // OverlayPanelComponent是动态组件
        // 创建一个ComponentPortal，attach到OverlayRef，这个时候我们这个overlay层就显示出来了。
        this.overlayRef.attach(this.templateGlobalPortals);
        // this.overlayRef.attach(new ComponentPortal(CameraVideoComponent, this.viewContainerRef));
        // 监听overlayRef上的键盘按键事件
        this.overlayRef.keydownEvents().subscribe((event: KeyboardEvent) => {
            // if (event.keyCode === 37) {
            //     this.last();
            // }
            // if (event.keyCode === 39) {
            //     this.next();
            // }
            if (event.keyCode === 27) {
                this.overlayRef.dispose();
            }
        });
        this.ngAfterViewInit();
        this.reconnection();
    }

    /**
     * 关闭预览
     */
    public close() {
        this.overlayRef.dispose();
    }

    //#region CZUR 高拍仪设备相关

    reconnection() {
        this.CZUR_ID_Initialize();
        this.CZUR_ID_OpenDevice();
    }

    /**
     * 连接指令服务器
     * @returns
     */
    connect_cmd_svc() {
        if (this.cmd_svc_connect == true) {
            // this.txtlog.splice(0,0,'已连接指令服务器');
            return;
        }

        var url = 'ws://localhost:' + this.cmd_svc_port + '/';
        if ('WebSocket' in window) {
            this.ws_cmd = new WebSocket(url);
        } else if ('MozWebSocket' in window) {
            this.ws_cmd = new window.MozWebSocket(url);
        } else {
            this.txtlog.splice(0, 0, '浏览器不支持WebSocket');
        }

        this.cmdWebSocketEvent();
    }

    /**
     * 指令服务器 事件注册
     */
    cmdWebSocketEvent() {
        this.ws_cmd.onopen = () => {
            this.cmd_svc_connect = true;
            this.txtlog.splice(0, 0, '成功连接指令服务器');
        };

        this.ws_cmd.onclose = () => {
            this.cmd_svc_connect = false;
            this.txtlog.splice(0, 0, '与指令服务器连接中断');
        };

        this.ws_cmd.onmessage = e => {
            var jsonObj = JSON.parse(e.data);
            switch (jsonObj.id) {
                case 0:
                    {
                        var error = jsonObj.error;

                        switch (error) {
                            case 3:
                                this.txtlog.splice(0, 0, '系统内存不足，无法处理当前指令');
                                break;

                            case 5:
                                this.txtlog.splice(0, 0, '无效的json指令格式');
                                break;
                        }
                    }
                    break;
                //初始化CZURPlugin环境反馈
                case 2: {
                    this.CZUR_ID_Initialize_Response(jsonObj);
                    break;
                }

                //打开设备反馈
                case 10:
                    this.CZUR_ID_OpenDevice_Response(jsonObj);
                    break;
                //关闭设备反馈
                case 12: {
                    this.CZUR_ID_CloseDevice_Response(jsonObj);
                    break;
                }
                //获取预览分辨率反馈
                case 27:
                    var error = jsonObj.error;
                    switch (error) {
                        case 0:
                            this.txtlog.splice(0, 0, '设置预览分辨率成功');
                            break;

                        case 8:
                            this.txtlog.splice(0, 0, 'CZURPlugin环境未初始化');
                            break;

                        case 11:
                            this.txtlog.splice(0, 0, '无效的摄像头序号');
                            break;

                        case 12:
                            this.txtlog.splice(0, 0, '摄像头已打开，无法设置');
                            break;

                        case 16:
                            this.txtlog.splice(0, 0, '无效的预览分辨率');
                            break;
                    }
                    break;
                //拍照(BASE64编码数据)反馈
                case 69:
                    this.CZUR_ID_GrabBase64_Response(jsonObj);
                    break;
                //拍照(BASE64编码数据)结果通知
                case 318:
                    this.CZUR_ID_BASE64(jsonObj);
                    break;
            }
        };
    }

    /**
     * 初始化CZURPlugin环境反馈，格式: {"id": 2, "error": 错误代码}
     */
    CZUR_ID_Initialize_Response(jsonObj) {
        let error = jsonObj.error;

        switch (error) {
            case 0:
                this.txtlog.splice(0, 0, '初始化CZURPlugin成功');
                break;
            case 1:
                this.txtlog.splice(0, 0, '异常错误');
                break;
            case 3:
                this.txtlog.splice(0, 0, '系统内存不足');
                break;
            case 6:
                this.txtlog.splice(0, 0, '无效的授权码');
                break;
            case 9:
                this.txtlog.splice(0, 0, 'CZURPlugin环境已初始化');
                break;
            case 42:
                this.txtlog.splice(0, 0, '创建图像处理线程失败');
                break;
            case 43:
                this.txtlog.splice(0, 0, '字符集转换失败');
                break;
        }
    }

    /**
     * 连接主头服务器
     */
    connect_mc_svc() {
        if (this.mc_svc_connect == true) {
            // this.message.info('已连接主头服务器');
            return;
        }

        var url = 'ws://localhost:' + this.mc_svc_port + '/';

        if ('WebSocket' in window) {
            this.ws_mc = new WebSocket(url);
        } else if ('MozWebSocket' in window) {
            this.ws_mc = new window.MozWebSocket(url);
        } else {
            this.message.info('浏览器不支持WebSocket');
        }
        this.mcWebSocketEvent();
    }

    /**
     * 主头服务器 事件注册
     */
    mcWebSocketEvent() {
        this.ws_mc.onopen = () => {
            this.mc_svc_connect = true;
            this.txtlog.splice(0, 0, '成功连接主头服务器');
        };

        this.ws_mc.onclose = () => {
            this.is_draw_m_frame = false;
            this.mc_svc_connect = false;
            this.txtlog.splice(0, 0, '与主头服务器连接中断');
        };

        this.ws_mc.onmessage = e => {
            if (this.is_draw_m_frame) {
                this.m_img_frame.crossOrigin = 'anonymous';
                this.m_img_frame.src = 'data:image/jpeg;base64,' + e.data;

                this.m_img_frame.onload = e => {
                    this.m_ctx_frame.drawImage(
                        this.m_img_frame,
                        0,
                        0,
                        this.m_cav_frame.width,
                        this.m_cav_frame.height
                    );

                    if (1 == this.m_process_type) {
                        // this.DrawRect(0);
                    } else if (2 == this.m_process_type) {
                        // this.DrawMLine();
                    }
                };
            }
        };
    }

    /**
     * 打开设备反馈，格式：{"id": 10, "error": 错误代码}
     */
    CZUR_ID_OpenDevice_Response(jsonObj) {
        var error = jsonObj.error;

        switch (error) {
            case 0:
                {
                    // var index = document.getElementById('devtype').selectedIndex;
                    // if (0 == index) {
                    //     this.is_draw_m_frame = true;
                    // } else {
                    //     this.is_draw_s_frame = true;
                    // }
                    this.is_draw_m_frame = true;
                    this.txtlog.splice(0, 0, '打开摄像头成功');
                }
                break;

            case 1:
                this.txtlog.splice(0, 0, '异常错误');
                break;
            case 8:
                this.txtlog.splice(0, 0, 'CZURPlugin环境未初始化');
                break;
            case 10:
                this.txtlog.splice(0, 0, '设备不支持副摄像头');
                break;
            case 11:
                this.txtlog.splice(0, 0, '无效的摄像头序号');
                break;
            case 12:
                this.txtlog.splice(0, 0, '摄像头已打开');
                break;
            case 13:
                this.txtlog.splice(0, 0, '设备未连接，请将设备连接电脑');
                break;
        }
    }

    /**
     * 初始化CZURPlugin环境，格式: {"id": 1, "license": "授权码"}
     */
    CZUR_ID_Initialize() {
        const { license } = this.settingIfy.info;
        var jsonMsg = {
            id: 1,
            license: license || '',
        };
        this.ws_cmd.send(JSON.stringify(jsonMsg));
    }

    /**
     * 设置主头预览分辨率 格式：{"id": 26, "index": 0, "width": 宽度, "height": 高度}
     */
    CZUR_SetMCPreviewResolution() {
        let [width, height] = this.settingIfy.info.resolution.split('*');
        const jsonMsg = {
            id: 26,
            index: 0,
            width: Number(width),
            height: Number(height),
        };
        this.ws_cmd.send(JSON.stringify(jsonMsg));
    }

    /**
     * 打开设备，格式：{"id": 9, "index": 摄像头序号}
     */
    CZUR_ID_OpenDevice() {
        const jsonMsg = {
            id: 9,
            //摄像头序号
            index: 0,
        };
        this.ws_cmd.send(JSON.stringify(jsonMsg));
    }

    /**
     * 关闭设备，格式: {"id": 11, "index": 摄像头序号}
     */
    CZUR_ID_CloseDevice() {
        var jsonMsg = {
            id: 11,
            //摄像头序号
            index: 0,
        };
        this.ws_cmd.send(JSON.stringify(jsonMsg));
    }

    /**
     * 关闭设备反馈，格式: {"id": 12, "error": 错误代码}
     */
    CZUR_ID_CloseDevice_Response(jsonObj) {
        var error = jsonObj.error;

        switch (error) {
            case 0:
                this.is_draw_m_frame = false;
                this.m_ctx_frame.fillStyle = '#000000';
                this.m_ctx_frame.beginPath();
                this.m_ctx_frame.fillRect(0, 0, this.m_cav_frame.width, this.m_cav_frame.height);
                this.m_ctx_frame.closePath();
                this.txtlog.splice(0, 0, '关闭摄像头成功');
                break;

            case 4:
                this.txtlog.splice(0, 0, '正在进行录像，无法关闭设备');
                break;

            case 8:
                this.txtlog.splice(0, 0, 'CZURPlugin环境未初始化');
                break;

            case 11:
                this.txtlog.splice(0, 0, '无效的摄像头序号');
                break;

            case 14:
                this.txtlog.splice(0, 0, '摄像头未打开');
                break;
        }
    }

    /**
     * 拍照保存JPG图像数据(BASE64编码)，格式: {"id": 68, "index": 摄像头序号, "dpi": DPI, "color": 颜色模式, "round": 圆角留白, "adjust": 方向转正, "bcr": 条码识别, "bpd": 空白页检测, "quality": JPG压缩质量}
     */
    CZUR_ID_GrabBase64() {
        //摄像头序号
        var index = 0;

        //DPI
        var dpi = 0;

        //色彩模式
        var color = 0;

        //圆角留白
        var round = 0;

        //方向调整
        var adjust = 0;

        //识别条码
        var bcr = 0;

        //空白页检测
        var bpd = 0;

        //JPG压缩质量
        var quality = 75;

        //副摄像头仅支持彩色、灰度\黑白以及 DPI、JPG 压缩质量、TIFF 压缩方式设置，
        //round、 adjust、 bcr、 bpd 参数必须设置为 0
        if (1 == index) {
            round = 0;
            adjust = 0;
            bcr = 0;
            bpd = 0;
        }

        var jsonMsg = {
            id: 68,
            index: index,
            dpi: dpi,
            color: color,
            round: round,
            adjust: adjust,
            bcr: bcr,
            bpd: bpd,
            quality: quality,
        };
        this.ws_cmd.send(JSON.stringify(jsonMsg));
    }

    /**
     * 拍照保存JPG图像数据(BASE64编码)反馈，格式: {"id": 69, "error": 错误代码}
     */
    CZUR_ID_GrabBase64_Response(jsonObj) {
        const error = jsonObj.error;

        switch (error) {
            case 0:
                this.txtlog.splice(0, 0, '拍照成功，图像正在处理，请稍后');
                break;

            case 1:
                this.txtlog.splice(0, 0, '异常错误');
                break;

            case 3:
                this.txtlog.splice(0, 0, '系统内存不足');
                break;

            case 4:
                this.txtlog.splice(0, 0, '录像期间，无法拍照');
                break;

            case 8:
                this.txtlog.splice(0, 0, 'CZURPlugin环境未初始化');
                break;

            case 10:
                this.txtlog.splice(0, 0, '设备不支持某些拍照属性参数设置');
                break;

            case 11:
                this.txtlog.splice(0, 0, '无效的摄像头序号');
                break;

            case 14:
                this.txtlog.splice(0, 0, '摄像头尚未打开，无法进行拍照操作');
                break;

            case 17:
                this.txtlog.splice(0, 0, '无效的颜色模式');
                break;

            case 19:
                this.txtlog.splice(0, 0, '激光线闪过之后，才可以拍摄下一张');
                break;

            case 21:
                this.txtlog.splice(0, 0, '无效的JPG压缩质量');
                break;

            case 50:
                this.txtlog.splice(0, 0, '图像数据尚未准备好，请稍后再试');
                break;
        }
    }

    /**
     * 将处理完毕的JPG(BASE64编码)图像数据信息通知给调用者
     */
    CZUR_ID_BASE64(jsonObj) {
        var error = jsonObj.error;

        switch (error) {
            case 0:
                {
                    //图像处理成功，判断是否识别到条码 ……

                    this.txtlog.splice(0, 0, '获取BASE64图像数据成功');

                    //demo中只是简单的对BASE64数据进行显示
                    if (jsonObj.b641 != 'null') {
                        this.j_img_base64.crossOrigin = 'anonymous';
                        this.j_img_base64.src = 'data:image/jpeg;base64,' + jsonObj.b641;
                    }

                    if (jsonObj.b642 != 'null') {
                        this.j_img_base64.crossOrigin = 'anonymous';
                        this.j_img_base64.src = 'data:image/jpeg;base64,' + jsonObj.b642;
                    }
                }
                break;

            case 1:
                this.txtlog.splice(0, 0, '发生异常错误，无法获取JPG图像数据');
                break;

            case 3:
                this.txtlog.splice(0, 0, '系统内存不足');
                break;

            case 40:
                this.txtlog.splice(0, 0, '图像为空白页，不保存BASE64编码数据');
                break;
        }

        // 处理成base64 blog formData 结果返回
        this.takedBase64Change.emit(this.j_img_base64.src);
        const blob = this.dataURItoBlob(this.j_img_base64.src);
        this.takedBlobChange.emit(blob);
        let file = new File([blob], `${+new Date()}.jpg`, { type: 'image/jpg' });
        let formData = new FormData();
        formData.append('file', file);
        this.takedFormDataChange.emit(formData);
    }
    //#endregion

    /**
     * base64  to blob二进制
     */
    dataURItoBlob(dataURI) {
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]; // mime类型
        var byteString = atob(dataURI.split(',')[1]); //base64 解码
        var arrayBuffer = new ArrayBuffer(byteString.length); //创建缓冲数组
        var intArray = new Uint8Array(arrayBuffer); //创建视图

        for (var i = 0; i < byteString.length; i++) {
            intArray[i] = byteString.charCodeAt(i);
        }
        return new Blob([intArray], { type: mimeString });
    }
}
