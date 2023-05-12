'use strict';
const { postData } = require('./postData.js');
const { RealmAPIError, RealmError, ErrorCodes } = require('../Errors/');

module.exports.get = async function(guildId, userId)
{
  const path = 'chronicle/member/defaults/get';
  const data = {
    guild_id: guildId,
    channel_id: channelId
  }

  const res = await postData(path, data);
  switch(res?.status)
  {
    case 200: // Updated
      return res.data.defaults;
    case 204: // No defaults
      return null;
    default:
      throw new RealmAPIError({cause: `res: ${res?.status}\ndata: ${JSON.stringify(data)}`});
  }
}

module.exports.set = async function(guildId, userId, name, autoHunger)
{
  const path = 'chronicle/member/defaults/set';
  const data = {
    user_id: userId,
    guild_id: guildId,
    character_name: name,
    auto_hunger: autoHunger
  }

  const res = await postData(path, data);
  switch(res?.status)
  {
    case 200: // Updated
      return;
    case 204: // No Character
      throw new RealmError({code: ErrorCodes.NoCharacter});
    default:
      throw new RealmAPIError({cause: `res: ${res?.status}\ndata: ${JSON.stringify(data)}`});
  }
}