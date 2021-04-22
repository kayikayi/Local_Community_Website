/* eslint-disable linebreak-style */

/*usr/bin/env node*/

'use strict'

const Koa = require('koa')
const Router = require('koa-router')
const views = require('koa-views')
const staticDir = require('koa-static')
const bodyParser = require('koa-bodyparser')
const session = require('koa-session')
const sqlite = require('sqlite-async')
const koaBody = require('koa-body')({multipart: true, uploadDir: '.'})

const User = require('./modules/user')
const Flag = require('./modules/flags')
const Votes = require('./modules/votes')

const app = new Koa()
const router = new Router()
let currentUser
let isStaff

const defaultPort = 8080
const port = process.env.PORT || defaultPort
app.keys = ['darkSecret']
app.use(staticDir('public'))
app.use(bodyParser())
app.use(session(app))
app.use(require('koa-static')('.'))
app.use(views(`${__dirname}/views`, { extension: 'handlebars' }, {map: { handlebars: 'handlebars' }}))
const dbName = 'user.db'

//Loading before-login page and cheking if you are authorised
router.get('/', async ctx => {
	try {
		//DRAGOS CODE
		if(ctx.session.authorised !== null || ctx.session.authorised !== true) return ctx.redirect('/h')
		const data ={}
		if(ctx.query.msg) data.msg = ctx.query.msg
		await ctx.render('home')
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})
router.get('/login', async ctx => {
	//DRAGOS CODE
	if (ctx.session.authorised === true) return ctx.redirect('/h')
	const data = {}
	if(ctx.query.msg) data.msg = ctx.query.msg
	if(ctx.query.user) data.user = ctx.query.user
	await ctx.render('login')
})

/* Filtering by the type of the issue or the status of the issue. Made by Evaldas */
router.get('/forum', async ctx => {
	try {
		let sql = `SELECT idflag, title, description, user, statusIssue, typeIssue, date, prioritised
					FROM flagIssue ORDER BY prioritised DESC;`
		let qstring = ''
		if(ctx.query !== undefined && ctx.query.filterStatus !== undefined) {
			sql = `SELECT idflag, title, description, user, statusIssue, typeIssue, date 
			FROM flagIssue WHERE upper(statusIssue) LIKE upper("%${ctx.query.filterStatus}%") 
			OR upper(description) LIKE upper("%${ctx.query.filterStatus}%") 
			OR upper(user) LIKE upper("%${ctx.query.filterStatus}%") 
			OR upper(statusIssue) LIKE upper("%${ctx.query.filterStatus}%") 
			OR upper(typeIssue) LIKE upper("%${ctx.query.filterStatus}%")
			OR upper(prioritised) LIKE upper("%${ctx.query.filterStatus}%");`
			qstring = ctx.query.filterStatus
		}
		const db = await sqlite.open(dbName)
		const data = await db.all(sql)
		await db.close()

		const votes = await new Votes(dbName)
		const totalVotes = await votes.countTotalIssues()

		for(let i = 0; i< totalVotes.length; i++) {
			for(let j = 0; j< data.length; j++) {
				if(data[j]['idflag']===totalVotes[i]['idflag']) {
					totalVotes[i] = totalVotes[i]['COUNT(idflag)']
					data[j].totalVotes=totalVotes[i]
				} else if(!('totalVotes' in data[j] === true)) {
					data[j].totalVotes = 0
				}
				if(data[j].totalVotes >= 3) {
					const prioritise = await new Flag(dbName)
					await prioritise.prioritising(data[j].idflag,'yes')
				}
			}
		}

		console.log(isStaff)
		if(isStaff===false)
			return await ctx.render('forum', {posting: data, query: qstring})
		console.log(isStaff)
		await ctx.render('forumStaff', {posting: data, query: qstring})
	} catch(err) {
		await ctx.render('error', {message: err})
	}
})

//Redirecting you to the home page
router.get('/register', async ctx => {
	if (ctx.session.authorised === true) return ctx.redirect('/h', {username: this.currentUser})
	await ctx.render('register')
})
router.get('/about', async ctx => await ctx.render('aboutUs'))
router.get('/home', async ctx => {
	if (ctx.session.authorised === true) return ctx.redirect('/h', {username: this.currentUser})
	await ctx.render('home')
})
router.get('/error', async ctx => await ctx.render('error'))
router.get('/postIssue', async ctx => {
	if (!ctx.session.authorised)
		await ctx.redirect('/logout?msg=You%20are%20no%20allowed%20to%20access%20this%20page')
	await ctx.render('postIssue' ,{user: currentUser})
})
router.get('/h', async ctx => {
	//DRAGOS CODE
	if (!ctx.session.authorised)
		await ctx.redirect('/logout?msg=You%20are%20no%20allowed%20to%20access%20this%20page')
	if (ctx.query.user) currentUser = ctx.query.user
	await ctx.render('nav', {username: currentUser})
})
router.get('/logout', async ctx => {
	//DRAGOS CODE
	ctx.session.authorised = false
	if (ctx.query.msg)
		ctx.redirect(`/login?msg=${ctx.query.msg}`)
	else
		ctx.redirect('/home')
})
//Sending the data to the register function and adding the data to the database
router.post('/register', koaBody , async ctx => {
	try {
		//DRAGOS CODE
		const body = ctx.request.body
		console.log(body)
		const user = await new User(dbName)
		await user.register(body.user ,body.address ,body.postcode ,body.email ,body.pass)
		ctx.session.authorised = true
		const sql = `SELECT user,staff FROM users WHERE user="${body.user}";`
		this.db = await sqlite.open(dbName)
		const data = await this.db.get(sql)
		if(data.staff === 'true')
			isStaff=true
		else isStaff=false
		user.db.close()
		return ctx.redirect(`/h?user=${user.currentUser}`)
	} catch(err) {
		await ctx.render('error', {message: err})
	}
})
//Sending the username and password to the function
router.post('/login', async ctx => {
	try {
		//DRAGOS CODE
		const body = ctx.request.body
		const user = await new User(dbName)
		await user.login(body.user, body.pass)
		ctx.session.authorised = true
		const sql = `SELECT user,staff FROM users WHERE user="${body.user}";`
		this.db = await sqlite.open(dbName)
		const data = await this.db.get(sql)
		if(data.staff === 'true')
			isStaff=true
		else isStaff=false
		user.db.close()
		return ctx.redirect(`/h?user=${user.currentUser}`)
	} catch(err) {
		await ctx.render('error', {message: err.message})
	}
})
//MAIN PAGE AFTER LOGIN
router.post('/h', async ctx => {
	try {
		//DRAGOS CODE
		const body = ctx.request.body
		console.log(body)
		const user = await new User(dbName)
		await user.changepass(currentUser, body.pass, body.newpass)
		user.db.close()
		return ctx.redirect('/h',{username: ctx.session.user})
	} catch(err) {
		await ctx.render('error', {message: err})
	}
})

router.post('/post', async ctx => {
	try {
		const body = ctx.request.body
		console.log(body)
		const curentDay = new Date()
		const date = curentDay.getDate()+'/'+(curentDay.getMonth()+1)+'/'+curentDay.getFullYear()
		const flagIssue = await new Flag(dbName)
		await flagIssue.postIssue(currentUser , body.title, body.typeIssue ,body.location ,body.description, date, body.postcode)
		flagIssue.db.close()
		ctx.redirect('/Forum')
	} catch(err) {
		await ctx.render('error', {message: err})
	}
})

router.post('/forumstatus', async ctx => {
	try {
		const body = ctx.request.body
		console.log(body)
		const flagIssue = await new Flag(dbName)
		await flagIssue.statusIssue(body.idflag, body.statusIssue)
		flagIssue.db.close()
		ctx.redirect('/forum')
	} catch(err) {
		await ctx.render('error', {message: err})
	}
})

router.post('/forumprioritising', async ctx => {
	try {
		const body = ctx.request.body
		console.log(body)
		const flagIssue = await new Flag(dbName)
		const test = await flagIssue.prioritising(body.idflag, body.prioritised)
		console.log(test)
		flagIssue.db.close()
		ctx.redirect('/forum')
	} catch(err) {
		await ctx.render('error', {message: err})
	}
})

router.post('/forumvote', async ctx => {
	try {
		const body = ctx.request.body
		const user = await new User(dbName)
		const data = await user.getUserID(currentUser)
		user.db.close()
		const votes = await new Votes(dbName)
		let voted = await votes.countUserVotes(body.idflag, data.id)
		voted = voted['COUNT(*)']
		if(voted===0) {
			await votes.voteIssue(body.idflag, data.id)
			votes.db.close()
			ctx.redirect('/forum')
		} else{
			await ctx.render('error', {message: 'You\'ve already voted'})
		}
	} catch(err) {
		await ctx.render('error', {message: err})
	}
})

app.use(router.routes())
module.exports = app.listen(port, () => console.log(`Listening on port ${port}`))
