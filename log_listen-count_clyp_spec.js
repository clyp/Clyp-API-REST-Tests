// Node Dependencies
var frisby = require('./node_modules/frisby');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');
var form = new FormData();

// Testing Variables
var options = require('./options').create();
var POST_URL= options.uploadResource;
var API_URL = options.apiUrl;
var filePath = path.resolve(__dirname, 'register.mp3');

var title = 'Register';
var description = 'Log and ListenCount';
var longitude = -97;
var latitude = 30;

var playlistID;
var playlistUploadToken;
var tmpID;
var audioFileID;
var initialJSON;


//////// Test #1 URL Parameters /////////
form.append('audioFile', fs.createReadStream(filePath), {
  knownLength: fs.statSync(filePath).size  // we need to set the knownLength so we can call form.getLengthSync()
});

form.append('description', description);
form.append('title', title);
form.append('longitude', longitude);
form.append('latitude', latitude);
/////////////////////////////////


// Test #1 - POST Audio to Clyp.it upload staging
frisby.create('Log/ListenCount Test Part 1: POST Audio to Clyp.it upload staging')
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
  //.inspectJSON() // Prints out response to console
  .afterJSON(test2) // If Test #1 Passed, run Test #2 with JSON response from Test #1
.toss();
/* End Test #1 */


// Test #2 - POST to log; increments listen count
function test2(json) {
	audioFileID = json.AudioFileId;

	frisby.create("Log/ListenCount Test Part 2: POST to log; increments listen count")
		.post(options.getAudioFileResource(audioFileID) + '/log')
		.expectStatus(201)
		.after(test3)
	.toss();
}

// Test #3 - GET listen count of previously uploady file, assert that it's a number >= 0
function test3(json) {

	frisby.create("Log/ListenCount Test Part 3: GET listen count, assert that it's a number >= 0")
		.get(options.getAudioFileResource(audioFileID) + '/listencount')
		.expectStatus(200)
		// .inspectJSON()
		.afterJSON(function(listenCount) {
			expect(listenCount >= 0).toBe(true);
		})
	.toss();

}