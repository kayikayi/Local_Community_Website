'use strict'
// EVALDAS CODE
const sqlite = require('sqlite-async')
const Email = require('./email')
module.exports = class Flag {

	constructor(dbName = '../user.db') {
		return (async() => {
			//DRAGOS CODE
			this.db = await sqlite.open(dbName)
			const sql = `CREATE TABLE IF NOT EXISTS flagIssue 
			(idflag INTEGER PRIMARY KEY AUTOINCREMENT,user TEXT NOT NULL,
			statusIssue TEXT, title TEXT , typeIssue TEXT, location TEXT, 
			prioritised TEXT, description TEXT, date TEXT, email TEXT, postcode TEXT)`
			await this.db.run(sql)
			return this
		})()
	}

	async postIssue(user, title, typeIssue, location, description, date, postcode) {
		try{
			const prioritised = 'no'
			const statusIssue = 'reported'
			const gettingEmail = `SELECT email FROM users WHERE user = "${user}"`
			const userEmail = await this.db.get(gettingEmail)
			const sql = `INSERT INTO flagIssue(user, statusIssue, title, typeIssue, location, prioritised, description, date, email, postcode) VALUES ("${user}", "${statusIssue}","${title}" ,"${typeIssue}" ,"${location}", "${prioritised}","${description}", "${date}","${userEmail.email}", "${postcode}")`
			await this.db.run(sql)
			return true
		} catch(err) {
			throw err
		}
	}

	async statusIssue(idflag, statusIssue) {
		try{
			const sql = `UPDATE flagIssue SET statusIssue= "${statusIssue}" WHERE idflag= ${idflag};`
			await this.db.run(sql)
			const issuedata = `SELECT user,statusIssue,typeIssue,email,title FROM flagIssue WHERE idflag = ${idflag}`
			const something = await this.db.get(issuedata)
			const nowDay = new Date()
			const newDate = nowDay.getDate()+'/'+(nowDay.getMonth()+1)+'/'+nowDay.getFullYear()
			const postissue = `UPDATE flagIssue SET date = "${newDate}" WHERE idflag = ${idflag}`
			await this.db.run(postissue)
			const email = await new Email()
			await email.sendEmail(something.statusIssue, something.user, something.email, something.title)
			return true
		} catch(err) {
			throw err
		}
	}

	async prioritising(idflag, prioritised) {
		try{
			const sql = `UPDATE flagIssue SET prioritised = "${prioritised}" WHERE idflag = ${idflag};`
			await this.db.run(sql)
			return true
		} catch(err) {
			throw err
		}
	}

	async getPostcode(idflag){
		try{
			let sql = `SELECT postcode,title,statusIssue FROM flagIssue WHERE idflag = ${idflag};`   // this will get the postcode, status, title where they belong to the same row by idflag
			let postcode = await this.db.get(sql)   // this will create a variable which will hold all of the selected elements from db
			return true
		} catch { 
			throw err
		}
	}
}
