var frisby = require('../node_modules/frisby');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');
var form = new FormData();

// Testing Variables
var filePath = path.resolve(__dirname, 'register.mp3');
var UPLOAD_URL= 'https://uploadstaging.clyp.it'

var title = 'Register';
var description = 'POST Test';
var longitude = -97;
var latitude = 30;
//

//////// Test #1 URL Parameters /////////
form.append('audioFile', fs.createReadStream(filePath), {
  knownLength: fs.statSync(filePath).size         // we need to set the knownLength so we can call  form.getLengthSync()
});

form.append('description', 'POST Test');
form.append('title', title);
form.append('longitude', longitude);
form.append('latitude', latitude);
/////////////////////////////////


// Test #1 - POST Audio to Clyp.it upload staging
frisby.create('POST audio to https://uploadstaging.clyp.it/upload')
  .post(UPLOAD_URL+ '/upload',
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
    Title: String,
    Longitude: Number,
    Latitude: Number,
    PlaylistId: String,
    PlaylistUploadToken: String
  })
  .expectJSON({
    // Assert that all the fields we passed in were correctly returned
    Successful: true,
    Description: description,
    Title: title,
    Longitude: longitude,
    Latitude: latitude
  })  
  //.inspectJSON() // Prints out response to console
  .afterJSON(test2) // If Test #1 Passed, run Test #2 with JSON response from Test #1
.toss();
/* End Test #1 */



//Test #2 - POST Audio to Playlist created by Test #1
function test2(json) {

    // First Test Passed, Retrieve PlaylistId and Token
    var playlistID = json.PlaylistId;
    var playlistUploadToken = json.PlaylistUploadToken;

    // Set variables for new test
    form = new FormData(); // Wipe Multi-Part Form-Data clean 
    filePath = path.resolve(__dirname, 'gun.mp3');
    title = 'gun';
    
    // New URL Parameters
    form.append('audioFile', fs.createReadStream(filePath), {
      knownLength: fs.statSync(filePath).size         // we need to set the knownLength so we can call  form.getLengthSync()
    });

    form.append('title', title);
    form.append('PlaylistId', playlistID);
    form.append('PlaylistUploadToken', playlistUploadToken);

    frisby.create('Add new audio file to playlist we created')
      .post(UPLOAD_URL+ '/upload',
      form,
      {
        json: false,
        headers: {
          // Add headers for POSTing Audio
          'content-type': 'multipart/form-data; boundary=' + form.getBoundary(),
          'content-length': form.getLengthSync()
        }
      })
      //.inspectJSON()
      .expectStatus(200)
      .expectJSONTypes({
        Successful: Boolean,
        Title: String,
        PlaylistId: String,
        PlaylistUploadToken: String
      })
      .expectJSON({
        Successful: true,
        Title: title,
        PlaylistId: playlistID, // Make sure the playlistID that is returned is the same as in Test #1
        PlaylistUploadToken: playlistUploadToken
      })
    .toss();
};
/* End Test #2 */



