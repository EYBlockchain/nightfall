import { COLLECTIONS } from '../common/constants';

export default class BlacklistService {
  constructor(_db) {
    this.db = _db;
  }

  /**
   * This function returns blacklisted users
   * @returns {object} blacklist.
   */
  getBlacklistedUsers() {
    return this.db.aggregation(
      COLLECTIONS.BLACKLIST,
      {},
      {
        $project: { users: '$users.name' },
      },
    );
  }

  /**
   * This function blacklist a user
   * @param {object} options - user info
   */
  setUserToBlacklist({ name, address }) {
    return this.db.updateData(
      COLLECTIONS.BLACKLIST,
      {
        'users.name': { $ne: name },
      },
      {
        $push: {
          users: { name, address },
        },
      },
    );
  }

  /**
   * This function unblacklist a user
   * @param {object} options - user info (name & address)
   */
  unsetUserFromBlacklist({ name }) {
    const updateData = {
      $pull: {
        users: { name },
      },
    };
    return this.db.updateData(COLLECTIONS.BLACKLIST, {}, updateData);
  }
}
