var frisby = require('./node_modules/frisby');
var options = require('./options').create();

var GET_URL = options.apiUrl;

// Make sure that the /featuredlist request works
frisby.create('GET /featuredlist')
	.get(options.featuredListResource)
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
		// Location contains URL of the specific list
		.get(Location)
		.expectStatus(200)
		//.inspectJSON()
	.toss();
};

// Run tests on the /trendinghashtaglist feature
frisby.create('GET /trendinghashtaglist')
	.get(GET_URL + 'trendinghashtaglist')
	.expectStatus(200)
	// .inspectJSON()
	.afterJSON(function(json) {
		for(i = 0; i < json.length; i++) {
			expect(json[i].Title).toBeDefined();
			expect(json[i].Location).toBeDefined();
		}
	})
.toss();