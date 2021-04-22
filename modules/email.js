'use strict'

//the function is exported so it can be used from another file
module.exports = class Email {
	async sendEmail(issuetype, name, recipient, title) {
		//makes sure nodemailer is installed
		const nodemailer = require('nodemailer')
		//sets up the account which will send the email
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: '5001community@gmail.com',
				pass: 'local5001community'
			}
		})

		let mailOptions = {from: '',to: '',subject: '',text: ''}
		//structures the email with items like recipient, subject and text
		mailOptions = {
			from: '5001community@gmail.com',
			to: recipient,
			subject: 'Issue update',
			//example email: Your issue regarding noise has been allocated. Thanks for letting us know.
			text: 'Dear ' + name + `,
		Your issue regarding `+ title +' has been '+ issuetype +`. Thanks for letting us know. 
		Regards,
		Dragos Community`
		}
		//this is an async function because the program should wait for the email to send before doing anything else otherwise an error will show
		async function send() {
			//sends the above structured email with the nodemailer transporter from earlier
			await transporter.sendMail(mailOptions, (error, info) => {
				//standard error handling
				if (error) {
					console.log(error)
				} else {
					console.log('Email sent.' + info)
				}
			}
			)
		}
		//actually runs the function above, sending the email
		send()
	}
}
