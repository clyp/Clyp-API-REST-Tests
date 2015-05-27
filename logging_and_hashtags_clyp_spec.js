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
var description = 'This is #peter testing hashtags';
var longitude = -97;
var latitude = 30;

var audioFileID;
var tmpID;

//////// Test #1 URL Parameters /////////
form.append('audioFile', fs.createReadStream(filePath), {
  knownLength: fs.statSync(filePath).size  // we need to set the knownLength so we can call form.getLengthSync()
});

form.append('description', description);
form.append('title', title);
form.append('longitude', longitude);
form.append('latitude', latitude);
/////////////////////////////////

/* Create Empty Playlist - Get tmpID Cookie */
frisby.create('PATCH Test - Create Empty Playlist')
	.post(API_URL + 'playlist/')
	.expectStatus(200)
	// .inspectJSON()
	.after(function(err, res, body) {
		var setCookie = res.headers['set-cookie'];
		tmpID = setCookie[0].split(';')[0];
		//console.log(tmpID);
	})
	.afterJSON(test1)
.toss();

// Test #1 - POST Audio to Clyp.it upload staging
function test1(json) {

	// Add to ID so we can PATCH later
	form.append('PlaylistId', json.PlaylistId);
    form.append('PlaylistUploadToken', json.PlaylistUploadToken);

	frisby.create('Log/Hashtag Test Part 1: POST Audio to Clyp.it upload staging')
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
}
/* End Test #1 */


// Test #2 - POST to log; increments listen count
function test2(json) {
	audioFileID = json.AudioFileId;

	frisby.create("Log/Hashtag Test Part 2: POST to log; increments listen count")
		.post(options.getAudioFileResource(audioFileID) + '/log')
		.expectStatus(201)
		.after(test3)
	.toss();
}

// Test #3 - GET listen count of previously uploady file, assert that it's a number >= 0
function test3(json) {

	frisby.create("Log/Hashtag Test Part 3: GET listen count, assert that it's a number >= 0")
		.get(options.getAudioFileResource(audioFileID) + '/listencount')
		.expectStatus(200)
		// .inspectJSON()
		.afterJSON(function(listenCount) {
			expect(listenCount >= 0).toBe(true);
			test4();
		})
	.toss();

}

// Test #4 - Search for Clyps with #peter and assert that the file we just uploaded is there
function test4() {
	frisby.create("Log/Hashtag Test Part 4: GET a seach of #peter")
		.get(API_URL + 'search?type=hashtag&query=peter')
		.expectStatus(200)
		.afterJSON(function(json)  {
			// Make sure that the first result on the #peter search is the file we just posted
			expect(json[0].AudioFileId === audioFileID).toBe(true);
			patch(json);
		})
	.toss();
}

/* PATCH - Change Description using tmpID to remove #peter */
function patch(json) {

	frisby.create('PATCH - Change Description using tmpID to remove #peter')
	  .addHeader('Cookie', tmpID)
	  .patch(options.getAudioFileResource(audioFileID), {
		description: 'no hashtag'
	  }, {json: true})
	  .expectStatus(200)
	  .expectJSONTypes({
	    Status: String,
	    Description: String
	  })
	  .expectJSON({
	    // Assert that all the fields we passed in were correctly returned
	    Status: 'DownloadDisabled',
   	    Description: 'no hashtag'
	  })  
	  // .inspectJSON()
	  .afterJSON(test5)
	.toss();
};
/* End Patch */

// Test #5 - Search for Clyps with #peter and assert that the file we just uploaded is NOT there
function test5() {
	frisby.create("Log/Hashtag Test Part 5: GET a seach of #peter")
		.get(API_URL + 'search?type=hashtag&query=peter')
		.expectStatus(200)
		.afterJSON(function(json)  {
			// Make sure that the first result on the #peter search is NOT the file we just posted
			expect(json[0].AudioFileId === audioFileID).toBe(false);
		})
	.toss();
}