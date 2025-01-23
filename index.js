import express from 'express';
import path from 'path';
import bodyParser from "body-parser";
import pg from "pg";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import {  signInUser } from './email.js';




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
app.use(express.json())

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','index.html'));
});
app.get('/submit',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','login.html'));
});
app.post('/validate-email', async (req, res) => {
    const { email } = req.body;


    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }

    try {
        const auth = getAuth();
        let user;

        try {
            // Check if the email is already registered
            user = await getUserByEmail(auth, email);
        } catch (error) {
            user = null; // User not found, handle registration
        }

        if (!user) {
            // Register the email if not found
            const userCredential = await createUserWithEmailAndPassword(auth, email, 'defaultpassword');
            user = userCredential.user;

            // Immediately send verification email after registration
            await sendEmailVerification(user);
            return res.status(200).json({
                message: 'Registration successful. Verification email sent. Please check your inbox.',
            });
        }

        // If the email is already registered, check if verified
        if (!user.emailVerified) {
            await sendEmailVerification(user); // Resend verification email
            return res.status(200).json({
                message: 'Verification email sent. Please check your inbox.',
            });
        } else {
            return res.status(200).json({ message: 'Email is already verified. You can proceed to login.' });
        }
    } catch (error) {
        console.error('Error during registration or verification:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/submit', async(req,res)=>{

    const { email,username,password,phonenumber } = req.body;
    try{

        const phonenumber_search=await db.query("SELECT phone_number FROM users WHERE phone_number LIKE $1",[`%${phonenumber}%`]);
        const username_search=await db.query("SELECT username FROM users WHERE username LIKE $1",[`%${username}%`]);
        const email_search=await db.query("SELECT email FROM users WHERE email LIKE $1",[`%${email}%`])
        if(username_search.rows.length==0 && email_search.rows.length==0 && phonenumber_search.rows.length==0){
   

             
            await db.query("INSERT INTO users(username,email,password,phone_number)  VALUES($1,$2,$3,$4)",[username,email,password,phonenumber]);
            res.sendFile(path.join(__dirname,'public','login.html'));
        }
        else if(username_search.rows.length!=0 || email_search.rows.length!=0 || phonenumber_search.rows.length!=0){
            res.status(404).json({ message : `username or email or phonenumber already taken`});
            // res.status(500).json({ error: 'Registration failed', details: err.message });
        }
        
    } catch(err)  {
        console.error('Error during sign-in:', err);
      }
});
app.post('/login',async(req,res)=>{
    const { login_username , login_password } = req.body;
    try{
        const username_search=await db.query("SELECT username FROM users WHERE username LIKE $1",[`%${login_username}%`]);
         // 'leo'

        if(username_search.rows.length==0){
            res.status(404).json({ message : `username not found`});
        }else {
            // Return the matching user(s)
            // console.log(login_username);
            // console.log(login_password);
            // console.log(username_search);
            const username_result = username_search.rows[0].username;
            console.log(username_result); 
            
            const password_search=await db.query("SELECT password FROM users WHERE username LIKE $1",[username_result]);
            const password_result = password_search.rows[0].password;

            console.log(password_result);

            if(login_password===password_result){
                console.log('login successful');
                res.sendFile(path.join(__dirname,'public','index.html'));
            }
            else{
                console.log('login unsuccessful');
                
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