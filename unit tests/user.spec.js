/* eslint-disable linebreak-style */
'use strict'

// DRAGOS CODE
const Accounts = require('../modules/user.js')

describe('register()', () => {

	test('register a valid account', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		const register = await account.register('doej','1234' ,'cv1' ,'email' , 'password')
		expect(register).toBe(true)
		done()
	})

	test('register a duplicate username', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await account.register('doej','1234' ,'cv1' ,'email' , 'password')
		await expect( account.register('doej','1234' ,'cv1' ,'email' , 'password') )
			.rejects.toEqual( Error('Username "doej" already in use') )
		done()
	})

	test('error if blank username', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await expect( account.register('', 'password') )
			.rejects.toEqual( Error('Missing username') )
		done()
	})

	test('error if blank address', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await expect( account.register('doej','' ,'postcode' ,'email', 'password') )
			.rejects.toEqual( Error('Missing address') )
		done()
	})

	test('error if blank postcode', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await expect( account.register('doej','address' ,'' ,'email', 'password') )
			.rejects.toEqual( Error('Missing postcode') )
		done()
	})
	test('error if blank email', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await expect( account.register('doej','address' ,'postcode' ,'', 'password') )
			.rejects.toEqual( Error('Missing email') )
		done()
	})

	test('error if blank password', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await expect( account.register('doej','address' ,'postcode' ,'email', '') )
			.rejects.toEqual( Error('Missing password') )
		done()
	})

})

describe('login()', () => {
	test('log in with valid credentials', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await account.register('doej','address','postcode','email', 'password')
		const valid = await account.login('doej', 'password')
		expect(valid).toBe(true)
		done()
	})

	test('invalid username', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await account.register('doej','address','postcode','email', 'password')
		await expect( account.login('roej', 'password') )
			.rejects.toEqual( Error('Username "roej" not found') )
		done()
	})

	test('invalid password', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await account.register('doej','address','postcode','email', 'password')
		await expect( account.login('doej', 'bad') )
			.rejects.toEqual( Error('invalid password for account "doej"') )
		done()
	})

})

describe('changepass()', () => {

	test('correct change of password', async done => {
		expect.assertions(1)
		const account = await new Accounts(':memory:')
		await account.register('doej','address','postcode','email', 'password')
		const valid = await account.changepass('doej', 'password', 'pass')
		expect(valid).toBe(true)
		done()
	})

})
// END OF DRAGOS CODE

describe('getUserID()', () => {
	test('passing no argument', async done => {
		expect.assertions(1)
		const user = await new Accounts()
		await expect(user.getUserID()).rejects.toEqual(Error('User undefined'))
		done()
	})

	test('passing number as id', async done => {
		expect.assertions(1)
		const user = await new Accounts()
		await expect(user.getUserID(12)).rejects.toEqual(Error('User cannot be numbers'))
		done()
	})
})
