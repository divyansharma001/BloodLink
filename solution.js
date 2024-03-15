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
  password: "process.env.DB_PASSWORD",
  port: 5432,
});

db.connect();
var idToedit;

// In-memory data store
let posts = [
  {
  id: 1,
  title: "Janakpuri Blood Bank",
  content:
   "O+ : 4units O- : 2units A : 4units",
  author: "Manager",
},
];

console.log(posts)

let lastId = 1;

async function checkPost() {
  const result = await db.query(
    "SELECT id, title, content, author FROM posts",
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
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
  };
  console.log("post",post);
  posts.push(post);
  
  try {
    await db.query(
      "INSERT INTO posts (id, title, content, author) VALUES ($1, $2, $3, $4)",
      [newId, req.body.title, req.body.content, req.body.author]
    );
    
  } catch (err) {
    console.log(err);
  }
  res.status(201).json(post);
  checkPost()
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
