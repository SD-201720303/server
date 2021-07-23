import axios from 'axios';

export function goEleicao(id, info, coord, eleicao) {

    if (info.eleicao === "valentao") 
        goValentao(id, info, coord);
    else if (info.eleicao === "anel") 
        goAnel(id, info, coord, eleicao);
     
}

async function goValentao(id, info, coord) {
    var competicao = [];
    var idMaximo = 0;

    for(const server of info.servidores_conhecidos) {
        try {
             const { data } = await axios(`${server.url}/info`).catch(err => console.log(`Erro! ${err.message}`));
            
            if (data.identificacao > info.identificacao && data.status === "up") {
                competicao.push(true)
                if (data.identificacao > idMaximo)
                        idMaximo = data.identificacao;
                
                axios.post(`${server.url}/eleicao`, { id }).catch(err => console.error(err.message));
            } else {
                competicao.push(false)
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    if(!competicao)
       handleCoordenador(id, info, coord);
    else
       indefCoordenador(id, info, coord, idMaximo);
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
