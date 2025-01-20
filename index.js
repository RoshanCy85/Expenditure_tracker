import express from 'express';
import path from 'path';
import bodyParser from "body-parser";
import pg from "pg";


const app=express();
const port=3000;

const db=new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "expenditure",
    password: "Roshan@7408",
    port: 5432,
});
db.connect();



const __dirname = path.resolve();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'));
});
app.get('/submit',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','login.html'));
});
app.post('/submit', async(req,res)=>{
    const { email,username,password } = req.body;
    try{
        await db.query("INSERT INTO users(username,email,password)  VALUES($1,$2,$3)",[username,email,password]);
         res.sendFile(path.join(__dirname,'public','login.html'));
         
         console.log('Email:', email);
         console.log('Username:', username);
         console.log('Password:', password);
    } catch(err) {
        console.log(err);
    }
});
app.post('/login',async(req,res)=>{
    const { login_username , login_password } = req.body;
    try{
        const username_search=await db.query("SELECT username FROM users WHERE username LIKE $1",[`%${login_username}%`]);
        const username_result = username_search.rows[0].username;
        console.log(username_result);  // 'leo'

        if(username_search.rows.length==0){
            res.status(404).json({ message : `username not found`});
        }else {
            // Return the matching user(s)
            // console.log(login_username);
            // console.log(login_password);
            // console.log(username_search);

            const password_search=await db.query("SELECT password FROM users WHERE username LIKE $1",[username_result]);
            const password_result = password_search.rows[0].password;

            console.log(password_result);

            if(login_password===password_result){
                console.log('login successful');
                res.sendFile(path.join(__dirname,'public','index.html'));
            }
            else{
                res.status(404).json({ message : `password incorrect`});

            }
            
            // res.status(200).json(result.rows);
            
        }
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
       }
        

})

app.listen(port,()=>{
    console.log(`serever running on ${port}`);
});