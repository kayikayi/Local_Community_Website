/* eslint-disable linebreak-style */
/* eslint-disable complexity */
/* eslint-disable max-len */
/* eslint-disable linebreak-style */
'use strict'

//Dragos-Code

const bcrypt = require('bcrypt-promise')
//const mime = require('mime-types')
const sqlite = require('sqlite-async')
const saltRounds = 10

module.exports = class User {

	constructor(dbName = '../user.db') {
		return (async() => {
			this.db = await sqlite.open(dbName)
			// we need this table to store the user accounts
			const sql = 'CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT NOT NULL, address TEXT, postcode TEXT, email TEXT, pass TEXT, staff TEXT, ward TEXT);'
			await this.db.run(sql)
			return this
		})()
	}

	async register(user ,address ,postcode, email, pass) {
		try {
			if(user.length === 0) throw new Error('Missing username')
			if(address.length === 0) throw new Error('Missing address')
			if(postcode.length === 0) throw new Error('Missing postcode')
			if(email.length === 0) throw new Error('Missing email')
			if(pass.length === 0) throw new Error('Missing password')
			let sql = `SELECT COUNT(id) as records FROM users WHERE user="${user}";`
			const data = await this.db.get(sql)
			if(data.records !== 0) throw new Error(`Username "${user}" already in use`)
			pass = await bcrypt.hash(pass, saltRounds)
			const staff = false
			const ward = 'number'
			sql = `INSERT INTO users(user ,address ,postcode ,email , pass, staff, ward) VALUES("${user}", "${address}" ,"${postcode}" ,"${email}" , "${pass}","${staff}","${ward}")`
			await this.db.run(sql)
			this.currentUser = user
			return true
		} catch(err) {
			throw err
		}
	}

	async login(username, password) {
		try {
			let sql = `SELECT count(id) AS count FROM users WHERE user="${username}";`
			const records = await this.db.get(sql)
			if(!records.count) throw new Error(`Username "${username}" not found`)
			sql = `SELECT pass FROM users WHERE user = "${username}";`
			const record = await this.db.get(sql)
			const valid = await bcrypt.compare(password, record.pass)
			if(valid === false) throw new Error(`invalid password for account "${username}"`)
			this.currentUser = username
			return true
		} catch(err) {
			throw err
		}
	}

	async changepass(user, pass, newpass) {
		try{
			/*const sql = `SELECT pass FROM users WHERE user = "${user}";`
			const record = await this.db.get(sql)
			const valid = await bcrypt.compare(pass, record.pass)
			if(valid === false) throw new Error(`Invalid password for account "${user}"`)*/
			const hashedPass = await bcrypt.hash(pass, saltRounds)
			const valid = await bcrypt.compare(newpass, hashedPass)
			if(valid === true) throw new Error('Passwords are the same')
			const newHasedPass = await bcrypt.hash(newpass, saltRounds)
			const sql = `UPDATE users SET pass = "${newHasedPass}" WHERE user = "${user}"`
			await this.db.run(sql)
			return true
		} catch(err) {
			throw err
		}
	}
	/**Dragos-Code */

	async getUserID(currentUser) {
		try{
			if(currentUser === undefined) throw new Error('User undefined')
			if(!isNaN(currentUser)) throw new Error('User cannot be numbers')
			const sql = `SELECT id FROM users WHERE user="${currentUser}";`
			const data = await this.db.get(sql)
			return data
		} catch(err) {
			throw err
		}
	}
}
