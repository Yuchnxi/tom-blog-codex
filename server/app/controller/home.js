'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = {
      code: 0,
      message: 'success',
      data: {
        name: 'tom-blog-server',
      },
    };
  }
}

module.exports = HomeController;
