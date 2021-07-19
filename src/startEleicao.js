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
       indefCoordenador(id, info, coord, idMaximo);
}
  
async function goAnel(id, info, coord, eleicao) {
    let ids 
    let servers = [];
    for (const server of info.servidores_conhecidos) {
        const { data } = await axios(`${server.url}/info`)
            .catch(err => console.log(`Connection error! ${err.message}`));

        if (data.status === "up" && data.eleicao === "anel")
            servers.push({
                identificacao: data.identificacao,
                url: server.url
            })
    }

    if (ids[0] === info.identificacao) {
        const maxId = Math.max(...ids);

        if (maxId === info.identificacao)
            handleCoordenador(id, info, coord, servers); else {
            indefCoordenador(id, info, coord, maxId);

            for (const server of servers) {
                axios.post(`${server.url}/eleicao/coordenador`, {
                    coordenador: maxId,
                    id_eleicao: id
                })
            }

            eleicao.eleicao_em_andamento = false;
        }
    } else {
        if (!ids.some(elem => elem === info.identificacao))
            id = id.concat(`-${info.identificacao}`);

        const serverIds = servers.map(server => server.identificacao);

        if (Math.max(info.identificacao, ...serverIds) === info.identificacao) {
            const minId = Math.min(...serverIds);
            const selecionaServidor = servers.filter(server => {
                if (server.identificacao === minId)
                    return server;
            });
            axios.post(`${selecionaServidor[0].url}/eleicao`, { id }).catch(err => console.error(err.message));
        }
        else {
            const selecionaServidor = servers.find(server => server.identificacao > info.identificacao);
            axios.post(`${selecionaServidor.url}/eleicao`, { id }).catch(err => console.error(err.message));
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
export function indefCoordenador (id, info, coord, idMaximo) {
    info.lider = false;
    coord.coordenador = idMaximo;
    coord.id_eleicao = id;
}