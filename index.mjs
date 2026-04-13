import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({extended:true}));

//setting up database connection pool
const conn = mysql.createPool({
    host: "etdq12exrvdjisg6.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
    user: "wuu7ljb7ws0rkrjm",
    password: "nqhfkf8hk8elxqyo",
    database: "or3ofeiwephrcepd",
    connectionLimit: 10,
    waitForConnections: true
});

//routes
app.get('/', (req, res) => {
   res.render('index');
});//home page


/**
 * AUTHOR CRUD ROUTES
 */

app.get("/author/new", (req, res) => {
   res.render("newAuthor");
}); //get new author form


app.post("/author/new", async function(req, res){
  let fName = req.body.fName;
  let lName = req.body.lName;
  let birthDate = req.body.birthDate;
  let deathDate = req.body.deathDate;
  let sex = req.body.sex;
  let profession = req.body.profession;
  let country = req.body.country;
  let portrait = req.body.portrait;
  let biography = req.body.biography;
  let sql = `INSERT INTO q_authors
             (firstName, lastName, dob, dod, sex, profession, country, portrait, biography)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  let params = [fName, lName, birthDate, deathDate, sex, profession, country, portrait, biography];
  const [rows] = await conn.query(sql, params);
  res.render("newAuthor", 
             {"message": "Author added!"});
});//post new author

app.get("/author/edit", async function(req, res){

 let authorId = req.query.authorId;


 let sql = `SELECT *, 
        DATE_FORMAT(dob, '%Y-%m-%d') dobISO
        FROM q_authors
        WHERE authorId =  ${authorId}`;
 const [rows] = await conn.query(sql);
 res.render("editAuthor", {"authorInfo":rows});
});//get edit author

app.post("/author/edit", async function(req, res){
  let sql = `UPDATE q_authors
           SET firstName = ?,
               lastName = ?,
               dob = ?,
               dod = ?,
               sex = ?,
               profession = ?,
               country = ?,
               portrait = ?,
               biography = ?
           WHERE authorId = ?`;


  let params = [req.body.fName,  
              req.body.lName, req.body.dob, req.body.dod,
              req.body.sex, req.body.profession, req.body.country, req.body.portrait, req.body.biography, req.body.authorId];         
  const [rows] = await conn.query(sql,params);
  res.redirect("/authors");
});//post edit author


app.get("/authors", async function(req, res){
 let sql = `SELECT *
            FROM q_authors
            ORDER BY lastName`;
 const [rows] = await conn.query(sql);
 res.render("authorList", {"authors":rows});
}); // List/get authors

app.get("/author/delete", async function(req, res){
    let authorId = req.query.authorId;
    let sql = `DELETE FROM q_authors
                WHERE authorId = ?`;
    const [rows] = await conn.query(sql, [authorId]);
    res.redirect("/authors");
});//delete author

/**
 * QUOTE CRUD ROUTES
 */

app.get("/quote/new", async function(req, res) {
  let sql = `SELECT authorId, firstName, lastName
             FROM q_authors
             ORDER BY lastName`;
  const [rows] = await conn.query(sql);
  res.render("newQuote", { authors: rows });
});

app.post("/quote/new", async function(req, res){
  let quote = req.body.quote;
  let authorId = req.body.authorId;
  let category = req.body.category;
  let likes = req.body.likes;

  let sql = `INSERT INTO q_quotes
             (quote, authorId, category, likes)
             VALUES (?, ?, ?, ?)`;
  let params = [quote, authorId, category, likes];

  await conn.query(sql, params);
  res.redirect("/quote/new");
});//post new quote


app.get("/quote/edit", async function(req, res){

 let quoteId = req.query.quoteId;

 let quoteSql = `SELECT *
                  FROM q_quotes
                  WHERE quoteId = ?`;

  let authorSql = `SELECT authorId, firstName, lastName
                   FROM q_authors
                   ORDER BY lastName`;

 const [quoteRows] = await conn.query(quoteSql, [quoteId]);
 const [authorRows] = await conn.query(authorSql);
 res.render("editQuote", {quoteInfo: quoteRows, authors: authorRows});
});//get edit quote


app.post("/quote/edit", async function(req, res){
  let sql = `UPDATE q_quotes
             SET quote = ?,
                 authorId = ?,
                 category = ?,
                 likes = ?
             WHERE quoteId = ?`;

  let params = [
    req.body.quote,
    req.body.authorId,
    req.body.category,
    req.body.likes,
    req.body.quoteId
  ];
   await conn.query(sql, params);
   res.redirect("/quotes");
});//post edit quote

app.get("/quotes", async function(req, res){
 let sql = `SELECT *
            FROM q_quotes
            ORDER BY quoteId`;
 const [rows] = await conn.query(sql);
 res.render("quoteList", {"quotes":rows});
}); // List/get quotes

app.get("/quote/delete", async function(req, res){
    let quoteId = req.query.quoteId;
    let sql = `DELETE FROM q_quotes
                WHERE quoteId = ?`;
    const [rows] = await conn.query(sql, [quoteId]);
    res.redirect("/quotes");
});//delete quotes



app.get("/dbTest", async(req, res) => {
   try {
        const [rows] = await conn.query("SELECT CURDATE()");
        res.send(rows);
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).send("Database error");
    }
});//dbTest

app.listen(3000, ()=>{
    console.log("Express server running")
})