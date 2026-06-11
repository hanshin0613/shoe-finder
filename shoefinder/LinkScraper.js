require('dotenv').config()
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { Client } = require('pg')
const client = new Client({ connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false }
 })

async function scrapeLinks() {
    const page = await axios.get("https://www.thehoopsgeek.com/page-sitemap.xml");
    const data = page.data

    // Tell Cheerio it's XML, not HTML
    const $ = cheerio.load(data, { xmlMode: true });

    const links = [];
    $("loc").each(function(index, element){
        const link = $(element).text();
            if(link.includes("colorways") || link.includes("basketball-shoes") || link.endsWith("/shoe-reviews/")|| !link.includes("shoe-reviews") || link.includes("quiz") || link.includes("how")||link.includes("popular")){
                return
            }
            else if(link == links[links.length - 1] && links.length != 0 ){
                return
            }
            else{
                links.push(link)
            }
    })
    const Old = (JSON.parse(fs.readFileSync('../links.json','utf8'))).map(item=>"https://www.thehoopsgeek.com" + item.link)
    let newLinksFound = []
    const oldLinks = new Set(Old)
    if(links.length > Old.length){
        newLinksFound = links.filter(item=>!oldLinks.has(item))
        Old.push(...newLinksFound)
        const cleaned = Old.map(link => ({ 
        link: link.replace('https://www.thehoopsgeek.com', '') 
        }))
        fs.writeFileSync('../links.json', JSON.stringify(cleaned))
        await client.connect()
        await Promise.all(cleaned.map(link=>{
            return client.query(`INSERT INTO links(link) VALUES($1) ON CONFLICT(link) DO NOTHING`,[link])
        }))
        client.end()
    }
}

async function main(){
    await scrapeLinks()
}
main()