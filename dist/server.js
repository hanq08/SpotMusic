var express = require('express');
var https = require('https');
var http = require('http');
var path = require('path');
var unirest = require('unirest');
var fs = require('fs');


var app = express();
var port = process.env.PORT || 3000;
var router = express.Router();
var staticRoot = __dirname;

app.set('port', (port));
app.use(express.static(staticRoot));

app.get('/', function(req, res) {
  //res.sendFile('index.html');
  console.log("test");
});


//var server = https.createServer(options, app).listen(port);
var server = app.listen(port, function(){
  console.log("listening to port: " + port);
});

var token = "";
app.get('/authorize', function(req, res){
    var url = 'http://accounts.spotify.com/authorize?client_id=fe2d7ef199f649839f9a7d671a18eb9b&response_type=code';
    http.request(url, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    }).end();

})
// These code snippets use an open-source library. http://unirest.io/nodejs
