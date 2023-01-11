const io = require('socket.io')
const server = io({
    transports: ['websocket']
});
server.on('connection', (socket) => {
    socket.onAny((event, data, ack) => {
        console.log(event, data);
        ack({
            value1: {
                enabled: true
            },
            value2: 123,
            value2: Date.now()
        });
    });
});
server.on('disconnect', () => console.log('disconnect'));
server.listen(3000);