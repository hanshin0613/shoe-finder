const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

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
        fs.writeFileSync('../links.json',JSON.stringify(Old))
    }
    console.log(newLinksFound)
    return newLinksFound
}

scrapeLinks();