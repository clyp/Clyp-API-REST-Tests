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

var title = 'PATCH Title- Start';
var description = 'PATCH Description - Start';
var longitude = -97;
var latitude = 30;

var playlistID;
var playlistUploadToken;
var tmpID;
var audioFileID;
var initialJSON;
var newDescription = 'PATCH Description - End';
var newTitle = 'PATCH Title- End';

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
	.afterJSON(post)
.toss();

/* Initial Upload */
function post(json) {
	playlistID = json.PlaylistId;
	playlistUploadToken = json.PlaylistUploadToken;
	// console.log(playlistUploadToken);
	
	// URL Parameters
	form.append('audioFile', fs.createReadStream(filePath), {
	  knownLength: fs.statSync(filePath).size  // we need to set the knownLength so we can call form.getLengthSync()
	});

	form.append('description', description);
	form.append('title', title);
	form.append('PlaylistId', playlistID);
    form.append('PlaylistUploadToken', playlistUploadToken);

	frisby.create('PATCH Test - Initial Upload')
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
	  .afterJSON(patchTest)
	.toss();
};

/* End Initial Upload */

/* PATCH Test 1- Change Title and Description of previously uploaded file using tmpID cookie */
function patchTest(json) {
	// console.log("");

	initialJSON = json;
	audioFileID = initialJSON.AudioFileId;

	frisby.create('PATCH Test 1 - Change Title And Description')
	  .addHeader('Cookie', tmpID)
	  .patch(options.getAudioFileResource(audioFileID), {
		description: newDescription,
		title: newTitle
	  }, {json: true})
	  .expectStatus(200)
	  .expectJSONTypes({
	    Status: String,
	    Description: String,
	    Title: String
	  })
	  .expectJSON({
	    // Assert that all the fields we passed in were correctly returned
	    Status: 'DownloadDisabled',
   	    Description: newDescription,
	    Title: newTitle
	  })  
	  // .inspectJSON()
	  .afterJSON(patchStatusTest)
	.toss();
};
/* End Patch Test 1 */

/* PATCH Test 2- Try to Change Status - Should 401 since we are not authorized */
function patchStatusTest(json) {
	// console.log("");

	var newStatus = 'Deleted';

	frisby.create('PATCH Test 2 - Change Status')
	  .addHeader('Cookie', tmpID)
	  .patch(options.getAudioFileResource(audioFileID), {
		status: newStatus
	  }, {json: true})
	  .expectStatus(401)
	  .after(patchAllTest)
	.toss();
};
/* End Patch Test 2 */

/* PATCH Test 3- Try to Change Status, Title, and Description- Should 401 since we are not authorized */
function patchAllTest() {
	console.log("");

	newDescription = 'PATCH Description - Status Change';
	newTitle = 'PATCH Title - Status Change';
	var newStatus = 'Deleted';

	frisby.create('PATCH Test 3 - Change Status, Title, and Description')
	  .addHeader('Cookie', tmpID)
	  .patch(options.getAudioFileResource(audioFileID), {
		status: newStatus,
		description: newDescription,
		title: newTitle
	  }, {json: true})
	  .expectStatus(401)
	.toss();
};
/* End Patch Test 3 */