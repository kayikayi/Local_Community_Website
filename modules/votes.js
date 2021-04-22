'use strict'
const sqlite = require('sqlite-async')

module.exports = class Votes {

	constructor(dbName = '../user.db') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			const sql = `CREATE TABLE IF NOT EXISTS votes
			(idflag INTEGER, id INTEGER, PRIMARY KEY (id, idflag),
			FOREIGN KEY (id) REFERENCES users (id) FOREIGN KEY (idflag)
			REFERENCES flagIssue (idflag))`
			await this.db.run(sql)
			return this
		})()
	}

	async voteIssue(idflag, userID) {
		try{
			const sql = `INSERT INTO votes(idflag, id) VALUES (${idflag}, ${userID});`
			await this.db.run(sql)
			return true
		} catch(err) {
			throw err
		}
	}

	async countUserVotes(idflag, iduser) {
		try{
			const sql = `SELECT COUNT(*) FROM votes WHERE idflag = ${idflag} AND id = ${iduser}`
			const data = await this.db.get(sql)
			return data
		} catch(err) {
			throw err
		}
	}


	async countTotalIssues() {
		try{
			const sql = 'SELECT idflag, COUNT(idflag) FROM votes GROUP BY idflag;'
			const data = await this.db.all(sql)
			return data
		} catch(err) {
			throw err
		}
	}
}
