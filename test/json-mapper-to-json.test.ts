import JSONMapperClass from '../src/json-mapper-to-json'
import * as moment from 'moment';

/**
 * JSONMapperClass test
 */
describe('JSONMapperClass test', () => {
  it('works if true is truthy', () => {
    expect(true).toBeTruthy()
  })

  it('JSONMapperClass is instantiable', () => {
    expect(new JSONMapperClass()).toBeInstanceOf(JSONMapperClass)
  })

  describe('strReplaceTask', () => {
    it('strReplaceTask job success', () => {
      const option = {
        select: 'target',
        substr: '123',
        replacement: 'sub',
      }

      const source = {
        target: '123567',
      }

      const actual = JSONMapperClass.strReplaceTask(option, source);
      const expected = 'sub567';

      expect(actual).toEqual(expected);

    });
    it('strReplaceTask job fail', () => {
      const option = {
        select: 'target',
        substr: '',
        replacement: 'sub',
      }

      const source = {
        target: '123567',
      }

      const actual = JSONMapperClass.strReplaceTask(option, source);
      const expected = '';

      expect(actual).toEqual(expected);

    });
  });

  describe('splitStr2Aarr', () => {
    it('splitStr2Aarr job success', () => {
      const option = {
        select: 'osVersion',
        itemType: 'number',
        separator: '.',
        defaultValue: 4,
        selectIndex: 1,
      }

      const source = {
        osVersion: '2.3.4',
      }

      const actual = JSONMapperClass.splitStr2Aarr(option, source);
      const expected = 3;

      expect(actual).toEqual(expected);
    });

    it('splitStr2Aarr job success with default', () => {
      const option = {
        select: 'osVersion',
        itemType: 'number',
        separator: '.',
        defaultValue: 4,
        selectIndex: 1,
      }

      const source = {
        osVersion: '2',
      }

      const actual = JSONMapperClass.splitStr2Aarr(option, source);
      const expected = 4;

      expect(actual).toEqual(expected);
    });
  });

  describe('str2numTask', () => {
    it('str2numTask job success', () => {
      const option = {
        select: 'v',
        defaultValue: 50,
      }

      const source = {
        v: '0100',
      }

      const actual = JSONMapperClass.str2numTask(option, source);
      const expected = 100;

      expect(actual).toEqual(expected);
    });

    it('str2numTask job success with default', () => {
      const option = {
        select: 'v',
        defaultValue: 0,
      }

      const source = {
        c: '0100',
      }

      const actual = JSONMapperClass.str2numTask(option, source);
      const expected = 0;

      expect(actual).toEqual(expected);
    });
  });

  describe('strMaxLenLimitTask', () => {
    it('strMaxLenLimitTask job success', () => {
      const option = {
        select: 'str',
        maxLen: 5,
      }

      const source = {
        str: 'is a test str',
      }

      const actual = JSONMapperClass.strMaxLenLimitTask(option, source);
      const expected = 'is a ...';

      expect(actual).toEqual(expected);
    });

    it('strMaxLenLimitTask job success with all', () => {
      const option = {
        select: 'str',
        maxLen: 100,
      }

      const source = {
        str: 'is a test str',
      }

      const actual = JSONMapperClass.strMaxLenLimitTask(option, source);
      const expected = 'is a test str';

      expect(actual).toEqual(expected);
    });

    it('strMaxLenLimitTask job success with fail', () => {
      const option = {
        select: 'str',
        maxLen: 100,
      }

      const source = {
        str: {},
      }

      const actual = JSONMapperClass.strMaxLenLimitTask(option, source);
      const expected = '';

      expect(actual).toEqual(expected);
    });
  });

  describe('randomNumTask', () => {
    it('randomNumTask job success', () => {
      const option = {
        min: 50,
        max: 100,
      };

      const actual = JSONMapperClass.randomNumTask(option);

      expect(actual >= 50);
      expect(actual <= 100);
    });

    it('randomNumTask job success with default', () => {
      const option = {};

      const actual = JSONMapperClass.randomNumTask(option);

      expect(actual >= 0);
      expect(actual <= 100);
    });
  });

  describe('md5SelectTask', () => {
    it('md5SelectTask job success', () => {
      const option = {
        select: 'md5',
      }

      const source = {
        md5: '123',
      }

      const actual = JSONMapperClass.md5SelectTask(option, source);
      const expected = '202cb962ac59075b964b07152d234b70';

      expect(actual).toEqual(expected);
    });

    it('md5SelectTask job failed', () => {
      const option = {
        select: 'v',
        defaultValue: 0,
      }

      const source = {
        md5: {},
      }

      const actual = JSONMapperClass.md5SelectTask(option, source);
      const expected = '';

      expect(actual).toEqual(expected);
    });
  });

  describe('existSelectTask', () => {
    it('existSelectTask job success', () => {
      const option = {
        select: 'md5',
      }

      const source = {
        md5: '123',
      }

      const actual = JSONMapperClass.existSelectTask(option, source);

      expect(actual).toEqual(true);
    });

    it('existSelectTask job failed', () => {
      const option = {
        select: 'v',
        defaultValue: 0,
      }

      const source = {
        t: {},
      }

      const actual = JSONMapperClass.existSelectTask(option, source);

      expect(!actual);
    });
  });


  describe('arraySelectTask', () => {
    it('arraySelectTask job success', () => {
      const option = {
        selects: ['c','s','t'],
        default: ['t'],
      }

      const source = {
        c: '123',
        s: '567',
        t: '890',
      }

      const actual = JSONMapperClass.arraySelectTask(option, source);
      const expected = ['123', '567', '890'];

      expect(actual).toEqual(expect.arrayContaining(expected));
    });

    it('arraySelectTask job success with null undefined', () => {
      const option = {
        selects: ['c','s','t'],
        default: ['t'],
      }

      const source = {
        c: '123',
        s: null,
        t: undefined,
      }

      const actual = JSONMapperClass.arraySelectTask(option, source);
      const expected = ['123'];

      expect(actual).toEqual(expect.arrayContaining(expected));
    });

    it('arraySelectTask job failed', () => {
      const option = {
        selects: ['c', 's', 't'],
        default: ['t'],
      }

      const source = {
      }

      const actual = JSONMapperClass.arraySelectTask(option, source);
      const expected = ['t'];

      expect(actual).toEqual(expect.arrayContaining(expected));
    });
  });


  describe('arrayStrMapperTask', () => {
    it('arrayStrMapperTask job success', () => {
      const option = {
        select: 'c',
        mapper: {
          '娱乐': 1001,
          '体育': 1002,
          '手机': 1005,
          '财经': 1006,
        },
      };

      const source = {
        c: ['娱乐', '体育'],
      }

      const actual = JSONMapperClass.arrayStrMapperTask(option, source);
      const expected = [ 1001, 1002 ];

      expect(actual).toEqual(expect.arrayContaining(expected));
    });

    it('arrayStrMapperTask job with default', () => {
      const option = {
        select: 'c',
        mapper: {
          '娱乐': 1001,
          '体育': 1002,
          '手机': 1005,
          '财经': 1006,
        },
        default: [ 1001 ],
      };

      const source = {
        t: ['娱乐2'],
      }

      const actual = JSONMapperClass.arrayStrMapperTask(option, source);
      const expected = [ 1001 ];

      expect(actual).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('injectArrTask', () => {
    it('injectArrTask job success', () => {
      const option = {
        select: 'c',
        data: [1, 2],
      };

      const source = {
        c: ['娱乐', '体育'],
      }

      const actual = JSONMapperClass.injectArrTask(option, source);
      const expected = ['娱乐', '体育', 1, 2];

      expect(actual).toEqual(expect.arrayContaining(expected));
    });

    it('injectArrTask job with default', () => {
      const option = {
        select: 'c',
        data: [ '1' ],
      };

      const source = {
        t: ['娱乐2'],
      }

      const actual = JSONMapperClass.injectArrTask(option, source);
      const expected = ['1'];

      expect(actual).toEqual(expect.arrayContaining(expected));
    });
  });


  describe('injectArrAndTemplateRenderTask', () => {
    it('injectArrAndTemplateRenderTask job success', () => {
      const option = {
        select: 'c',
        data: [ 'ab' ],
        template: {
          sourcePath: {
            source: 'target',
          },
        },
      };

      const source = {
        c: [ '123<!-source->'] ,
        target: '567'
      }

      const actual = JSONMapperClass.injectArrAndTemplateRenderTask(option, source);
      const expected = ['ab', '123567'];

      expect(actual).toEqual(expect.arrayContaining(expected));
    });

    it('injectArrAndTemplateRenderTask job with default', () => {
      const option = {
        select: 'c',
        data: ['ab'],
        template: {
          sourcePath: {
            source: 'target',
          },
        },
      };

      const source = {
        c: ['123<!-source->'],
      }

      const actual = JSONMapperClass.injectArrAndTemplateRenderTask(option, source);
      const expected = ['ab'];

      expect(actual).toEqual(expect.arrayContaining(expected));
    });
  });

  describe('momentFormatTask', () => {
    it('momentFormatTask job success', () => {
      const option = {
        select: 'c',
        format: 'YYYY-MM-DD',
      };

      const source = {
        c: new Date(),
      }

      const actual = JSONMapperClass.momentFormatTask(option, source);
      const expected = moment().format('YYYY-MM-DD');

      expect(actual).toEqual(expected);
    });

    it('momentFormatTask job with failed', () => {
      const option = {
        select: 'c',
      };

      const source = {
        c: '',
      }

      const actual = JSONMapperClass.momentFormatTask(option, source);
      const expected = '';

      expect(actual).toEqual(expected);
    });
  });

  describe('randomProportionMapTask', () => {
    it('randomProportionMapTask job success', () => {
      const option = {
        default: 1,
        options: [
          { result: 0, label: '显示描述', rate: 50, matchSelects: ['desc'] },
          { result: 1, label: '显示来源日期', rate: 50, matchSelects: ['src', 'time'] },
        ],
      };

      const source = {
        desc: '1',
      }

      const actual = JSONMapperClass.randomProportionMapTask(option, source);
      const expected = 0;

      expect(actual).toEqual(expected);
    });

    it('randomProportionMapTask job with failed', () => {
      const option = {
        default: 1,
        options: [
          { result: 0, label: '显示描述', rate: 50, matchSelects: ['desc'] },
          { result: 1, label: '显示来源日期', rate: 50, matchSelects: ['src', 'time'] },
        ],
      };

      const source = {
        c: '',
      }

      const actual = JSONMapperClass.randomProportionMapTask(option, source);
      const expected = 1;

      expect(actual).toEqual(expected);
    });
  });

  describe('ifMapTask', () => {
    it('ifMapTask job success with targetSelect', () => {
      const option = {
        targetSelect: 'c',
        defaultSelect: 'v',
        default: 10,
      };

      const source = {
        c: '1',
      }

      const actual = JSONMapperClass.ifMapTask(option, source);
      const expected = '1';

      expect(actual).toEqual(expected);
    });

    it('ifMapTask job success with default', () => {
      const option = {
        targetSelect: 'c',
        defaultSelect: 'v',
        default: 10,
      };

      const source = {
        f: '2',
      }

      const actual = JSONMapperClass.ifMapTask(option, source);
      const expected = 10;

      expect(actual).toEqual(expected);
    });
    it('ifMapTask job success with defaultSelect', () => {
      const option = {
        targetSelect: 'c',
        defaultSelect: 'v',
        default: 10,
      };

      const source = {
        v: '2',
      }

      const actual = JSONMapperClass.ifMapTask(option, source);
      const expected = '2';

      expect(actual).toEqual(expected);
    });
  });

  describe('switchMapTask', () => {
    it('switchMapTask job success with targetSelect', () => {
      const option = {
        default: 1,
        options: [
          { result: 2, label: '多图', leftSelect: 'images.length', operation: 'gt', rightValue: 2 },
          { result: 9, label: '视频类', leftSelect: 'categoryName', operation: 'eq', rightValue: '视频' },
          { result: 1, label: '图文', select: 'coverImage', operation: 'eq', rightValue: true },
          { result: 0, label: '大图', leftSelect: 'coverImage', operation: 'eq', rightValue: true },
          // 避免过短, 无意义的数据
        ],
      };

      const source = {
        images: [1,2,3],
      }

      const actual = JSONMapperClass.switchMapTask(option, source);
      const expected = 2;

      expect(actual).toEqual(expected);
    });
  });
})
