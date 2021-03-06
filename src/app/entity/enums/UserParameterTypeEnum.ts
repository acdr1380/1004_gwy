/**
 * 用户参数类型
 *
 * @export
 * @enum {number}
 */
export enum UserParameterTypeEnum {
    /**
     * "人员管理显示列"
     */
    PERSON_VIEW_FIELD,
    /**
     * "人员管理搜索显示列"
     */
    PERSON_QUERY_VIEW_FIELD,
    /**
     * "年度考核显示列"
     */
    ANNUAL_ASSESSMENT_VIEW_FIELD,
    /**
     * 高级查询显示列
     */
    SENIOR_QUERY_VIEW_FIELD,
    /**
     * 事业人员管理显示列
     */
    PERSON_VIEW_FIELD_CAREER,
    /**
     * 人员管理事业工资-显示字段
     */
    PERSON_SALARY_VIEW_FIELD_CAREER,
    /**
     * 人员管理公务员工资-显示字段
     */
    PERSON_SALARY_VIEW_FIELD_CIVIL,
    /**
     * 人员管理档案管理-显示字段
     */
    PERSON_VIEW_FIELD_ARCHIVES,
    /**
     * 专招管理-显示字段
     */
    PERSON_VIEW_FIELD_CIVIL_DESIGNED = 9,
    /**
     * 西藏公务员人员管理-显示字段
     */
    PERSON_VIEW_FIELD_CIVIL = 10,
}
