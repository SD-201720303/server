import axios from 'axios';

export function goEleicao(id, info, coord, eleicao) {

    if (info.eleicao === "valentao") {
        goValentao(id, info, coord);
    } else if (info.eleicao === "anel") {
        goAnel(id, info, coord, eleicao);
     }
}

async function goValentao(id, info, coord) {
    var hasCompetition = [];
    var idMaximo = 0;

    for(const server of info.servidores_conhecidos) {
        try {
             const { data } = await axios(`${server.url}/info`).catch(err => console.log(`Erro! ${err.message}`));
            
            if (data.identificacao > info.identificacao && data.status === "up") {
                hasCompetition.push(true)
                if (data.identificacao > idMaximo)
                        idMaximo = data.identificacao;
                
                axios.post(`${server.url}/eleicao`, { id }).catch(err => console.error(err.message));
            } else {
                hasCompetition.push(false)
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    if(!hasCompetition)
       handleCoordenador(id, info, coord);
    else
       unsetCoordenador(id, info, coord, idMaximo);
}
async function pegarDadosProcessados(url) {
    let v;
    try {
      v = await baixarDados(url);
    } catch(e) {
      v = await baixarDadosReservas(url);
    }
    return processarDadosNoWorker(v);
  }
  
async function goAnel (id, info, coord, eleicao) {
    var ids = id.split("-");
    ids.shift();
    ids = ids.map(filteredId => parseInt(filteredId));

    if (ids[0] === info.identificacao) {
        const idMaximo = Math.max(...ids);

        if (idMaximo === info.identificacao)
            handleCoordenador(id, info, coord);
        else {
            unsetCoordenador(id, info, coord, idMaximo);

            for (const server of info.servidores_conhecidos) {
                axios.post(`${server.url}/eleicao/coordenador`, {
                    coordenador: idMaximo,
                    id_eleicao: id
                }).catch(err => console.error(err.message));
            }

            eleicao.eleicao_em_andamento = false;
        }
    } else {
        if (!ids.some(elem => elem === info.identificacao))
            id = id.concat(`-${info.identificacao}`);

        let servers = [];
        for (const server of info.servidores_conhecidos) {
            const { data } = await axios(`${server.url}/info`)
                .catch(err => console.log(`Erro! ${err.message}`));

            if (data.status === "up" && data.eleicao === "anel")
                servers.push({
                    identificacao: data.identificacao,
                    url: server.url
                })
        }

        const serverIds = servers.map(server => server.identificacao);

        if (Math.max(info.identificacao, ...serverIds) === info.identificacao) {
            const minId = Math.min(...serverIds);
            const selectedServer = servers.filter(server => {
                if (server.identificacao === minId)
                    return server;
            });
            axios.post(`${selectedServer[0].url}/eleicao`, { id }).catch(err => console.error(err.message));
        }
        else {
            const idMaximo = Math.max(info.identificacao, ...serverIds);
            const selectedServer = servers.filter(server => {
                if (server.identificacao === idMaximo)
                    return server;
            });
            axios.post(`${selectedServer[0].url}/eleicao`, { id }).catch(err => console.error(err.message));
        }

    }
}


export function handleCoordenador(id, info, coord) {
    info.lider = true;
    coord.coordenador = info.identificacao;
    coord.id_eleicao = id;
    
    info.servidores_conhecidos.forEach(server => {
        axios.post(`${server.url}/eleicao/coordenador`, {
            coordenador: info.identificacao,
            id_eleicao: id
        }).catch(err => console.error(err.message));
    })
}
export function unsetCoordenador (id, info, coord, idMaximo) {
    info.lider = false;
    coord.coordenador = idMaximo;
    coord.id_eleicao = id;
}