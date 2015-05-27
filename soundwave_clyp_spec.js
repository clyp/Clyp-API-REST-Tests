// Node Dependencies
var frisby = require('./node_modules/frisby');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');
var form = new FormData();

// Testing Variables
var options = require('./options').create();
var POST_URL= options.uploadResource;
var filePath = path.resolve(__dirname, 'gun.mp3');

var title = 'Gun Soundwave';
var description = 'Soundwave Test';

var AudioFileId;
var firstArray;
var secondArray;
//

//////// Test #1 URL Parameters /////////
form.append('audioFile', fs.createReadStream(filePath), {
  knownLength: fs.statSync(filePath).size  // we need to set the knownLength so we can call form.getLengthSync()
});

form.append('description', description);
form.append('title', title);
/////////////////////////////////


// Test #1 - POST Audio to Clyp.it upload staging
frisby.create('Soundwave Test 1: POST Audio to Clyp.it upload staging')
  .post(POST_URL,
  form,
  {
    json: false,
    headers: {
      // Add headers for POSTing Audio
      'content-type': 'multipart/form-data; boundary=' + form.getBoundary(),
      'content-length': form.getLengthSync()
    }
  })
  .expectStatus(200)
  .expectJSONTypes({
    Successful: Boolean,
    Description: String,
    Title: String
  })
  .expectJSON({
    // Assert that all the fields we passed in were correctly returned
    Successful: true,
    Description: description,
    Title: title
  })  
  //.inspectJSON() // Prints out response to console
  .afterJSON(test2) // If Test #1 Passed, run Test #2 with JSON response from Test #1
.toss();
/* End Test #1 */

// Test #2 - GET Soundwave of POSTed file from apistaging
function test2(json) {
	AudioFileId = json.AudioFileId;

	frisby.create('Soundwave Test 2: GET Soundwave of POSTed file from from apistaging')
		.get(options.getAudioFileResource(AudioFileId) + '/soundwave')
		// .inspectJSON()
		.afterJSON(function(json) {
			firstArray = json;
			expect(firstArray.length).toBe(4000);
			for(i = 0; i < firstArray.length; i++) {
				x = firstArray[i];
				expect(x >= 0 && x <= 99).toBe(true);
			}
			test3();
			// console.log(json.length);
		})
	.toss();
}

// Test #3 - GET Soundwave of POSTed file from soundwavedev
function test3() {
	frisby.create('Soundwave Test 3: GET Soundwave of POSTed file from soundwavedev')
		.get('https://soundwavedev.clyp.it/' + AudioFileId)
		// .inspectJSON()
		.afterJSON(function(json) {
			secondArray = json;
			expect(json.length).toBe(4000);
			for(i = 0; i < json.length; i++) {
				x = json[i];
				expect(x >= 0 && x <= 99).toBe(true);
			}
			test4();
		})
	.toss();
}

// // Test #4 - Assert that both soundwaves are the same
function test4() {
	for(i = 0; i < 4000; i++) {
		expect(firstArray[i] === secondArray[i]).toBe(true);
	}
}