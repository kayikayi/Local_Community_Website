let lat1, lon1
const lat2 = 52.3696
const lon2 = -1.47999
const apikey = '607b1ae7ee3a49f8b1329dd170f20b9e'
const postcode = 'CV15PA'
const api_url = 'https://api.opencagedata.com/geocode/v1/json'
const request_url = api_url
    + '?'
    + 'key=' + apikey
    + '&q=' + encodeURIComponent(postcode);
+ '&pretty=1'
    + '&no_annotations=1'

function locations() {
	navigator.geolocation.getCurrentPosition((possition) => {

		lat1= possition.coords.latitude
		lon1=possition.coords.longitude
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
};

function deg2rad(deg) {
	return deg * (Math.PI/180)
};
locations()
