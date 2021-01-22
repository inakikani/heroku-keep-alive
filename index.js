if(process.env.NODE_ENV === 'development') { require('dotenv').config() }

const https = require('https')
const http = require('http')

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`OK\n${process.env.NODE_ENV}`);
    res.end()
});

const pingIntervalMinutes = Number(process.env.PING_INTERVAL_MIN || 25)
const pingIntervalMilliseconds = 1000 * 60 * pingIntervalMinutes
const hostsList = process.env.PING_LIST.split(';')

server.listen(process.env.PORT, () => {
    console.log(`server is listening on port: ${process.env.PORT}\nPings every ${pingIntervalMinutes} minutes\nHosts :\n${hostsList.toString().replace(',','\n')}`)
})

setInterval(() => {
    for(host of hostsList){
        doPing(host)
    }
}, pingIntervalMilliseconds)

function doPing(url){
    console.time(url)
    https
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