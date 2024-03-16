import express from "express";
import bodyParser from "body-parser";
import pg from 'pg'
import dotenv from 'dotenv'

const app = express();
const port = 4000;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bloodBank",
  password: "l73SHWZH",
  port: 5432,
});

db.connect();
var idToedit;

// In-memory data store
let posts = [
  {
 id: 1,
  bloodbankname: "Janakpuri Blood Bank",
  a_pos:"1",
  a_neg:"1",
  b_pos:"1",
  b_neg:"1",
  ab_pos:"1",
  ab_neg:"1",
  o_pos:"1",
  o_neg:"1",
  bloodbankphone: "9305441885"
},
];

console.log(posts)

let lastId = 1;

async function checkPost() {
  const result = await db.query(
    "SELECT id, bloodbankname, a_pos, a_neg, b_pos, b_neg, ab_pos, ab_neg, o_pos, o_neg, bloodbankdata FROM bloodata",
  );

  console.log("resultRows:", result.rows)

  result.rows.forEach((post) => {
    posts.push(post);
  });

}

   

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// GET all posts
app.get("/posts", (req, res) => {
  console.log(posts);
  res.json(posts);
});

// GET a specific post by id
app.get("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });
  res.json(post);
});

// POST a new post
app.post("/posts", async(req, res) => {
  console.log("title01", req.body.title)
  const newId = lastId += 1;
  const post = {
    id: newId,
    bloodbankname: req.body.bloodbankname,
    bloodbankphone: req.body.bloodbankphone,
    a_pos: req.body.a_pos,
    a_neg: req.body.a_neg,
    b_pos: req.body.b_pos,
    b_neg: req.body.b_neg,
    ab_pos: req.body.ab_pos,
    ab_neg: req.body.ab_neg,
    o_pos: req.body.o_pos,
    o_neg: req.body.o_neg,


  };
  console.log("post",post);
  posts.push(post);
  
  // try {
  //   await db.query(
  //     "INSERT INTO blooddata (id, bloodbankname, a_pos, a_neg, b_pos, b_neg, ab_pos, ab_neg, o_pos, o_neg, bloodbankphone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
  //     [newId, req.body.bloodbankname, req.body.a_pos, req.body.a_neg, req.body.b_pos, req.body.b_neg, req.body.ab_pos, req.body.ab_neg, req.body.o_pos, req.body.o_neg, req.body.bloodbankphone]
  //   );
    
  // } catch (err) {
  //   console.log(err);
  // }
  res.status(201).json(post);
  // checkPost()
});

// PATCH a post when you just want to update one parameter
app.patch("/posts/:id", (req, res) => {
  const post = posts.find((p) => p.id === parseInt(req.params.id));
  if (!post) return res.status(404).json({ message: "Post not found" });

  if (req.body.title) post.title = req.body.title;
  if (req.body.content) post.content = req.body.content;
  if (req.body.author) post.author = req.body.author;

  res.json(post);
});

// DELETE a specific post by providing the post id
app.delete("/posts/:id", (req, res) => {
  const index = posts.findIndex((p) => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: "Post not found" });

  posts.splice(index, 1);
  res.json({ message: "Post deleted" });
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
