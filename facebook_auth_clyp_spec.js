var frisby = require('./node_modules/frisby');
var options = require('./options').create();
var credentials = require('./credentials').create();

var access_token = "";
var user_access_token = "";
var clyp_access_token = "";

frisby.globalSetup({
  timeout: 10000
});

// Get Access Token for 'StagingClyp' Facebook app
frisby.create('Get Access Token for StagingClyp Facebook app')
	.get(credentials.getAccessTokenUrl)
	.expectStatus(200)
	// .inspectBody()
	.after(function(err, res, body) {
		access_token = body.slice(body.indexOf("=") + 1);
		test2();
	})
.toss();

// Post access token back to FB
function test2() {
	frisby.create('Use Access Token to create test Facebook User')
		.post(credentials.getTestUserUrl(access_token))
		.expectStatus(200)
		// .inspectJSON()
		.afterJSON(function(json) {
			user_access_token = json.access_token;
			test3();
		})
	.toss();
}

// Post FB user access_token to Clyp 
function test3() {
	frisby.create('Post FB user access_token to Clyp')
		.post(options.apiUrl + 'oauth2/token', {
				grant_type: 'password',
				username: 'FacebookAccessToken',
				password: user_access_token
			}, {
				headers: {
					// Add headers for creating a clyp user
					'Authorization': 'Basic MjkzMTE5Og==',
				}
			})
		.expectStatus(200)
		// .inspectJSON()
		.afterJSON(function(json) {
			clyp_access_token = json.access_token;
			test4();
		})
	.toss();
}

// Access Protected Clyp Resource
function test4() {
	frisby.create('Access Protected Clyp Resource: GET /me')
		.get(options.apiUrl + 'me', {
			headers: {
				'Authorization': 'Bearer ' + clyp_access_token
			}
		})
		.expectStatus(200)
		.expectJSONTypes({
			FirstName: String,
			LastName: String,
			SubscriptionState: String,
			ContentAdministrator: Boolean
		})
		.expectJSON({
			SubscriptionState: 'NoneSubscription',
			ContentAdministrator: false
		})
		// .inspectJSON()
	.toss();
}

// Test 5
frisby.create('Access Protected Clyp Resourse without Authorization')
	.get(options.apiUrl + 'me', {
		headers: {
			'Authorization': 'Bearer '
		}
	})
	.expectStatus(401)
	// .inspectBody()
.toss();
