var frisby = require('../node_modules/frisby');

var GET_URL = 'https://apistaging.clyp.it/';

frisby.create('GET /featuredlist')
	.get(GET_URL + 'featuredlist')
	.expectStatus(200)
	//.inspectJSON()
	.afterJSON(function(json) {
		for(i = 0; i < json.length; i++) {
			testList(json[i].Location);
		}
	})
.toss();


function testList(Location) {
	frisby.create('Check that the list returns 200')
		.get(Location)
		.expectStatus(200)
		.inspectJSON()
	.toss();
};