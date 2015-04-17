// PTG - POST, Then Get
// CLYP API Test to assure that uploading and retrieving files works correctly

var frisby = require('./node_modules/frisby');
var fs = require('fs');
var path = require('path');
var FormData = require('form-data');
var form = new FormData();

// Testing Variables
var options = require('./options').create();
var filePath = path.resolve(__dirname, 'register.mp3');
var POST_URL= options.uploadResource;
var GET_URL = options.apiUrl;

var title = 'Register';
var description = 'POST Test';
var longitude = -97;
var latitude = 30;

var testTwoJson;
//

//////// Test #1 URL Parameters /////////
form.append('audioFile', fs.createReadStream(filePath), {
  knownLength: fs.statSync(filePath).size  // we need to set the knownLength so we can call form.getLengthSync()
});

form.append('description', 'POST Test');
form.append('title', title);
form.append('longitude', longitude);
form.append('latitude', latitude);
/////////////////////////////////


// Test #1 - POST Audio to Clyp.it upload staging
frisby.create('Test 1: POST Audio to Clyp.it upload staging')
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

    // First Test Passed, Retrieve PlaylistId and Token and Save JSON for Test #4
    var playlistID = json.PlaylistId;
    var playlistUploadToken = json.PlaylistUploadToken;
    
    testTwoJson = json;

    // Set variables for new test
    form = new FormData(); // Wipe Multi-Part Form-Data clean 
    filePath = path.resolve(__dirname, 'gun.mp3');
    title = 'gun';
    description = 'MP5 Sub-Machinegun Noise';
    
    // New URL Parameters
    form.append('audioFile', fs.createReadStream(filePath), {
      knownLength: fs.statSync(filePath).size         // we need to set the knownLength so we can call  form.getLengthSync()
    });

    form.append('title', title);
    form.append('description', description);
    form.append('PlaylistId', playlistID);
    form.append('PlaylistUploadToken', playlistUploadToken);
    form.append('longitude', longitude);
    form.append('latitude', latitude);

    frisby.create('Test 2: Add new audio file to playlist we created')
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
      //.inspectJSON()
      .expectStatus(200)
      .expectJSONTypes({
        Successful: Boolean,
        Title: String,
        Description: String,
        Longitude: Number,
        Latitude: Number,
        PlaylistId: String,
        PlaylistUploadToken: String
      })
      .expectJSON({
        Successful: true,
        Title: title,
        Description: description,
        Longitude: longitude,
        Latitude: latitude,
        PlaylistId: playlistID, // Make sure the playlistID that is returned is the same as in Test #1
        PlaylistUploadToken: playlistUploadToken
      })
      .afterJSON(test3)
    .toss();
};
/* End Test #2 */


// Test #3 - GET JSON By Passing in AudioFileID from Test #2
function test3(json) {

  var test3AudioFileID = json.AudioFileId;

  frisby.create('Test 3: GET Previous Upload')
    .get(options.getAudioFileResource(test3AudioFileID))
    .expectStatus(200)
    .expectJSONTypes({
      Status: String,
      AudioFileId: String,
      Title: String,
      Description: String,
      Duration: Number,
      Url: String,
      Mp3Url: String,
      SecureMp3Url: String,
      OggUrl: String,
      SecureOggUrl: String,
      Longitude: Number,
      Latitude: Number
    })
    .expectJSON({
      // Make sure all fields match the response from the previous POST
      Status: 'DownloadDisabled',
      AudioFileId: test3AudioFileID,
      Title: json.title,
      Description: json.description,
      Duration: json.duration,
      Url: json.Url,
      Mp3Url: json.Mp3Url,
      SecureMp3Url: json.SecureMp3Url,
      OggUrl: json.OggUrl,
      SecureOggUrl: json.SecureOggUrl,
      Longitude: longitude,
      Latitude: latitude
    })
    //.inspectJSON()
    .afterJSON(test4)
  .toss();
};
/* End Test #3 */

// Test #4 - GET JSON By Passing in AudioFileID from Test #2
function test4(json) {

  frisby.create('Test 4: GET Previous Upload')
    .get(options.getAudioFileResource(json.AudioFileId) + '/playlist')
    .expectStatus(200)
    .expectJSON({
        AudioFiles: 
        [ { Status: 'DownloadDisabled', // testTwoJson is the saved data that test 2 returned
           AudioFileId: testTwoJson.AudioFileId,
           Title: testTwoJson.title,
           Description: testTwoJson.description,
           Duration: testTwoJson.duration,
           Url: testTwoJson.Url,
           Mp3Url: testTwoJson.Mp3Url,
           SecureMp3Url: testTwoJson.SecureMp3Url,
           OggUrl: testTwoJson.OggUrl,
           SecureOggUrl: testTwoJson.SecureOggUrl,
           Longitude: longitude,
           Latitude: latitude },
         { Status: 'DownloadDisabled', // This JSON is what test 3 returned
           AudioFileId: json.AudioFileId,
           Title: json.title,
           Description: json.description,
           Duration: json.duration,
           Url: json.Url,
           Mp3Url: json.Mp3Url,
           SecureMp3Url: json.SecureMp3Url,
           OggUrl: json.OggUrl,
           SecureOggUrl: json.SecureOggUrl,
           Longitude: longitude,
           Latitude: latitude } ],
      Modifiable: false,
      ContentAdministrator: false
    })
    //.inspectJSON()
  .toss();
};
/* End Test #4 */


