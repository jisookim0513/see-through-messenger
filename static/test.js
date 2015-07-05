var ws = new WebSocket('ws://localhost:3000');
ws.onmessage = function (event) {
    console.log(JSON.parse(event.data));
    // ws.send("got it");
};

$(window).on('beforeunload', function(){
    ws.close();
});

// console.log(docCookies.getItem('cookie'));
// docCookies.setItem('cookie', 'wow so cool', 60*60*24*30);

