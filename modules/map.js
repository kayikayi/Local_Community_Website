const apikey = '607b1ae7ee3a49f8b1329dd170f20b9e'
const postcode = 'CV15PA'
const api_url = 'https://api.opencagedata.com/geocode/v1/json'
const request_url = api_url
    + '?'
    + 'key=' + apikey
    + '&q=' + encodeURIComponent(postcode);
+ '&pretty=1'
    + '&no_annotations=1'

let lat, lan

const mymap = L.map('map').setView([52.4068, -1.5197], 13)
const attribution ='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' //i am using opensteetmap so this attribute will declare their name
const tileUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const tiles = L.tileLayer(tileUrl)
tiles.addTo(mymap)
const mapMarker = L.marker([52.408095, -1.4944015])
mapMarker.addTo(mymap)
mapMarker.bindPopup('Neighbor making noise, Every saturday neigbors put some fire music, reported').openPopup()

function mmarker() {
	fetch(request_url)
		.then((response) => response.json()).then((data) => {
			//console.log(data);
			lat = data.results[0].geometry.lat
			lan = data.results[0].geometry.lng
			L.marker([lat, lan]).addTo(mymap).bindPopup('Pothole near bus stop, Deep pothole near bus stop at Far Gosford Street, undefined').openPopup()
			L.marker([52.40954, -1.5377228]).addTo(mymap).bindPopup('Rubbish all around, A lot of trash bags by sidewalk, reported').openPopup()


		}).catch((error) => {
			console.error('could not find the file')
			console.error(error)
		})
}
mmarker()
