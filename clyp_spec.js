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

var playlistID;
var playlistUploadToken;
//

// URL Parameters
form.append('audioFile', fs.createReadStream(filePath), {
  knownLength: fs.statSync(filePath).size         // we need to set the knownLength so we can call  form.getLengthSync()
});

form.append('description', 'POST Test');
form.append('title', title);
form.append('longitude', longitude);
form.append('latitude', latitude);
//

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
    Successful: true,
    Description: description,
    Title: title,
    Longitude: longitude,
    Latitude: latitude
  })  
  //.inspectJSON() // Prints out response to console
  .afterJSON(function(json) {
    // First Test Passed, Retrieve PlaylistId and Token

    playlistID = json.PlaylistId;
    playlistUploadToken = json.PlaylistUploadToken;

    // Test #2 - POST Audio to existing Playlist

    var form2 = new FormData();
    filePath = path.resolve(__dirname, 'gun.mp3');
    title = 'gun';
    
    form2.append('audioFile', fs.createReadStream(filePath), {
      knownLength: fs.statSync(filePath).size         // we need to set the knownLength so we can call  form.getLengthSync()
    });

    form2.append('title', title);
    form2.append('PlaylistId', playlistID);
    form2.append('PlaylistUploadToken', playlistUploadToken);

    frisby.create('Add new audio file to playlist we created')
      .post(UPLOAD_URL+ '/upload',
      form2,
      {
        json: false,
        headers: {
          // Add headers for POSTing Audio
          'content-type': 'multipart/form-data; boundary=' + form2.getBoundary(),
          'content-length': form2.getLengthSync()
        }
      })
      //.inspectJSON()
      .expectStatus(200)
      .expectJSONTypes({
        PlaylistId: String,
        PlaylistUploadToken: String
      })
      .expectJSON({
        PlaylistId: playlistID,
        PlaylistUploadToken: playlistUploadToken
      })
    .toss();
  })
.toss();



