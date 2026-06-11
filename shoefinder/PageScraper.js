// Load environment variables from .env file
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
require('dotenv').config();
const Groq = require('groq-sdk').default;


const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const { Client } = require('pg')
const client = new Client({ connectionString: process.env.POSTGRES_URL_NON_POOLING,
    ssl: { rejectUnauthorized: false }
 })

// Require packages
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');



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

async function getStats(link){
    let texts = []
    let fitreview = []
    let tractionreview = []
    let cushionreview = []
    let materialsreview = []
    let supportreview = []
    let outdoorreview = []
    page = await axios.get(link)
    const $ = cheerio.load(page.data)
    $('.css-zg0lyd').each(function(index,element){
        const words = $(element).text()
        texts.push(words)
    })
    $('h3#Fit').nextUntil('h3').each(function(index, element){
        const fitdesc = $(element).text()
        fitreview.push(fitdesc)
    })
     //traction review
    $('h3#Traction').nextUntil('h3').each(function(index, element){
        const traction = $(element).text()
        tractionreview.push(traction)
    })
    //cushion review
    $('h3#Cushion').nextUntil('h3').each(function(index, element){
        const cushion = $(element).text()
        cushionreview.push(cushion)
    })
    //materials review
    $('h3#Materials').nextUntil('h3').each(function(index, element){
        const materials = $(element).text()
        materialsreview.push(materials)
    })
    //support review
    $('h3#Support').nextUntil('h3').each(function(index, element){
        const support = $(element).text()
        supportreview.push(support)
    })
    //outdoor review
    $('h3#Outdoor').nextUntil('h3').each(function(index, element){
        const outdoor = $(element).text()
        outdoorreview.push(outdoor)
    })
    formattedDatanormal = JSON.stringify(texts)
    formattedDataFits = JSON.stringify(fitreview)
    formattedDatatraction = JSON.stringify(tractionreview)
    formattedDatacushion = JSON.stringify(cushionreview)
    formattedDatamaterials = JSON.stringify(materialsreview)
    formattedDatasupport = JSON.stringify(supportreview)
    formattedDataoutdoor = JSON.stringify(outdoorreview)
    //get the name of the shoe from the url 
    const url = link
    const shoeName = url.split("/").filter(Boolean).pop().split("-").map(word=> word.charAt(0).toUpperCase() + word.slice(1)).join("")
    const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [{ role: "user", content: `
        Return ONLY a valid JSON object. No backticks, no labels, no explanation.

        INPUT DATA:
        Name: ${shoeName}
        Stats: ${formattedDatanormal}
        Fit comments: ${formattedDataFits}
        Traction comments: ${formattedDatatraction}
        Cushion comments: ${formattedDatacushion}
        Materials comments: ${formattedDatamaterials}
        Support comments: ${formattedDatasupport}
        Outdoor comments: ${formattedDataoutdoor}

        RULES:
        - name to be inserted later: ${shoeName}
        - traction/cushion/materials/support/fit/outdoor: from Stats, find the element ending with that word (e.g "8.8Traction"), extract only the leading number. Type: number.
        - sizing: 2-6 sentences on lockdown, toe box, heel, comfort, break-in. Ignore the word "smalllarge".
        - widefoot (1-10): infer from fit comments only. 8-10 only if explicitly wide-friendly. Narrow/snug/constricted = low score. Type: number.
        - traction_review/cushion_review/materials_review/support_review/outdoor_review: reword and summarize the corresponding comments. Type: string.

        OUTPUT FORMAT (all keys required, no extras):
        {"name":"string","traction":0,"cushion":0,"materials":0,"support":0,"fit":0,"outdoor":0,"sizing":"string","widefoot":0,"traction_review":"string","cushion_review":"string","materials_review":"string","support_review":"string","outdoor_review":"string"}
    `}]
    })
console.log(response.usage);

return response.choices[0].message.content;
}
function sleep(ms){
   return new Promise(resolve=>setTimeout(resolve,ms))
}

async function main(existingNames, rows){
    for(let i = 0; i<rows.length; i++){
        const row = rows[i]
        const hyperlink = "https://www.thehoopsgeek.com" + row.link
        const shoeName = hyperlink.split("/").filter(Boolean).pop().split("-").map(word=> word.charAt(0).toUpperCase() + word.slice(1)).join("")
        if(existingNames.has(shoeName)){
            console.log(`skipping ${shoeName}`)
            continue
        }
        const data = await getStats(hyperlink)
        const cleaned = data.replace(/```json/g, '').replace(/```/g, '').trim()
        const shoeObject = JSON.parse(cleaned)
        const name = shoeObject.name
        const traction = shoeObject.traction
        const cushion = shoeObject.cushion
        const materials = shoeObject.materials
        const support = shoeObject.support
        const fit = shoeObject.fit
        const outdoor = shoeObject.outdoor
        const sizing = shoeObject.sizing
        const widefoot = shoeObject.widefoot 
        // reviews
        const traction_review = shoeObject.traction_review
        const cushion_review = shoeObject.cushion_review
        const materials_review = shoeObject.materials_review
        const support_review = shoeObject.support_review
        const outdoor_review = shoeObject.outdoor_review 
        
        const result = await client.query(`INSERT INTO shoes(name, traction, cushion, materials, support, fit, outdoor, sizing, widefoot, traction_review, cushion_review, materials_review, support_review, outdoor_review)
            VALUES($1,$2,$3,$4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) ON CONFLICT(name) DO NOTHING`,
            [name, traction, cushion, materials, support, fit, outdoor, sizing, widefoot, traction_review, cushion_review, materials_review, support_review, outdoor_review])
        console.log(`inserted: ${result.rowCount}, shoe: ${name}`)
        existingNames.add(name)
        await sleep(5000)
    }
}

async function repeat(){
    await client.connect()
    //if somehow links.json doesnt exist anymore
    if(!fs.existsSync('../links.json')){
    // query supabase and save to file
    stuff = await client.query(`SELECT link FROM links`)
    rows = stuff.rows
    fs.writeFileSync('links.json', JSON.stringify(rows))
    }
   
    rows = JSON.parse(fs.readFileSync('links.json', 'utf8'))
    const existingResult = await client.query(`SELECT name FROM shoes`)
    const existingNames = new Set(existingResult.rows.map(row => row.name))
    
    let done = false
    while(done == false){
        try {
            await main(existingNames, rows)
            done = true
        } catch(error) {
            if(error.status === 429 || error.name == "RateLimitError"){
                console.log("rate limit hit... sleeping...")
                await sleep(600000)
            } else {
                console.log("other error: ", error)
                break
            }
        }
    }
    await client.end()
}

repeat()