const express = require('express');
if (process.env.NODE_ENV !== "production")
    require('dotenv').config();

//const PORT = 3001;
const HOST = '0.0.0.0';

const app = express();

let servidores = [];
let ocupado = false;
let tipoEleicao = "valentao";
let eleicaoAndamento = false;
let idCordenador = 0;
let idEleicao = 0;

app.get('/info', (req, res) => {
    res.json({
        "componente": "server",
        "descrição": "serve os clientes com os serviços x, y e z",
        "versao": "0.1",
        "ponto_de_acesso": "https://meu-app-sd.heroku.com",
        "status": "up",
        "identificacao": 2,
        "lider": 0,
        "eleicao": tipoEleicao,
        "eleicao_em_andamento": eleicaoAndamento,
        "servidores_conhecidos": servidores
    });
});

app.post('/recurso', (req, res) => {

    let { timeBusy } = req.body;

    timeBusy = (timeBusy == null || timeBusy == undefined) ? 10000 : timeBusy;

    if(ocupado) { res.status(409).json({ 'isOcupado': ocupado }); return; }

    ocupado = true;

    res.json({ 'isOcupado': ocupado });

    setTimeout(() => ocupado = false, timeBusy);
});


app.post('/eleicao', (req, res) => {
    let { id } = req.body;

    eleicaoAndamento = true;

    res.status(200);
});

app.post('/eleicao/coordenador', (req, res) => {
    let { idCord, idElei } = req.body;

    idCordenador = idCord;
    idEleicao = idElei;

    res.status(200);
});

app.get('/recurso', (req, res)=> {
    res.json({ 'isOcupado': ocupado });
});

app.get('/eleicao', (req, res)=> {
    res.json({ 'tipo_eleicao_ativa': tipoEleicao, 'eleicao_em_andamento': eleicaoAndamento });
});


app.listen(parseInt(process.env.PORT), HOST);