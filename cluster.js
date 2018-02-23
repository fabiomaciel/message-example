const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Redis = require('ioredis');
const os = require("os");

const sub = new Redis('hyrule', 6379);
const store = new Redis('hyrule', 6379);

const port = process.env.PORT || 3000;

const host = `${os.hostname()}:${port}`;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/send', function(req, res){
  store.get(req.query.login, (err, data) => {
    if(err) return;
    data = JSON.parse(data);
    let message = JSON.stringify({
      id: data.id,
      text: req.query.message
    });
    store.publish(data.host, message)

  })

  res.send(`ok from host: ${host}`);
});

io.on('connection', function(socket){
  socket.on('register', (data) => {
    let userData = JSON.stringify({
      id: socket.id,
      host
    });
    store.set(data.login, userData);
  })
});

sub.subscribe(host);
sub.on(`message`, (chanel, message) => {
  message = JSON.parse(message);
  
  if(!io.sockets.sockets[message.id]) return;

  io.sockets.sockets[message.id].emit('chat message', message.text);
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
