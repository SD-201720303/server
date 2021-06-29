import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== "production") {

    dotenv.config();
}

//const PORT = 3001;
const HOST = '0.0.0.0';



const app = express();
app.use(cors());
app.use(express.json());

import * as startEleicao from './src/startEleicao.js';


//var servidores = [];
var ocupado = false;
//var tipoEleicao = "valentao";
//var eleicaoAndamento = false;
//var idCordenador = 0;
//var idEleicao = 0;

var info = {"componente": "server",
"versao": "0.1",
"descrição": "serve os clientes com os serviços x, y e z",
"ponto_de_acesso": "https://sd-mgs.herokuapp.com/",
"status": "up",
"identificacao": 1,
"lider": false,
"eleicao": "valentao",
"servidores_conhecidos": [
{
    id: 1,
    url: "https://sd-jhqs.herokuapp.com",
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
{
    id: 5,
    url: "https://sd-app-server-jesulino.herokuapp.com"
},
]
}
var coordenador = { 
    "coordenador": 2,
    "id_eleicao": "o id da eleição"
  }

var eleicao = {
    "tipo_de_eleicao_ativa": info.eleicao,
    "eleicao_em_andamento": false
}


app.get('/info', (req, resp) => {
    resp.send(info)
});

app.post('/info', (req, resp) => {
    info.status = req.body.status || info.status
    info.identificacao = req.body.identificacao ?? info.identificacao
    info.lider = req.body.lider ?? info.lider
    info.eleicao = req.body.eleicao || info.eleicao
    resp.send(info)
  })

app.post('/recurso', (req, res) => {

    if(ocupado) { res.status(409).json({ 'ocupado': ocupado }); return; }

    ocupado = true;

    res.json({ 'ocupado': ocupado });

    setTimeout(() => ocupado = false, 10000);
});


app.post('/eleicao', (req, res) => {
    const {id} = req.body;

    if (eleicao.eleicao_em_andamento === false) {
        eleicao.eleicao_em_andamento = true;
        startEleicao.runEleicao(id, info, coordenador);
    }

    eleicao.eleicao_em_andamento = false;
    res.status(200).json(coordenador);
})

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

app.get('/eleicao', (req, res) => res.json(eleicao))

app.listen(parseInt(process.env.PORT), HOST);