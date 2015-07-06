var express = require('express');
var bodyParser = require("body-parser");
var app = express();

var compression = require('compression');
var randomstring = require("randomstring");

app.use(compression());
app.use(express.static(__dirname + '/static'));

app.use(bodyParser.json());


app.set('port', process.env.PORT || 3000);  
var server = app.listen(app.get('port'), function() {  
    console.log('Express server listening on port ' + server.address().port);
});


var WebSocketServer = require('ws').Server
, wss = new WebSocketServer({server: server});


// id -> socket
var sockets = {};
// cookie -> name mapping
var cookies = {jisoo: "jisoo", pierre: "pierre"};
// name -> sockets for that person
var names = {};
// socket id -> name
var socket_names = {1: "jisoo", 2: "pierre"};

var global_id = 0;

wss.on('connection', function(ws) {
    global_id += 1;
    var id = global_id;
    console.log(id);

    // var name = socket_names[id];
    var name = undefined;

    function handle_text(data) {
        var to = undefined;
        if(name == 'jisoo') {
            to = 'pierre';
        } else if(name == 'pierre') {
            to = 'jisoo';
        }

        if(!names[to] || names[to].size == 0) {
            return;
        }


        var msg = {from: name, text: data['text']};
        if(data['message']) {
            msg['message'] = true;
        }
        msg = JSON.stringify(msg);
        
        for (var tid of names[to]) {
            if(sockets[tid]) {
                sockets[tid].send(msg);
            }
        }

        if(data['message']) {
            console.log('hello');
            for (var tid of names[name]) {
                if(sockets[tid]) {
                    sockets[tid].send(msg);
                }
            }
        }
        
    }

    function handle_cookie(data) {
        var c = data['cookie'];
        if(cookies[c]) {
            name = cookies[c];
            if(names[name] == undefined) {
                names[name] = new Set();
            }
            console.log('registered socket %d as %s', id, name);
            names[name].add(id);
        }
    }
    
    ws.on('message', function(message) {
        console.log('id %d: %s', id, message);

        try {
            var data = JSON.parse(message);
        } catch (e) {
            console.log('%s was badly formatted', message);
            return;
        }
        
        if(typeof data['text'] === 'string') {
            handle_text(data);
        } else if(data['cookie']) {
            handle_cookie(data);
        }
    });

    ws.on('close', function close() {
        sockets[id] = undefined;
        if(names[socket_names[id]]) {
            names[socket_names[id]].delete(id);
        }
        console.log('disconnected');
    });

    ws.send(JSON.stringify({id: id, name: name}));

    sockets[id] = ws;
});


var fs = require('fs');

// POST /api/auth 
app.post('/api/auth', function(req, res) {
    var password = req.body.password;
    console.log(password);
    fs.readFile('credentials', 'utf8', function (err,data) {
        if (err) {
            return res.status(500).send("Some Err Happened");
        } 
        var passwords = data.toString().split('\n');
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
            res.status(400).send("Password Incorrect");
        }
      
    });
});

