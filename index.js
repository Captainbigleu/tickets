// imports
const express = require('express');
const { Client } = require('pg');
require('dotenv').config()


// declarations
const app = express();
const port = 8000;
const client = new Client({
    user: process.env.DB_USERNAME,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432,
});

client.connect();

// for parsing application/json
app.use(express.json());

// Add headers before the routes are defined
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

// routes

app.get('/api/tickets', async (req, res) => {
    try {
        const data = await client.query('SELECT * FROM tickets ORDER BY created_at');

        res.status(200).json(
            {
                status: 'ok',
                message: 'liste des tickets',
                data: data.rows,
            });
    }
    catch (err) {
        res.status(500).json(
            {
                status: "fail",
                message: 'erreur serveur'
            }
        )
        console.log(err.stack)
    }
})


app.get('/api/tickets/:id', async (req, res) => {
    console.log(req.params)
    const id = parseInt(req.params.id);

    if (isNaN(id) == true) {
        res.status(406).json(
            {
                status: "fail",
                data: null,
                message: "entrer un nombre",
            }
        )

        return;
    }

    try {
        const data = await client.query('SELECT * FROM tickets where id = $1', [id]);

        if (data.rows.length === 1) {
            res.status(200).json(
                {
                    status: "ok",
                    data: data.rows[0],

                }
            )
        }
        else {
            res.status(404).json(
                {
                    status: "fail",
                    message: "cet id ne correspond à aucun ticket"
                });
        }

    }
    catch (err) {
        res.status(500).json(
            {
                status: "fail",
                message: "erreur serveur"
            }
        )
        console.log(err.stack)
    }
})


app.post('/api/tickets', async (req, res) => {
    console.log(req.body);
    const message = req.body.message;

    try {
        const data = await client.query('INSERT INTO tickets (message) VALUES ($1) RETURNING *', [message]);
        if (message) {
            res.status(201).json(
                {
                    status: "ok",
                    message: "ticket créé",
                    data: data.rows[0]
                }
            )

        } else {
            res.status(404).json(
                {
                    status: "fail",
                    message: "Aucun message, écrire un message"
                });

        }

    }
    catch (err) {
        res.status(500).json(
            {
                status: "fail",
                message: "erreur serveur"
            }
        )
        console.log(err.stack)
    }
})


app.delete('/api/tickets/:id', async (req, res) => {
    console.log(req.params);
    const id = parseInt(req.params.id);

    if (isNaN(id) == true) {
        res.status(406).json(
            {
                status: "fail",
                data: null,
                message: "entrer un nombre",
            }
        )

        return;
    }

    try {
        const data = await client.query('DELETE FROM tickets WHERE id = $1', [id]);

        if (data.rowCount === 1) {
            res.status(200).json(
                {
                    status: "ok",
                    data: id,
                    message: "ticket effacé",
                });
        }
        else {
            res.status(404).json(
                {
                    status: "fail",
                    message: "id ticket invalide"
                });
        }
    }
    catch (err) {
        res.status(500).json(
            {
                status: "fail",
                message: "erreur serveur"
            }
        )
        console.log(err.stack)
    };
})

app.put('/api/tickets', async (req, res) => {
    console.log(req.params);
    const { id, message, done } = req.body;
    console.log(message, done);

    if (isNaN(id) == true) {
        res.status(406).json(
            {
                status: "fail",
                data: null,
                message: "entrer un nombre",
            }
        )

        return;
    }

    try {
        const data = await client.query('UPDATE tickets SET message = $3, done = $2 WHERE id = $1 RETURNING *', [id, done, message]);

        if (data.rowCount === 1) {
            res.status(201).json(
                {
                    status: "succes",
                    data: data.rows[0]
                });
        }
        else {
            res.status(404).json(
                {
                    status: "fail",
                    message: "id ticket invalide"
                });
        }
    }
    catch (err) {
        res.status(500).json(
            {
                status: "fail",
                message: "erreur serveur"
            }
        )
        console.log(err.stack)
    }
})

// ecoute le port 8000
app.listen(port, () => {
    console.log(`Example app listening on port http://localhost:${port}`)
})