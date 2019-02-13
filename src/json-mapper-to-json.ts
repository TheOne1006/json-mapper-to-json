'use strict';

import * as _ from 'lodash';
import * as moment from 'moment';
import * as crypto from 'crypto';

export default class JSONMapperClass {
  mapperRules = {};

  constructor(mapperRules: object = {}) {
    this.mapperRules = mapperRules;
  }

  /**
   * 转化主函数
   * @param source 来源
   * @param extAttrs 扩展属性
   * @param mapperRules 自定义 mapper 规则
   */
  conversion(source: any = {}, extAttrs = {}, mapperRules: any) {
    if (_.isEmpty(mapperRules)) {
      mapperRules = this.mapperRules;
    }

    const targetKeys = Object.keys(mapperRules);
    const target = {};

    targetKeys.reduce((origin: any, targetKey) => {
      // 容错
      if (!mapperRules[targetKey]) {
        return origin;
      }

      const sourceKey = mapperRules[targetKey];
      const isDirect = typeof sourceKey === 'string'; // 直接过去数据
      const isArray = Array.isArray(sourceKey);
      const isObject = _.isObject(sourceKey);

      if (isDirect) {
        origin[targetKey] = _.result(source, sourceKey);
      } else if (isArray) {
        const targetKeyArr: any = sourceKey;
        origin[targetKey] = targetKeyArr.map((item: string) => source[item]).filter((item: any) => item);
      } else if (isObject) {
        origin[targetKey] = JSONMapperClass.mixinTask(sourceKey, source);
      }

      if (origin[targetKey] === null || origin[targetKey] === undefined || origin[targetKey] === '') {
        delete origin[targetKey];
      }

      _.extend(origin, source.extendsExports || {});

      return origin;

    }, target);

    _.assign(target, extAttrs);

    return target;
  }

  /**
   * 转化配置
   * @param options 选项
   * @param source 来源
   */
  static mixinTask(options: any, source: any = {}) {
    if (options.hasOwnProperty('forceValue')) {
      return options.forceValue;
    }

    switch (options.type) {
      // switch选项解析器
      case 'switch':
        return JSONMapperClass.switchMapTask(options, source);
      // if 选项解析器
      case 'if':
        return JSONMapperClass.ifMapTask(options, source);
      // 随机选项
      case 'random-proportion':
        return JSONMapperClass.randomProportionMapTask(options, source);
      // 时间格式化
      case 'moment-format':
        return JSONMapperClass.momentFormatTask(options, source);
      // 注入到数组中
      case 'inject-arr':
        return JSONMapperClass.injectArrTask(options, source);
      // 注入到数组中使用模板资源
      case 'inject-arr-and-template-render':
        return JSONMapperClass.injectArrAndTemplateRenderTask(options, source);
      // 数组
      case 'array-str-mapper':
        return JSONMapperClass.arrayStrMapperTask(options, source);
      // moment 的随机id
      case 'moment-random-unique-id':
          return `${moment().format('X')}-${Math.random().toString(32).substr(2, 6)}`;
      case 'array-select':
        return JSONMapperClass.arraySelectTask(options, source);
      // 判断选项是否存在
      case 'exist-select':
          return JSONMapperClass.existSelectTask(options, source);
      // 将指定字符串 生成md5
      case 'select-md5':
        return JSONMapperClass.md5SelectTask(options, source);
      // 随机数
      case 'random-num':
        return JSONMapperClass.randomNumTask(options);
      // 限制字符串的长度
      case 'str-max-len-limit':
        return JSONMapperClass.strMaxLenLimitTask(options, source);
      // 将字符串转换成数字
      case 'str-2-num':
        return JSONMapperClass.str2numTask(options, source);
      // 将字符串转换成数组
      case 'split-str-2-arr':
        return JSONMapperClass.splitStr2Aarr(options, source);
      case 'str-replace':
        return JSONMapperClass.strReplaceTask(options, source);
      default:
        return null;
    }
  }


  /**
   * 判断是否满足等式
   * @param  {any} lValue    左值
   * @param  {string} operation 操作符号
   * @param  {any} rValue    右值
   * @return {Boolean} 是否满足等式
   */
 static operationMatch(lValue: any, operation: string, rValue: any) {
    let result = false;
    switch (operation) {
      case 'gt':
        result = lValue > rValue;
        break;
      case 'egt':
        result = lValue >= rValue;
        break;
      case 'lt':
        result = lValue < rValue;
        break;
      case 'elt':
        result = lValue <= rValue;
        break;
      case 'eq':
        // eslint-disable-next-line
        result = lValue == rValue;
        break;
      case 'neq':
        // eslint-disable-next-line
        result = lValue != rValue;
        break;
      case 'heq':
        result = lValue === rValue;
        break;
      case 'nheq':
        result = lValue !== rValue;
        break;
      default:
        break;
    }

    return result;
  }

  /**
   * switch选项解析器
   * @param  {object} options 复杂选项 json 表达式
   * @param  {object} source  元数据
   * @return {any} 任何可能的值
   */
  static switchMapTask(options: any, source: any): any {
    const selectOptions = options.options;
    const defaultValue = options.default;
    let result;

    if (selectOptions && selectOptions.length) {
      const matchItem = _.find(selectOptions, (itemOption) => {
        const leftValue = _.result(source, itemOption.leftSelect);
        const rightValue = itemOption.rightValue ? itemOption.rightValue : (
          itemOption.rightSelect ? _.result(source, itemOption.rightSelect) : null
        );
        return JSONMapperClass.operationMatch(leftValue, itemOption.operation, rightValue);
      });
      result = matchItem && matchItem.result;
    }

    return typeof result !== 'undefined' ? result : defaultValue;
  }

  static ifMapTask(option: any, source: any) {
    const targetSelect = option.targetSelect;
    const defaultSelect = option.defaultSelect;
    const defaultValue = option.default;

    const targetResult = _.result(source, targetSelect);
    const defaultResult = _.result(source, defaultSelect) || defaultValue;

    return !_.isEmpty(targetResult) ? targetResult : defaultResult;
  }


  /**
   * 随机选项
   * @param  {Object} option option
   * @param  {Object} source source
   * @return {any} 返回结果
   */
  static randomProportionMapTask(option: any, source: any) {
    const defaultValue = option.default;
    const options = option.options;

    let result = defaultValue;

    let maxRate = 0;
    if (options && options.length) {
      const matchItems = _.filter(options, (itemOption) => {
        const matchSelects = itemOption.matchSelects;
        const isMatch = _.every(matchSelects, (item) => (_.result(source, item)));
        if (isMatch) {
          maxRate += itemOption.rate;
        }
        return isMatch;
      });

      let randomValue = Math.round(Math.random() * maxRate);
      const matchItem = _.find(matchItems, (item) => {
        randomValue = randomValue - item.rate;
        return randomValue <= 0;
      });

      result = !_.isEmpty(matchItem) ? matchItem.result : defaultValue;
    }

    return result;
  }

  /**
    * 时间数据格式化
    * @param  {Object} option option
    * @param  {Object} source source
    * @return {any} 返回结果
    */
  static momentFormatTask(option: any, source: any) {
    const select = option.select;
    const sourceValue = _.result(source, select);
    const targetFormat = option.format;
    if (sourceValue) {
      return moment(sourceValue).format(targetFormat);
    }
    return '';
  }

  /**
    * 注入到数组中
    * @param  {Object} option option
    * @param  {Object} source source
    * @return {any} 返回结果
    */
  static injectArrTask(option: any, source: any) {
    const select = option.select;
    const data = option.data;
    const sourceValue = _.result(source, select);

    if (sourceValue && _.isArray(sourceValue)) {
      return [
        ...sourceValue,
        ...data,
      ];
    }
    return [
      ...data,
    ];
  }

/**
  * 注入到数组中使用模板方式
  * @param  {Object} option option
  * @param  {Object} source source
  * @return {any} 返回结果
  */
  static injectArrAndTemplateRenderTask(option: any, source: any) {
    const afterInjectArr = JSONMapperClass.injectArrTask(option, source);
    let result: any = _.cloneDeep(afterInjectArr);

    const templateConfig = option.template;

    const sourcePathObj = templateConfig.sourcePath;

    for (const key in sourcePathObj) {
      if (sourcePathObj.hasOwnProperty(key)) {
        const selectPath = sourcePathObj[key];
        const matchStr = `<!-${key}->`;
        const value = _.result(source, selectPath);

        if (value) {
          result = _.map(result, (item) => {
            return item.replace(matchStr, value);
          });
        }
      }
    }

    // 移除未替换的元素
    result = _.filter(result, (item) => !(/<!-/.test(item)));

    // 唯一值
    result = _.uniq(result);

    return result;
  }

  /**
   * 获取应设值
   * @param option options
   * @param source source
   */
  static arrayStrMapperTask(option: any, source: any) {
    const { select, mapper } = option;
    const sourceValues: any = _.result(source, select);

    if (sourceValues) {
      const arr = _.map(sourceValues, (key) => mapper[key]);
      const filterArr = arr.filter((item) => item);

      return filterArr;
    }

    return _.cloneDeep(option.default);
  }

  /**
   * 将选择的数据转换成数组
   * @param option options
   * @param source source
   */
  static arraySelectTask(option: any, source: any) {
    const selects = option.selects;

    let targetValues = _.cloneDeep(option.default);
    targetValues = _.isArray(targetValues) ? targetValues : [];

    const selectsLen = selects.length;

    for (let index = 0; index < selectsLen; index++) {
      const selectPath = selects[index];
      const result = _.result(source, selectPath);

      if (!_.isNull(result) && !_.isUndefined(result)) {
        targetValues = targetValues.concat(result);
      }
    }

    return targetValues;

  }

  static existSelectTask(option: any, source: any) {
    const selectPath = option.select;

    const result = _.result(source, selectPath);

    return !!result;

  }

  /**
   * 将选择的数据转换成md5值
   * @param option options
   * @param source source
   */
  static md5SelectTask(option: any, source: any) {
    const selectPath = option.select;

    const result = _.result(source, selectPath);

    if (result && typeof result === 'string') {
      const md5 = crypto.createHash('md5');
      return md5.update(result).digest('hex');
    }

    return '';
  }

  /**
   * 生成指定范围的随机数
   * @param option options
   */
  static randomNumTask(option: any) {
    const min = option.min || 0;
    const max = option.max || 100;

    const diff = max - min;
    const random = Math.floor(Math.random() * diff);

    return min + random;
  }

  /**
   * 指定字符串最大长度
   * @param option
   * @param source
   */
  static strMaxLenLimitTask(option: any, source: any) {
    const select = option.select;
    const maxLen = option.maxLen;
    const value = _.result(source, select);

    if (typeof value === 'string') {
      const valueLen = value.length;
      if (valueLen > maxLen) {
        return value.slice(0, maxLen) + '...';
      }

      return value;
    }

    return '';
  }
  /**
   * 尝试将字符串转换成num
   * @param option
   * @param source
   */
  static str2numTask(option: any, source: any) {
    const select = option.select;
    let value = option.defaultValue || 0;

    if (select) {
      value = _.toNumber(_.result(source, select)) || value;
    }

    return value;
  }

  /**
   * 尝试将字符串分割成数组
   * @param option
   * @param source
   */
  static splitStr2Aarr(option: any, source: any) {
    const separator = option.separator;
    const selectIndex = option.selectIndex || 0;
    const select = option.select;
    const itemType = option.itemType;
    let defaultValue = option.defaultValue || 0;


    const selectValue: string = _.result(source, select);

    if (!selectValue) {
      return defaultValue;
    }

    let valueArr: any = selectValue.split(separator);

    if (itemType === 'number') {
      valueArr = _.map(valueArr, (item) => _.toNumber(item));
    }


    return valueArr[selectIndex] || defaultValue;
  }

  /**
    * 字符串替换
    * @param option
    * @param source
    */
  static strReplaceTask(option: any, source: any) {
    const select = option.select;
    const substr = option.substr;
    const replacement = option.replacement;
    const sourceValue = _.result(source, select);
    if (typeof sourceValue === 'string' && substr && replacement) {
      return sourceValue.replace(substr, replacement);
    }
    return '';
  }


}
