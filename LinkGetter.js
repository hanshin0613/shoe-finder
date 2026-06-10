// Load environment variables from .env file
require('dotenv').config();
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
const { Client } = require('pg')
const client = new Client({ connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false }
 })

// Require packages
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
//define basketball shoe brands
const basketballShoeBrands = [
  "Nike",
  "Jordan",
  "Adidas",
  "Puma",
  "Under-armour",
  "New-Balance",
  "Li-Ning",
  "Anta",
  "361",
  "Peak",
  "Rigorer",
  "Asics",
  "Reebok",
  "AND1",
  "Fila",
  "Skechers",
  "Crossover Culture",
  "Serious Player Only",
  "EQLZ",
  "Brandblack",
  "Converse"
];
linkSet = []
async function getcurrentpage(url){
    biglist = await axios.get(url)
    const $ = cheerio.load(biglist.data)
    linkTemplate = /\/shoe-reviews\/([^\/]+)\//
    $('a').each(function(index, element){
        href = ($(element)).attr('href')
        // check if a link exists inside that element
        if(href == null){
            return
        }
        // check if that link is to a shoe, not something like a quiz for shoes
        const brandcheck = (basketballShoeBrands.some(function(brand){
            return href.toLowerCase().includes(brand.toLowerCase())
        }))
        if(linkTemplate.test(href) == true && !linkSet.includes(href) && brandcheck == true){
            linkSet.push(href)
        }
    })
}

//move on to the next page 
async function getNextPage(url) {
    biglist = await axios.get(url)
    const $ = cheerio.load(biglist.data)
    nextPage = $('a.page-link:contains("Next")').attr('href')
    return nextPage
}

async function main() {
    startURL = 'https://www.thehoopsgeek.com/shoe-reviews/'
    await getcurrentpage(startURL)
    next = await getNextPage(startURL)
    nextPage = 'https://www.thehoopsgeek.com' + next
    while(nextPage != startURL){
        startURL = nextPage
        await getcurrentpage(startURL)
        next = await getNextPage(startURL)
        nextPage = 'https://www.thehoopsgeek.com' + next
    }
    await client.connect()
    await Promise.all(linkSet.map(link=>
    client.query(`INSERT INTO links(link) VALUES($1)`,[link])))
    client.end()
}
main()

