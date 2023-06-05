const HistoryModel = require('./history.models');

class HistoryServices {
	static async updateHistory({user, role, content, createdAt}) {
		await HistoryModel.create({user, role, content, createdAt});
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
