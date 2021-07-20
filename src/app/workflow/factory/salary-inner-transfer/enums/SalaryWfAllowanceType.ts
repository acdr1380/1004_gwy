/**
 * 工资业务补贴类型 GZ21A03='编号'对应的中文
 */
export enum AllowanceEnum {
    A00,

    B00,
    B01,
    B03,
    B05,
    B06,

    C01,
    C02,
    C03,
    C04,
    C10,
    C11,
    C23,
    C29,
    C30,
    C34,
    C52,
    C53,
    C54,
    C61,

    D06,
    D07,
    D15,
}

export const AllowanceEnum_CN = [
    { text: '义务教育标识', value: 'A00' },

    { text: '教师护士标识', value: 'B00' },
    { text: '艰苦边远地区津贴', value: 'B01' },
    { text: '中小学非教10%补贴', value: 'B03' },
    { text: '驾驶员津贴', value: 'B05' },
    { text: '特教津贴', value: 'B06' },

    { text: '保留补贴', value: 'C01' },
    { text: '老粮贴', value: 'C02' },
    { text: '回族伙食补贴', value: 'C03' },
    { text: '岗位津贴', value: 'C04' },

    { text: '中小学班主任津贴', value: 'C10' },
    { text: '中小学特级教师津贴', value: 'C11' },
    { text: '教师护士保留10%', value: 'C23' },
    { text: '医疗卫生津贴', value: 'C29' },
    { text: '卫生防疫津贴', value: 'C30' },
    { text: '农、林业有毒有害津贴', value: 'C34' },
    { text: '乡村教师补贴', value: 'C52' },
    { text: '绩效工资', value: 'C53' },

    { text: '奖励性绩效工资', value: 'C54' },
    { text: '高海拔地区折算工龄补贴', value: 'C61' },

    { text: '教护龄津贴', value: 'D06' },
    { text: '军队服务津贴', value: 'D07' },
    { text: '独生子女费', value: 'D15' },

    { text: '绩效工资（规范性津补贴）', value: '56' },
    { text: '其他补贴', value: '51' },
];
