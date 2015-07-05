var express = require('express');
var app = express();
var compression = require('compression');
var randomstring = require("randomstring");
var oneDay = 86400000;

app.use(compression());
app.use(express.static(__dirname + '/static'));

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
var names = {jisoo: new Set(), pierre: new Set()};
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


// var io = require('socket.io')(server);

// io.on('connection', function (socket) {
//     socket.emit('news', { hello: 'world' });
//     socket.on('my other event', function (data) {
//         console.log(data);
//     });
// });
