// var frisby = require('../node_modules/frisby');
// var fs = require('fs');
// var path = require('path');
// var FormData = require('form-data');
// var form = new FormData();

// var form2 = new FormData();

// path.resolve(__dirname, 'gun.mp3');
// title = 'gun';

// form2.append('audioFile', fs.createReadStream(filePath), {
//   knownLength: fs.statSync(filePath).size         // we need to set the knownLength so we can call  form.getLengthSync()
// });

// form2.append('title', title);

// frisby.create('Add new audio file to playlist we created')
//   .post(URL + '/upload',
//   form2,
//   {
//     json: false,
//     headers: {
//       // Add headers for POSTing Audio
//       'content-type': 'multipart/form-data; boundary=' + form2.getBoundary(),
//       'content-length': form2.getLengthSync()
//     }
//   })
//   .inspectJSON()
//   .expectStatus(200)
// .toss();