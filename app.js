const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const path = require('path');
require('dotenv').config();

/* Servidor de express */
const app = express();

/* CORS */
app.use(cors());

/* Directorio público */
app.use(express.static('public'));

/* Lectura y parseo del body */
app.use(express.json());

/* Configuración de Google - OAuth2 */
const oAuth2Client = new google.auth.OAuth2(process.env.ID_CLIENT, process.env.ID_SECRET, process.env.REDIRECT_URL);
oAuth2Client.setCredentials({refresh_token: process.env.REFRESH_TOKEN});

/* Rutas */
/* Ruta principal */
app.get('/api', (req, res, next) => {
    return res.status(200).json({
        ok: true
    });
});

/* Ruta para enviar email */
app.post('/api/email', async (req, res, next) => {
    // console.log(req.body);

    /* Opciones de nodemailer */
    const mailOptions = {
        to: process.env.USER_MAIL,
        from: req.body.email,
        subject: req.body.email,
        text: req.body.message
    }

    try {
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.USER_MAIL,
                clientId: process.env.ID_CLIENT,
                clientSecret: process.env.ID_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken
            }
        });

        const resp = await transport.sendMail(mailOptions);

        return res.status(200).json({
            ok: true,
            resp
        });
    } catch (e) {
        console.log(e);
        return res.status(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }
});

app.get('/*', function(req, res) {
    res.sendFile(path.join(__dirname, 'public/index.html'), function(err) {
        if (err) {
            res.status(500).send(err)
        }
    })
})

/* Escuchar peticiones */
app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${process.env.PORT}`);
});