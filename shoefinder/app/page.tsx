'use client'
import './page.css';
import { useState, useMemo, useCallback} from 'react';

export default function Home() {
  
  return (
    <>
      <Prompt/>
    </>
  );
}

function SearchButton({onClick}:{onClick: () => void}){
  return(
    <button id = "searchbutton" onClick = {onClick} >Search for shoes!</button>
  )
}
async function GetHardValues({input}:{input:string}){
    const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ input })
    })
    let recommendations = await response.json() as Recommendation[]
    return(
      recommendations
    )
  }
function Prompt(){
  const [input, setInput] = useState('')
  const [result, setResult] = useState<Recommendation[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const HandleCardClick = (shoeName:string)=>{
    const searchQuery = encodeURIComponent(shoeName) + "where to buy";
    const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  }
  async function HandleSearch(input:string){
    const recommendations = await GetHardValues({input})
    setHasSearched(true)
    setResult(recommendations)
  }
  function HandleInput (newValue:string){
    
    setInput(newValue)
  }
  return(
    <div>
      <Card recommendations={result} hasSearched = {hasSearched} />
      
      {/* Wrap these two so they align horizontally */}
      <div className="search-container">
        <TextBox
          input={input}
          HandleInput={HandleInput}
        />
        <SearchButton onClick={() => { HandleSearch(input) }} />
      </div>
      <div className="brand-logo">
      Powered by <span className="brand-highlight">HoopsGeek</span>
    </div>
    </div>
  );
}
function TextBox({input, HandleInput}:{input:string; HandleInput:(value: string) => void}) {
  const handleChange = (e:React.ChangeEvent<HTMLInputElement>) => {
      HandleInput(e.currentTarget.value)
    }
   return (
    < >
    <input 
      className="textbox" 
      type="text" 
      value={input} // Changed from defaultValue to value for controlled state management
      onChange={handleChange}
      placeholder="Search for shoes..."
    />
    </>
   )
}



interface Recommendation{
  name:string
  traction:number
  cushion:number
  materials:number 
  support:number 
  fit:number
  outdoor:number
  sizing:string
  widefoot:number
}
function Card({ recommendations, hasSearched }: { recommendations: Recommendation[], hasSearched: boolean }) {
  console.log("received:", recommendations);
  //initial text
  if(hasSearched == false){
    return <div className="no-data">Please describe the type of shoe you want!</div>;
  }
  // Fallback to protect layout if data hasn't loaded yet
  if (recommendations.length === 0) {
    return <div className="no-data">No shoe recommendations available.</div>;
  }
  const HandleCardClick = (shoeName:string)=>{
      const searchQuery = encodeURIComponent(shoeName) + " where to buy";
      const googleSearchUrl = `https://www.google.com/search?q=${searchQuery}`;
      window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
    }
  return (
    <div className="card-list">
      {recommendations.map((item, index) => (
        <div className="card report-card" key={`${item.name}-${index}`}
        onClick={() => HandleCardClick(item.name)}>
          
          {/* Report Card Header */}
          <div className="card-header">
            <h2 className="card-title">{item.name}</h2>
            <span className="card-stamp">PASSED</span>
          </div>
          
          {/* Report Card Grades Grid */}
          <div className="card-metrics">
            <div className="metric-row">
              <span className="label">Traction:</span> 
              <span className="value">{item.traction}</span>
            </div>
            <div className="metric-row">
              <span className="label">Cushion:</span> 
              <span className="value">{item.cushion}</span>
            </div>
            <div className="metric-row">
              <span className="label">Materials:</span> 
              <span className="value">{item.materials}</span>
            </div>
            <div className="metric-row">
              <span className="label">Support:</span> 
              <span className="value">{item.support}</span>
            </div>
            <div className="metric-row">
              <span className="label">Fit:</span> 
              <span className="value">{item.fit}</span>
            </div>
            <div className="metric-row">
              <span className="label">Outdoor:</span> 
              <span className="value">{item.outdoor}</span>
            </div>
            <div className="metric-row">
              <span className="label">Widefoot:</span> 
              <span className="value">{item.widefoot}</span>
            </div>
          </div>

          {/* Report Card Footer (Notes Section) */}
          <div className="card-notes">
            <p><strong>Sizing:</strong> {item.sizing}</p>
            
          </div>
          
        </div>
      ))}
    </div>
  );
}



