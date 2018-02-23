const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Redis = require('ioredis');

const port = process.env.PORT || 5000;

const store = new Redis('hyrule', 6379);

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/send', function(req, res){
  store.get(req.query.login, (err, socketId) => {
    if(err) return;
    if(!io.sockets.sockets[socketId]) return;
    io.sockets.sockets[socketId].emit('chat message', req.query.message);
  })

  res.send(`ok`);
});

io.on('connection', function(socket){
  socket.on('register', (data) => {
    let userData = JSON.stringify(socket.id);
    store.set(data.login, socket.id);
  })
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
