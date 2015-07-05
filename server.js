var express = require('express');
var bodyParser = require("body-parser");
var app = express();
// var compression = require('compression');

// var oneDay = 86400000;

// app.use(compression());
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.set('port', process.env.PORT || 3000);  
var server = app.listen(app.get('port'), function() {  
    console.log('Express server listening on port ' + server.address().port);
});


var WebSocketServer = require('ws').Server
, wss = new WebSocketServer({server: server});

var global_id = 0;

var sockets = {};
var cookies = {jisoo: "jisoo", pierre: "pierre"};
var names = {jisoo: new Set([1]), pierre: new Set([2])};
var socket_names = {1: "jisoo", 2: "pierre"};

wss.on('connection', function(ws) {
    global_id += 1;

    var id = global_id;
    var name = socket_names[id];
    console.log(id);
    
    ws.on('message', function(message) {
        console.log('id %d: %s', id, message);
        var data = JSON.parse(message);

        // var name = cookies[data['cookie']];
        // if(!name) {
        //     return;
        // }

        var to = undefined;
        if(name == 'jisoo') {
            to = 'pierre';
        } else if(name == 'pierre') {
            to = 'jisoo';
        }

        if(!names[to] && names[to].size == 0) {
            return;
        }


        var msg = {from: name, to: to, text: data['text']};
        msg = JSON.stringify(msg);
        
        for (var tid of names[to]) {
            if(sockets[tid]) {
                sockets[tid].send(msg);
            }
        }
    });

    ws.on('close', function close() {
        sockets[id] = undefined;
        names[socket_names[id]].delete(id);
        console.log('disconnected');
    });

    ws.send(JSON.stringify({id: id, name: name}));

    sockets[id] = ws;
});


var fs = require('fs');
var randomstring = require("randomstring");

// POST http://localhost:3000/api/auth 
app.post('/api/auth', function(req, res) {
    var password = req.body.password;
    console.log(password);
    fs.readFile('credentials', 'utf8', function (err,data) {
      if (err) {
        return res.status(500).send("Some Err Happened");
      } 
      var passwords = data.toString().split('\n')
      var index = passwords.indexOf(password);
      if (index > -1) {
        var cookie = randomstring.generate();
        if (index === 0) {
            cookies.jisoo = cookie;
        } else {
            cookies.pierre = cookie;
        }
        res.send(cookie);
      } else {
        res.status(400).send("Password Incorrect")
      }
    });
});


// var io = require('socket.io')(server);

// io.on('connection', function (socket) {
//     socket.emit('news', { hello: 'world' });
//     socket.on('my other event', function (data) {
//         console.log(data);
//     });
// });
