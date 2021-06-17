const express = require('express');
if (process.env.NODE_ENV !== "production")
    require('dotenv').config();

//const PORT = 3001;
const HOST = '0.0.0.0';
const cors = require('cors');


const app = express();
app.use(cors());
app.use(express.json());

var servidores = [];
var ocupado = false;
var tipoEleicao = "valentao";
var eleicaoAndamento = false;
var idCordenador = 0;
var idEleicao = 0;

var coordenador = { 
    "coordenador": 2,
    "id_eleicao": "o id da eleição"
  }

app.get('/info', (req, res) => {
    res.json({
        "componente": "server",
        "versao": "0.1",
        "descrição": "serve os clientes com os serviços x, y e z",
        "ponto_de_acesso": "https://sd-mgs.herokuapp.com/",
        "status": "up",
        "identificacao": 2,
        "lider": 0,
        "eleicao": "valentao",
        "servidores_conhecidos": [
        {
            id: 1,
            url: "https://sd-jhqs.herokuapp.com"
        },
        {
            id: 2,
            url: "https://sd-rdm.herokuapp.com"
        },
      
        {
            id: 3,
            url: "https://sd-dmss.herokuapp.com"
        },
        {
            id: 4,
            url: "https://sd-201620236.herokuapp.com"
        },
    ]
    });
});

app.post('/info', (req, res) => {
    res.json({
        "componente": "server",
        "descrição": "serve os clientes com os serviços x, y e z",
        "versao": "0.1",
        "ponto_de_acesso": "https://sd-mgs.herokuapp.com/",
        "status": "up",
        "identificacao": 2,
        "lider": 0,
        "eleicao": "valentao",
        "servidores_conhecidos": [
        {
            id: 1,
            url: "https://sd-jhqs.herokuapp.com"
        },
        {
            id: 2,
            url: "https://sd-rdm.herokuapp.com"
        },
      
        {
            id: 3,
            url: "https://sd-dmss.herokuapp.com"
        },
        {
            id: 4,
            url: "https://sd-201620236.herokuapp.com"
        },
    ]
    });
});

app.post('/recurso', (req, res) => {

    if(ocupado) { res.status(409).json({ 'isOcupado': ocupado }); return; }

    ocupado = true;

    res.json({ 'ocupado': ocupado });

    setTimeout(() => ocupado = false, 10000);
});


app.post('/eleicao', (req, res) => {
   var { id } = req.body;

    eleicaoAndamento = true;

    res.status(200).json();
});

app.post('/eleicao/coordenador', (req, res) => {
    coordenador.coordenador = req.body.coordenador;
    coordenador.id_eleicao = req.body.id_eleicao;

    res.json({ 
    "coordenador": 2,
    "id_eleicao": "o id da eleição"
  })
});

app.get('/recurso', (req, res)=> {
    res.json({ 'ocupado': ocupado });
});

app.get('/eleicao', (req, res)=> {
    res.json({ 'tipo_de_eleicao_ativa': tipoEleicao, 'eleicao_em_andamento': eleicaoAndamento });
});


app.listen(parseInt(process.env.PORT), HOST);
