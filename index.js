import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import axios from "axios";
import dotenv from 'dotenv'


const app = express();
const port = 3000;
const saltRounds = 10;
const API_URL = "http://localhost:4000";

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bloodBank",
  password: " process.env.DB_PASSWORD",
  port: 5432,
});

db.connect();



app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get('/userSignup', (req,res)=>{
  res.render('userSignup.ejs')
})

app.post("/userSignup", async (req, res) => {
  const name = req.body.userName;
  const email = req.body.userEmail;
  const password = req.body.userPassword;
  const aadhar = req.body.aadhar;

  try {
    const checkResult = await db.query("SELECT * FROM blooddonors WHERE aadharnumber = $1", [
      aadhar,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("User already exists. Try logging in.");
    } else {
      //hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("Hashed Password:", hash);
          await db.query(
            `
            INSERT INTO blooddonors (
                  name,
                    email,
                   password,
                  aadharnumber 
               ) VALUES ($1, $2, $3, $4)
           `,
       [name, email, hash, aadhar]
          );
          res.render("frontPage.ejs");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.get("/userLogin", (req, res) => {
  res.render("userLogin");
});

app.post("/userLogin", async (req, res) => {
  console.log(req.body.enteredPassword);
  console.log(req.body.enteredAadhar)
  const aadhar = req.body.enteredAadhar;
  const password = req.body.enteredPassword;

  try {
    const result = await db.query("SELECT * FROM blooddonors WHERE aadharnumber = $1", [
      aadhar,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(user)
      const storedHashedPassword = user.password;
      //verifying the password
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          console.log('result', result)
          if (result) {
            res.render("frontPage.ejs");
          } else {
            res.send("Incorrect Password");
          }
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
});

app.get('/hospitalSignup', (req,res)=>[
  res.render('hospitalSignup.ejs')
])

app.post('/hospitalSignup', async(req,res)=>{
  const name = req.body.hospitalName
  const registrationNumber  = req.body.registrationNumber
  const email  = req.body.hospitalEmail
  const password = req.body.hospitalPassword

  console.log({
    name: name,
    registrationNumber: registrationNumber,
    email: email,
    password: password
  })

  try {
    const checkResult = await db.query("SELECT * FROM hospitals WHERE registration_number = $1", [
      registrationNumber,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("User already exists. Try logging in.");
    } else {
      //hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("Hashed Password:", hash);
          await db.query(
            `
            INSERT INTO hospitals (
                  hospital_name,
                    registration_number,
                   hospital_email,
                  password 
               ) VALUES ($1, $2, $3, $4)
           `,
       [name, registrationNumber, email, hash]
          );
          res.render("hospitalLogin.ejs");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }



  res.redirect('/hospitalLogin');
})

app.get('/hospitalLogin', async(req,res)=>{
    res.render('hospitalLogin.ejs')
})

app.post('/hospitalLogin', async(req,res)=>{
  const registrationNumber  = req.body.enteredHosprn
  const password = req.body.enteredHospPassword

  try {
    const result = await db.query("SELECT * FROM hospitals WHERE registration_number = $1", [
      registrationNumber,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(user)
      const storedHashedPassword = user.password;
      //verifying the password
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          console.log('result', result)
          if (result) {
            res.render("afterHospital.ejs");
          } else {
            res.send("Incorrect Password");
          }
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }
 
})

app.get('/bloodBankSignup', (req,res)=>{
 res.render('bbSignUp.ejs')
})

app.post('/bloodBankSignup', async(req,res)=>{
  const name = req.body.blood_bank_name
  const registrationNumber = req.body.bb_registration_number
  const email = req.body.bb_email
  const password = req.body.bb_password
 
  const result = {
   name, registrationNumber, email, password
  }

  
  try {
    const checkResult = await db.query("SELECT * FROM bloodbanks WHERE registration_number = $1", [
      registrationNumber,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("User already exists. Try logging in.");
    } else {
      //hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("Hashed Password:", hash);
          await db.query(
            `
            INSERT INTO bloodbanks (
                  blood_bank_name,
                    registration_number,
                   email,
                  password 
               ) VALUES ($1, $2, $3, $4)
           `,
       [name, registrationNumber, email, hash]
          );
          res.render("bbLogin.ejs");
        }
      });
    }
  } catch (err) {
    console.log(err);
  }

  res.redirect('/bloodBankLogin')
})

app.get('/bloodBankLogin', (req,res)=>{
  res.render('bbLogin.ejs')
 })

app.post('/bloodBankLogin', async(req,res)=>{
  const registrationNumber = req.body.ebb_registration_number
  const password = req.body.ebb_password
  const result = {registrationNumber, password}
  console.log(result);

  try {
    const result = await db.query("SELECT * FROM bloodbanks WHERE registration_number = $1", [
      registrationNumber,
    ]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      console.log(user)
      const storedHashedPassword = user.password;
      //verifying the password
      bcrypt.compare(password, storedHashedPassword, (err, result) => {
        if (err) {
          console.error("Error comparing passwords:", err);
        } else {
          console.log('result', result)
          if (result) {
            res.render("afterBloodBank.ejs");
          } else {
            res.send("Incorrect Password");
          }
        }
      });
    } else {
      res.send("User not found");
    }
  } catch (err) {
    console.log(err);
  }

 })

 //API works begins here

 //Route to render main page
 app.get("/data", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    console.log(response);
    res.render("data.ejs", { posts: response.data });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Error fetching posts" });
  }
});

//Route to render the edit page





 // Partially update a post
app.post("/api/posts/:id", async (req, res) => {
  console.log("called");
  try {
    const response = await axios.patch(
      `${API_URL}/posts/${req.params.id}`,
      req.body
    );
    console.log(response.data);
    res.redirect("/data");
  } catch (error) {
    res.status(500).json({ message: "Error updating post" });
  }
});

// Delete a post




//my work begins here
app.get("/bloodData", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts`);
    console.log("this one is response", response.data);
    res.render("table.ejs", { posts: response.data });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error fetching posts" });
  }
});

//creating new 
app.get("/new", (req, res) => {
  res.render("modify.ejs", { heading: "Upload Data", submit: "Upload" });
});
//editing
app.get("/edit/:id", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${req.params.id}`);
    console.log("this is response",response.data.id);
    res.render("modify.ejs", {
      heading: "Edit Data",
      submit: "Update Data",
      post: response.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching post" });
  }
});
//yaha pe hmara data post hoga app.post se
app.post("/api/posts", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/posts`, req.body);
    console.log(response.data);
    res.redirect("/bloodData");
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Error creating post" });
  }
});
//deleting
app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    await axios.delete(`${API_URL}/posts/${req.params.id}`);
    res.redirect("/bloodData");
  } catch (error) {
    res.status(500).json({ message: "Error deleting post" });
  }
});

app.get('/cudbloodBank', async(req,res)=>{
  const result = await db.query('SELECT MIN(id) FROM posts');
console.log("minid=", result.rows[0].min);

    res.render("cudBloodBank.ejs", {
      heading: "Edit Data",
      submit: "Update Data",
      id: result.rows[0].min //ye wali id laani hai kahi se ya to db se ya fir api se
})})



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
