import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import { Client } from 'pg';
import env from "dotenv";
import { fileURLToPath } from 'url';
import path from 'path';



const app = express();
var port = process.env.PORT || 3000;
let vacant = 0;
env.config();
const parkingLocations = [
  { name: "Parking Lot A", lat: 12.968, lon: 80.221 ,cost:15,image:"/image.png"},
  { name: "Parking Lot B", lat: 12.970, lon: 80.225,cost:20 ,image:"/image1.png"},
  { name: "Parking Lot C", lat: 12.964, lon: 80.219,cost:30 ,image:"/image2.png"},
  { name: "Parking Lot Q", lat: 12.901, lon: 80.203,cost:30 ,image:"/image2.png"},
  
];

const db = new Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
  const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));


  
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// map integration


app.post("/update", (req,res)=>{
  const vacant = req.body.vacant;
  console.log(`vacant slots are:`,vacant)
  res.send('recived data')
});

app.get("/",(req,res)=>{
    res.render("home.ejs",{vacentSlots: vacant});
})
app.get("/signup",(req,res)=>{
    res.render("signup.ejs")
})
app.get('/locations', (req, res) => {
  res.render('location.ejs',{vacentSlots: vacant});
});
app.get('/book', (req, res) => {
  res.render('book.ejs',{parkingLocations});
});
app.post("/book",(req,res)=>{
  console.log(req.body);
  
  res.render("home.ejs",{ showAlert: true })
})
app.post("/signup",async (req,res)=>{
    console.log(req.body);
    const username1 = req.body.username
    const email1 = req.body.email
    const password = req.body.password
    try {
        await db.query(
          'INSERT INTO logindata (username, email, password) VALUES ($1, $2, $3)',
          [username1, email1, password]
        );
        res.send('Sign-up successful!');
      } catch (err) {
        console.error(err);
        res.status(500).send('Error during sign-up');
      }
});
app.get("/login",(req,res)=>{
    res.render("login.ejs")
})
app.post("/login",async (req,res)=>{
    const email1 = req.body.email
    const password1 = req.body.password
    try {
        const result = await db.query(
          'SELECT password FROM public.logindata WHERE email = $1',
          [email1] // This is the dynamic/random input
        );
    
        if (result.rows.length > 0) {
          const password = result.rows[0].password;
          if(password === password1){
            res.redirect("/")
          }else{
            
            res.redirect("/login")
            alert("incorrect password")
          }
        } else {
          res.status(404).send('Email not found');
        }
      } catch (err) {
        console.error(err);
        res.status(500).send('Database error');
      }
      
})
app.post('/update', (req, res) => {
  const { slot1, slot2 } = req.body;

  console.log('Received Slot Status:');
  console.log(`slot1 1: ${slot1}`);
  console.log(`slot2: ${slot2}`);

  // Respond to the NodeMCU
  res.send('Status received');
});
app.listen(port,()=>{
    console.log(`App running at ${port}`)
})
