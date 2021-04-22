module.exports = class Test {

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

	async postingPostcode() {
		try{
			const sql = 'SELECT postcode FROM flagIssue;'
			const postcode = await this.db.all(sql)
			return true
		} catch(err) {
			throw err
		}
	}
	async marker() {
		const apikey = '607b1ae7ee3a49f8b1329dd170f20b9e'
		const postcode= this.postingPostcode.postcode
		const api_url = 'https://api.opencagedata.com/geocode/v1/json'
		const request_url = api_url
			+ '?'
			+ 'key=' + apikey
			+ '&q=' + encodeURIComponent(postcode);
		+ '&pretty=1'
			+ '&no_annotations=1'
		fetch(request_url)
			.then((response) => response.json()).then((data) => {
				//console.log(data);
				const lat2 = data.results[0].geometry.lat
				const lan2 = data.results[0].geometry.lng
				L.marker([lat, lan]).addTo(mymap).bindPopup('Pothole near bus stop, Deep pothole near bus stop at Far Gosford Street, undefined').openPopup()
				L.marker([52.40954, -1.5377228]).addTo(mymap).bindPopup('Rubbish all around, A lot of trash bags by sidewalk, reported').openPopup()


			}).catch((error) => {
				console.error('could not find the file')
				console.error(error)
			})
	};
	async locations() {
		navigator.geolocation.getCurrentPosition((possition) => {

			lat1= possition.coords.latitude
			lon1=possition.coords.longitude
			lat2= marker.lat2
			lon2 = marker.lon2
			console.log(lat1, lon1, lat2, lon2)
			const R = 6371 // Radius of the earth in km
			const dLat = deg2rad(lat2-lat1) // deg2rad below
			const dLon = deg2rad(lon2-lon1)
			const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
			const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
			const d = R * c // Distance in km
			console.log(d)
			return d
		})
	}

	async deg2rad(deg) {
		return deg * (Math.PI/180)
	}
}
location()
