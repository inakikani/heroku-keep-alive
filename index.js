if(process.env.NODE_ENV === 'development') { require('dotenv').config() }

const http = require('https')

let pingCnt = 0

const server = http.createServer((req, res) => {
    pingCnt++
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`OK\n${process.env.NODE_ENV} - ${pingCnt}`);
    res.end()
});

server.listen(process.env.PORT, () => {
    console.log(`server is listening on port: ${process.env.PORT}`)
})

// const pingInterval = 1000 * 60 * 10
const pingInterval = 1000 * 60
const hostsList = process.env.PING_LIST


setInterval(() => {
    for(host of hostsList.split(';')){
        doPing(host)
    }
}, pingInterval)

function doPing(url){
    console.time(url)
    http
        .get(url)
        .on('response', res => {
            const { statusCode } = res;

            let error;

            if (statusCode !== 200) {
                error = new Error(`Request Failed.\nStatus Code: ${statusCode}`);
            }
            if (error) {
                console.error(error.message);
                // Consume response data to free up memory
                res.resume();
                return;
            }

            res.setEncoding('utf8');
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                console.timeEnd(url)
            });
        })
        .on('error', (e) => {
            console.error(`Got error: ${e.message}`);
        })
}