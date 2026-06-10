import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db'
import { HarmCategory } from '@google/generative-ai';


export async function POST(request: NextRequest) {
  const body = await request.json();
  const response = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
  messages: [{ role: "user", content: `
    You are a shoe recommendation engine.
    This is the description from the user ${body.input}
    Each shoe has ratings (1-10) for: traction, cushion, materials, support, fit, outdoor, widefoot.

        ### STEP 1: Weight Inference (1-10)
        First, interpret what the user actually needs.You can ignore the other categories. For example:
    - "I play like LeBron" → needs cushion, support, outdoor durability
    - "I play on slippery courts" → needs high traction
    - "I have wide feet" → needs high widefoot rating
    - "I'm a guard" → needs lightweight, good traction, fit
    - "I'm a center" → needs cushion, support, materials

    Then assign importance weights (1-10) for chosen categories only.
     
    - **Scale**: 8-10 (high), 6-7 (medium), 1-4 (low).
    - **Mapping**: "good" = 6-7+ | "very good" = 8+ | "wide footer" = widefoot ≥6 | "very wide" = widefoot ≥7.
    Return no other comments, ONLY a JSON object such as:
    {"category": int, "category": int}

  `}]
  
    })
    let cleaned = ''
    if(response.choices[0].message.content){
        cleaned = response.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim()
    }
    else{
        console.log("Nothing is being returned from Groq.")
    }
    const weights = JSON.parse(cleaned)
    console.log("This is the weights returned:", weights)
    //select all the shoes from the table that fit the description
    let conditions = []
    for(const category in weights){
        const threshold = weights[category]
        conditions.push(`${category} >= ${threshold}`)
    }
    const allConditions = conditions.join(' AND ')
    const database = await pool.query(`SELECT * FROM shoes WHERE ${allConditions} `);
    const shoebase: Record<string, number>[] = database.rows
    const length = shoebase.length
    // For each chosen shoe, compute match score:
    // score += weight × (1 - abs(user_weight - shoe_value) / 10)
    // Discard shoes where any category with weight ≥8 has shoe value outside ±2 of user weight.
    let scores = []
    for (let i = 0; i < length; i++){
        const shoe = shoebase[i] as Record<string, number>
        let score = 0
        let discard = false
        for(const category in weights){
            if(weights[category] >= 8 && Math.abs(weights[category] - shoe[category]) > 2){
                discard = true
                break
            }
            score += weights[category] * (1 - Math.abs( weights[category]- shoe[category]) / 10)
        }
        //"traction":0,"cushion":0,"materials":0,"support":0,"fit":0,"outdoor":0,"sizing":"string","widefoot":0
        if(!discard){
            scores.push({name: shoe.name, traction:shoe.traction, 
                cushion:shoe.cushion, materials:shoe.materials, support: shoe.support, 
                fit:shoe.fit, outdoor:shoe.outdoor, sizing:shoe.sizing, widefoot:shoe.widefoot,
                score: score})
        }
        
    }
    scores.sort((a, b) => b.score - a.score);
    

    // Return top 10 shoes by match score.
  
    let topMatch = scores
    if (scores.length>10){
        topMatch = scores.slice(0,10)
    }
    
    

    // Return ONLY this JSON, no backticks:
    // {[{"name": string, 
    // "traction":number,"cushion":number,"materials":number,
    // "support":number,"fit":number,"outdoor":number,"sizing":"string",
    // "widefoot":number "reason": string}]}
    console.log("This is the final array:", scores)
    return Response.json(topMatch)
}