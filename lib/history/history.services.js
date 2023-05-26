const UserModel = require('../user/user.models');
const HistoryModel = require('./history.models');

class HistoryServices {
	static async updateHistory({userID, role, content, createdAt}) {
		const user = await UserModel.create({userID, role, content, createdAt});

		if (!user) {
			throw new Error('User not found');
		}
	}

	/**
	 * Gets the history of a user
	 * @param {string} phoneNumber The phone number of the user
	 */
	static async getHistory(userID) {
		const histories = await HistoryModel.find({user: userID});
		return histories;
	}
}

module.exports = HistoryServices;
