import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== "production") {
    dotenv.config();
}

//const PORT = 3001;
const HOST = '0.0.0.0';

const app = express();
app.use(express.urlencoded({ extended: true}))
app.use(cors());
app.use(express.json());

import * as startEleicao from './src/startEleicao.js';
//const recurso = require ('./src/recurso.js');


//var servidores = [];
var ocupado = false;
//var tipoEleicao = "valentao";
//var eleicaoAndamento = false;
//var idCordenador = 0;
//var idEleicao = 0;

var info = {
    componente: "server",
    versao: "0.1",
    descricao: "serve os clientes com os serviços x, y, z",
    ponto_de_acesso: "https://sd-mgs.herokuapp.com",
    status: "up",
    identificacao: 1,
    lider: false,
    eleicao: "valentao",
    servidores_conhecidos: [
        {
            id: 1,
            url: "https://sd-rdm.herokuapp.com"
        },
        // {
        //     id: 2,
        //     url: "https://sd-201620236.herokuapp.com"
        // },
        {
            id: 3,
            url: "https://sd-jhsq.herokuapp.com"
        },
        {
            id: 4,
            url: "https://sd-dmss.herokuapp.com"
        },
        {
            id: 5,
            url: "https://sd-app-server-jesulino.herokuapp.com"
        }
    ]
}
var coordenador = { 
    "coordenador": 2,
    "id_eleicao": ""
  }

var eleicao = {  
    "tipo_de_eleicao_ativa": info.eleicao,
    "eleicao_em_andamento": false
}



app.post('/info', (req, resp) => {
    info.status = req.body.status || info.status
    info.identificacao = req.body.identificacao ?? info.identificacao
    info.lider = req.body.lider ?? info.lider
    info.eleicao = req.body.eleicao || info.eleicao 
    req.body.eleicao === "valentao" || req.body.eleicao === "anel"
    req.body.status === "up" || req.body.status === "down"
    eleicao.tipo_de_eleicao_ativa = info.eleicao 

    resp.send(info)
})

app.get('/info', (req, resp) => {
    resp.send(info)
});

app.post('/recurso', async (req, res) => {
    if (!ocupado && info.lider) {
        ocupado = true
        res.json({ ocupado })
        setTimeout(() => ocupado = false, 20000)
    } else if (!ocupado && !info.lider) {
        const leaderIsBusy = (info.servidores_conhecidos);

        if (leaderIsBusy) {
            ocupado = true
            res.status(200).json({ ocupado })
            setTimeout(() => ocupado = false, 20000)
        }
        else {
            ocupado = true
            res.json({ ocupado })
            setTimeout(() => ocupado = false, 20000)
        }
    } else if (ocupado) {
        res.status(409).json({ ocupado })
    }
})

app.post('/eleicao', (req, res) => {
    const { id } = req.body;

    if (eleicao.eleicao_em_andamento === false || info.eleicao === "anel") {
        eleicao.eleicao_em_andamento = true;
        startEleicao.goEleicao(id, info, coordenador, eleicao);
    }

    if (info.lider)
        eleicao.eleicao_em_andamento = false;

    res.status(200).json(coordenador);
})

app.post('/eleicao/coordenador', (req, res) => {
    coordenador.coordenador = req.body.coordenador;
    coordenador.id_eleicao = req.body.id_eleicao;
    eleicao.eleicao_em_andamento = false;

    if(req.body.coordenador === info.identificacao)
        info.lider = true; 
        else  
        info.lider = false;

    res.json(coordenador)
});

app.get('/recurso', async (req, res) => {
    if (info.lider)
        res.json({ ocupado, id_lider: info.identificacao })
    else {
        const leaderId = (info.servidores_conhecidos);

        if (ocupado)
            res.status(409).json({ ocupado, id_lider: leaderId })
        else
            res.json({ ocupado, id_lider: leaderId })
    }
})


app.get('/eleicao', (req, res) => {res.json(eleicao)
})

app.get('/eleicao/coordenador', (req, resp) => {
    resp.send(coordenador)
});




app.listen(parseInt(process.env.PORT), HOST);