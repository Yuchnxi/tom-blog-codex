'use strict';

const Controller = require('egg').Controller;

class DashboardController extends Controller {
  async stats() {
    const data = await this.ctx.service.dashboard.stats();
    this.ctx.success(data);
  }
}

module.exports = DashboardController;
