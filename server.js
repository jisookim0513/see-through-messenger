var express = require('express');
var app = express();
var compression = require('compression');

var oneDay = 86400000;

app.use(compression());
app.use(express.static(__dirname + '/public', { maxAge: oneDay }));

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


// var io = require('socket.io')(server);

// io.on('connection', function (socket) {
//     socket.emit('news', { hello: 'world' });
//     socket.on('my other event', function (data) {
//         console.log(data);
//     });
// });
