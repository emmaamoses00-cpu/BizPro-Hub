require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
const DB = path.join(__dirname, "data", "db.json");
app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"public")));
function readDB(){ try { return JSON.parse(fs.readFileSync(DB,"utf8")); } catch { return {customers:[],transactions:[]}; } }
function writeDB(db){ fs.mkdirSync(path.dirname(DB),{recursive:true}); fs.writeFileSync(DB,JSON.stringify(db,null,2)); }
app.get("/api/data",(req,res)=>res.json(readDB()));
app.post("/api/customers",(req,res)=>{
  const {name,phone,email,notes}=req.body||{};
  if(!name || !String(name).trim()) return res.status(400).json({error:"Customer name is required."});
  const db=readDB(), customer={id:cryptoId(),name:String(name).trim(),phone:String(phone||"").trim(),email:String(email||"").trim(),notes:String(notes||"").trim(),createdAt:new Date().toISOString()};
  db.customers.unshift(customer); writeDB(db); res.status(201).json(customer);
});
app.post("/api/transactions",(req,res)=>{
  const b=req.body||{}, amount=Number(b.amount);
  if(!["sale","expense"].includes(b.type)) return res.status(400).json({error:"Choose sale or expense."});
  if(!Number.isFinite(amount)||amount<=0) return res.status(400).json({error:"Enter an amount greater than zero."});
  if(!b.description||!String(b.description).trim()) return res.status(400).json({error:"Description is required."});
  const db=readDB(), tx={id:cryptoId(),type:b.type,amount,description:String(b.description).trim(),category:String(b.category||"Other"),customerId:b.customerId||null,customerName:String(b.customerName||""),paymentMethod:String(b.paymentMethod||"Cash"),date:b.date||new Date().toISOString().slice(0,10),createdAt:new Date().toISOString()};
  if(tx.customerId && !db.customers.some(c=>c.id===tx.customerId)) return res.status(400).json({error:"Selected customer was not found."});
  db.transactions.unshift(tx); writeDB(db); res.status(201).json(tx);
});
app.delete("/api/transactions/:id",(req,res)=>{const db=readDB(),n=db.transactions.length;db.transactions=db.transactions.filter(x=>x.id!==req.params.id);if(n===db.transactions.length)return res.status(404).json({error:"Record not found."});writeDB(db);res.json({ok:true});});
app.delete("/api/customers/:id",(req,res)=>{const db=readDB();db.customers=db.customers.filter(x=>x.id!==req.params.id);writeDB(db);res.json({ok:true});});
app.post("/api/ai",async(req,res)=>{
  const key=process.env.OPENAI_API_KEY;
  if(!key) return res.status(503).json({error:"AI is not connected yet. Add your OpenAI API key to the .env file, then restart BizPro Hub. All other tools work without it."});
  try{
    const db=readDB(), question=String((req.body||{}).message||"").trim();
    if(!question) return res.status(400).json({error:"Type a question first."});
    const sales=db.transactions.filter(t=>t.type==="sale").reduce((s,t)=>s+t.amount,0);
    const expenses=db.transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
    const context={currency:"UGX",customers:db.customers.length,sales,expenses,profit:sales-expenses,recentTransactions:db.transactions.slice(0,20)};
    const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":"Bearer "+key,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",instructions:"You are BizPro Hub's practical small-business assistant. Help the owner understand this business's numbers and use the app. Currency is UGX. Be clear, concise, supportive, and never invent missing data. Mention when the dataset is small.",input:"Business data (JSON): "+JSON.stringify(context)+"\\n\\nQuestion: "+question})});
    const data=await response.json();
    if(!response.ok) return res.status(response.status).json({error:data.error?.message||"AI provider request failed."});
    const reply=data.output_text || (data.output||[]).flatMap(item=>item.content||[]).filter(part=>part.type==="output_text").map(part=>part.text).join("\\n");
    res.json({reply:reply||"I couldn't form a reply. Please try again."});
  }catch(e){res.status(500).json({error:"AI request failed: "+e.message});}
});
function cryptoId(){return require("crypto").randomUUID();}
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
app.listen(PORT,"0.0.0.0",()=>console.log(`BizPro Hub running at http://localhost:${PORT}`));
