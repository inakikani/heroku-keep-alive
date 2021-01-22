if(process.env.NODE_ENV === 'development') { require('dotenv').config() }

const https = require('https')
const http = require('http')

// Create server
const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.write(`OK\n${process.env.NODE_ENV}`);
    res.end()
});

const pingIntervalMinutes = Number(process.env.PING_INTERVAL_MIN || 25)
const pingIntervalMilliseconds = 1000 * 60 * pingIntervalMinutes
const hostsList = process.env.PING_LIST.split(';')
const commas = new RegExp(',', 'g')

const errorThreshold = process.env.MAX_ERROR_COUNT || 1
let errors = new Map()

// Start server
server.listen(process.env.PORT, () => {
    console.log(`server is listening on port: ${process.env.PORT}\nPings every ${pingIntervalMinutes} minutes\nHosts :\n${hostsList.toString().replace(commas, '\n')}`)
})

// periodically ping
setInterval(() => {
    for(host of hostsList){
        doPing(host)
    }
}, pingIntervalMilliseconds)

function doPing(url){
    try {
        
        if(errors.get(url) >= errorThreshold) { 
            console.log(`........................\n${url} : failed too many times`)
            return
        }

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
                    handleError(error, url)
                    // Consume response data to free up memory
                    res.resume();
                    return;
                }

                res.setEncoding('utf8');
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    console.log('........................')
                    console.timeEnd(url)
                });
            })
            .on('error', (e) => {
                handleError(e, url)
            })   
    } catch (error) {
        handleError(error, url)
    }
}

function handleError(error, url){
    if(errors.has(url)){
        errors.set(url, errors.get(url) + 1)
    } else {
        errors.set(url, 0)
    }

    console.log('........................\nskip on error ...')
    console.timeEnd(url)
    console.log(error)
}