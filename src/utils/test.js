const expect = require('expect');
const { getOptions } = require('./dbUtils');
const { VALID } = require('../../db/constants');

describe('getOptions - Exam service', () => {
  const expectedKeywords = [
    'pageNo', 'limit', 'status',
    'createdBy', 'subjectId',
    'studentId', 'examDate', 'grade'
  ];
  const whereKeyWords = [
    'status', 'createdBy', 'subjectId',
    'studentId', 'examDate', 'grade'
  ];

  it('constructions filter, sort and pagination keywords', async () => {
    const queryParams = {
      limit: 5, pageNo: 3, subjectId: 23, status: VALID
    };
    const actual = await getOptions(expectedKeywords, whereKeyWords, queryParams);
    expect(actual).toEqual({
      limit: 5, offset: 10, where: { subjectId: 23, status: VALID }
    });
  });

  it('does not add offset when either limit and offset not in queryParams', async () => {
    const queryParams = {
      contour: 20, limit: 23, subjectId: 23, status: VALID, drive: true
    };
    const actual = await getOptions(expectedKeywords, whereKeyWords, queryParams);
    expect(actual).toEqual({ limit: 23, where: { subjectId: 23, status: VALID } });
  });

  it('removes key, value not in specified expected keywords', async () => {
    const queryParams = {
      contour: 20, maten: 23, subjectId: 23, status: VALID, drive: true
    };
    const actual = await getOptions(expectedKeywords, whereKeyWords, queryParams);
    expect(actual).toEqual({ where: { subjectId: 23, status: VALID } });
  });
});
