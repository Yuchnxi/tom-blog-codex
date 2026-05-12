'use strict';

const Service = require('egg').Service;

const EMPTY_PROFILE = {
  avatar: '',
  nickname: '',
  bio: '',
  description: '',
  email: '',
  github: '',
};

class ProfileService extends Service {
  normalize(profile) {
    if (!profile) {
      return { ...EMPTY_PROFILE };
    }

    const data = profile.toJSON ? profile.toJSON() : profile;
    return {
      id: data.id,
      avatar: data.avatar || '',
      nickname: data.nickname || '',
      bio: data.bio || '',
      description: data.description || '',
      email: data.email || '',
      github: data.github || '',
      created_at: data.created_at || data.createdAt,
      updated_at: data.updated_at || data.updatedAt,
    };
  }

  async get() {
    const profile = await this.ctx.model.Profile.findOne({
      order: [[ 'id', 'ASC' ]],
    });
    return this.normalize(profile);
  }

  async save(payload) {
    const data = {
      avatar: payload.avatar || '',
      nickname: payload.nickname || '',
      bio: payload.bio || '',
      description: payload.description || '',
      email: payload.email || '',
      github: payload.github || '',
    };

    let profile = await this.ctx.model.Profile.findOne({
      order: [[ 'id', 'ASC' ]],
    });

    if (!profile) {
      profile = await this.ctx.model.Profile.create(data);
      return this.normalize(profile);
    }

    await profile.update(data);
    return this.normalize(profile);
  }
}

module.exports = ProfileService;
