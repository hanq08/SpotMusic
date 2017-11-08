/**
 * This is an example of a basic node.js script that performs
 * the Authorization Code oAuth2 flow to authenticate against
 * the Spotify Accounts.
 *
 * For more information, read
 * https://developer.spotify.com/web-api/authorization-guide/#authorization_code_flow
 */

var express = require('express'); // Express web server framework
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var client_id = 'fe2d7ef199f649839f9a7d671a18eb9b'; // Your client id
var client_secret = '0ce362923c2444f280f6ddf5c562ab38'; // Your secret
var redirect_uri = 'https://spotmusic.herokuapp.com/callback'; // Your redirect uri
//var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri

var access_token = '';
var refresh_token = 'AQCdbZaOkVg491QWRIAX0_P8Yfxo7Q7nrOIYZFss9F6O0BmotkrB-nymfACr-WABCuI5x-Imi7PF-cqyvVqVU7hXNJwfxDiLbOo8Wjh2iL_WrQ0wf8Uc8I0XOnQt0FTOwdU';

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname))
   .use(cookieParser());

app.get('/', function(req, res){
    console.log(access_token); 
    if (!access_token){
        res.redirect('/login');
    }   
});

var port = process.env.PORT || 8888;
app.listen(port, function(){
    console.log("listening to port:" + port);
});

app.get('/login', function(req, res) {

  var state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      redirect_uri: redirect_uri,
      state: state
    }));
});

app.get('/callback', function(req, res) {

  // your application requests refresh and access tokens
  // after checking the state parameter

  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    var authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        access_token = body.access_token;
        refresh_token = body.refresh_token;
        console.log(refresh_token);
        var options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, function(error, response, body) {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/');
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

app.get('/refresh_token', function(req, res) {

  // requesting access token from refresh token
  // var refresh_token = req.query.refresh_token;
  console.log('refreshing');
  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, function(error, response, body) {
    if (!error && response.statusCode === 200) {
       access_token = body.access_token;
       console.log("new access token");
    } else {
        console.log('refresh call back' + body);
    }
  });
});

app.get('/search', function(req, response){
  console.log(access_token);
    var artist = req.query.query;
    var url = 'https://api.spotify.com/v1/search?query=' + artist + '&offset=0&limit=20&type=artist&market=US';
    var options = {
          url: url,
          headers: { 'Authorization': 'Bearer ' + access_token },
          //headers: { 'Authorization': 'Bearer BQC0b1EMy-uKxS9apyrxFEpk8grhvB6ZW7h-gadrVPYP0W5I4IN-ird0gxBwoKtEjZcJhrbVak4SB4m1cjFawbonGhbmhiT64VaUFIfhkI0UqYiy7lLfUfp2-BOMNcFZJkBRrX3Qug8b_wPZtP3w6IJCuIKv2tXubgr3'},
          json: true
        };
    request.get(options, function(error, res, body) {
          console.log(body);
          if (res.statusCode === 200){
            response.send(body);
          } else {
            response.redirect('/refresh_token'); 
          } 
        });
    //response.end();
});

app.get('/artist', function(req, response){
    var id = req.query.query;
    var url = 'https://api.spotify.com/v1/artists/' + id;
    var options = {
          url: url,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
    request.get(options, function(error, res, body) {
          console.log(res.statusCode);
          if (res.statusCode === 200){
            response.send(body);
          } else {
            response.redirect('/refresh_token'); 
          } 
          //response.send(body);
        });
    //response.end();
});

app.get('/album', function(req, response){
    var id = req.query.query;
    var url = 'https://api.spotify.com/v1/albums/' + id;
    var options = {
          url: url,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
    request.get(options, function(error, res, body) {
          console.log(res.statusCode);
          if (res.statusCode === 200){
            response.send(body);
          } else {
            response.redirect('/refresh_token'); 
          } 
          //response.send(body);
        });
    //response.end();
});

app.get('/albums', function(req, response){
    var id = req.query.query;
    var url = 'https://api.spotify.com/v1/artists/' + id + '/albums'
    var options = {
          url: url,
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };
    request.get(options, function(error, res, body) {
          console.log(res.statusCode);
          if (res.statusCode === 200){
            response.send(body);
          } else {
            response.redirect('/refresh_token'); 
          } 
          //response.send(body);
        });
    //response.end();
});