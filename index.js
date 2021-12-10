const http = require("http");
const jwt = require("jsonwebtoken");
const config = require('./config');
const rp = require('request-promise');
require('dotenv').config();
const express = require("express"); 
const mysql = require('mysql2');
const app = express();
app.use(express.json());

const {DB_USER, DB_PASSWORD, DB_HOST, DB_DATABASE} = process.env; // pool pra acesso no bd
const pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    database: DB_DATABASE,
    password: DB_PASSWORD
})


const payload = { // token de  verificação
    iss: config.APIKey,
    exp: ((new Date()).getTime() + 5000)
};
const token = jwt.sign(payload, config.APISecret);

app.post('/user', (req, res) => { // criar novo usuario no bd
    const name = req.body.name;
    const user = req.body.user;
    const email = req.body.email;
    const phone = req.body.phone;
    const password = req.body.password;
    const sql = "INSERT INTO pessoa (nome, nome_de_usuario, email, telefone, senha) VALUES (?, ?, ?, ?, ?)"
    pool.query(
        sql,
        [name, user, email, phone, password],
        (err, results, fields) => {
            console.log(results);
            console.log(fields);
            res.status(201).json(req.body);
        }
    )
})

app.post('/meeting/create', (req, res) => {

    const options = {
        method: 'POST',
        uri: "https://api.zoom.us/v2/users/cauesantos.9781@aluno.saojudas.br/meetings",
        body: req.body,
        auth: {
            'bearer': token
        },
        headers: {
            'User-Agent': 'Zoom-api-Jwt-Request',
            'content-type': 'application/json'
        },
        json: true
    };

    rp(options).then(response => {
        res.send(response);
    }).catch(err => {
        console.log(`API call failed. Reason: ${err}`)
    })
})


const porta = 3000;
app.set('port', porta);
const server = http.createServer(app);
server.listen(porta, () => console.log(`Servidor rodando na porta ${porta}`));
