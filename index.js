const parser = require('rss-parser')
const args = require('args')
const fs = require('fs')
const request = require('request');

args
    .option('url', 'The RSS URL of the podcast.')
    .option('fb', 'The number of episodes to download, from beginning to end.')
    .option('bf', 'The number of episodes to download, from end to beginning.')

const flags = args.parse(process.argv)

function download() {
    if(!flags.url) return console.log("You have to specify a RSS URL with -u or --url!")
    
    parser.parseURL(flags.url, (err, parsed) => {
        if (err) throw err

        console.log(`Now downloading ${parsed.feed.title}...`)

        if(!fs.existsSync(`./${parsed.feed.title}`)) fs.mkdirSync(`./${parsed.feed.title}`)

        let dir = `./${parsed.feed.title}`

        if (flags.bf && flags.fb) {
            return console.log("You can't download from beginning to end, and from end to beginning! That just doesn't make any sense. I mean, unless you want to exclude some episodes that are in the middle, which could make sense, but ya know what? I'm not going to allow that. You're gonna have to run this command twice.")
        } else if (flags.bf) {
            if(flags.bf > parsed.feed.entries.length) return console.log("You can't download more episodes than there are episodes.")
            for(let i = parsed.feed.entries.length; i > flags.bf; i--) {

            }
        } else if (flags.fb) {
            if(flags.fb > parsed.feed.entries.length) return console.log("You can't download more episodes than there are episodes.")
            for(let i = 0; i < flags.fb; i++) {

            }
        } else {
            let episodeNum = parsed.feed.entries.length;
            for(let i = 0; i < parsed.feed.entries.length; i++) {
                downloadFile(`${dir}/${parsed.feed.title} - ${episodeNum}.mp3`, parsed.feed.entries[i].enclosure.url)
                episodeNum--
            }
        }
    })
}

function downloadFile(filename, url, callback) {
    let epStream = fs.createWriteStream(filename)
    let epReq = request.get(url)

    epReq.on('response', response => {
        if(response.statusCode !== 200) console.log(`Non-200 response code, response code was ${response.statusCode}.`)
    })

    epReq.on('error', err => {
        fs.unlink(filename)
        return console.log(err.message)
    })

    epReq.pipe(epStream)

    epStream.on('finish', () => {
        epStream.close(callback)
    })

    epStream.on('error', error => {
        fs.unlink(filename)
        return console.log(error.message)
    })
}

download();