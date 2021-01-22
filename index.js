if(process.env.NODE_ENV === 'development') { require('dotenv').config() }

const http = require('http')

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`OK\n${process.env.NODE_ENV}`);
    res.end()
});

server.listen(process.env.PORT, () => {
    console.log(`server is listening on port: ${process.env.PORT}`)
})

const pingInterval = 1000 * 60 * 10

setInterval(() => {
    doPing('test')
}, pingInterval)

function doPing(url){
    console.log('ping!', url)
}