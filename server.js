var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);  
var server = app.listen(app.get('port'), function() {  
    debug('Express server listening on port ' + server.address().port);
});


var WebSocketServer = require('ws').Server
, wss = new WebSocketServer({server: server});

var id = 0;

var sockets = {};

wss.on('connection', function(ws) {
    id += 1;
    console.log(id);
    
    ws.on('message', function(message) {
        console.log('received "%s" from id %d', message, id);
    });

    ws.on('close', function close() {
        console.log('disconnected');
    });

    ws.send('something');
});
