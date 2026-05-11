'use strict';

module.exports = {
  success(data = null, message = 'success') {
    this.body = {
      code: 0,
      message,
      data,
    };
  },

  fail(message = '请求失败', status = 400, data = null) {
    this.status = status;
    this.body = {
      code: 1,
      message,
      data,
    };
  },
};
