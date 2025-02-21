import express from 'express';
import path from 'path';
import bodyParser from "body-parser";
import pkg from "pg";
import { fileURLToPath } from "url";
import session from 'express-session';
import connectPgSimple from "connect-pg-simple";
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import {  signInUser } from './email.js';



const PgSession = connectPgSimple(session);
const app=express();
const port=3000;
const { Pool } = pkg;
const pool=new Pool({
    user: "postgres",
    host: "localhost",
    database: "expenditure",
    password: "Roshan@7408",
    port: 5432,
});
pool.connect();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(session({
    store: new PgSession({
        pool: pool,
        tableName: "session" // Make sure this table exists in your DB
    }),
    secret: "your-secret-key", // Change this in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 // 1 day
    }
}));

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

        const phonenumber_search=await pool.query("SELECT phone_number FROM users WHERE phone_number LIKE $1",[`%${phonenumber}%`]);
        const username_search=await pool.query("SELECT username FROM users WHERE username LIKE $1",[`%${username}%`]);
        const email_search=await pool.query("SELECT email FROM users WHERE email LIKE $1",[`%${email}%`])
        if(username_search.rows.length==0 && email_search.rows.length==0 && phonenumber_search.rows.length==0){
   

             
            await pool.query("INSERT INTO users(username,email,password,phone_number)  VALUES($1,$2,$3,$4)",[username,email,password,phonenumber]);
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
        const username_search=await pool.query("SELECT username FROM users WHERE username LIKE $1",[`%${login_username}%`]);
         // 'leo'

        if(username_search.rows.length==0){
            res.status(404).json({ message : `username not found`});
        }else {
            const username_result = username_search.rows[0].username;
            console.log(username_result); 
            const userQuery = await pool.query("SELECT id, password FROM users WHERE username = $1", [login_username]);

            const userId = userQuery.rows[0].id;
            const password_result = userQuery.rows[0].password;

            console.log(password_result);

            if(login_password===password_result){
                console.log('login successful');
                console.log("Session after login:", req.session);

                req.session.userId = userId; // Store user ID in session
                await req.session.save();
                console.log("User logged in:", req.session.userId);
                const category_query = await pool.query(
                    "SELECT section_name FROM user_sections WHERE user_id = $1",
                    [userId]
                );
                const sections = category_query.rows.map(row => row.section_name);   
                    res.render("firstPage", {  username: username_result,
                            id: userId,
                            categories: sections,
                     });      
            }
            else{
                console.log('login unsuccessful');     
                res.status(404).json({ message : `password incorrect`});
            }
        }
        } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
       }
        

});
app.post("/add-section", async (req, res) => {
    console.log('hi')
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { sectionName } = req.body;
    if (!sectionName) {
        return res.status(400).json({ message: "Section name is required" });
    }

    try {
        await pool.query("INSERT INTO user_sections (user_id, section_name, created_at) VALUES ($1, $2, NOW())", [
            req.session.userId,
            sectionName,
        ]);
        res.json({ success: true });  // Send success response
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});
app.get('/check-session', (req, res) => {
    if (req.session.userId) {
        res.json({ message: "Session found", userId: req.session.userId });
    } else {
        res.status(401).json({ message: "No session found" });
    }
});
app.post("/add-expense", async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const { amount, category } = req.body;
    if (!amount || !category) {
        return res.status(400).json({ message: "Amount and category are required" });
    }

    try {
        await pool.query(
            "INSERT INTO user_transactions(user_id, section_id, amount, created_at) VALUES ($1, (SELECT section_id FROM user_sections WHERE section_name = $2 AND user_id = $1), $3, NOW())",
            [req.session.userId, category, amount]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Database error" });
    }
});
app.get("/transactions/:category", async (req, res) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.userId;
    const category = req.params.category;

    try {
        // Get transactions under the selected category
        const transactionsQuery = await pool.query(
            "SELECT amount, created_at FROM user_transactions WHERE user_id = $1 AND section_id = (SELECT section_id FROM user_sections WHERE section_name = $2 AND user_id = $1)",
            [userId, category]
        );
        
        // Get the total sum of all amounts
        const sumQuery = await pool.query(
            "SELECT SUM(amount) AS total_amount FROM user_transactions WHERE user_id = $1 AND section_id = (SELECT section_id FROM user_sections WHERE section_name = $2 AND user_id = $1)",
            [userId, category]
        );

        const transactions = transactionsQuery.rows;
        const totalAmount = sumQuery.rows[0].total_amount || 0; // Default to 0 if no transactions

        res.render("transactionsPage", { transactions, totalAmount, category });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Database error" });
    }
});





app.listen(port,()=>{
    console.log(`serever running on ${port}`);
});