// Criação do baralho com símbolos
const criarBaralho = () => {
    const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
    const naipes = ["♠", "♥", "♣", "♦"]
    return naipes.flatMap(naipe => valores.map(valor => ({
            carta: `${valor}${naipe}`, //representa a carta com valor e naipe
            valor: valor === "A" ? 11 : ["J", "Q", "K"].includes(valor) ? 10 :
            parseInt(valor)}))).sort(() => Math.random() - 0.5) // Embaralha o baralho 
}

// função para calcular o valor das cartas
const calcularValor = cartas => {
    // Pega  os valores das cartas
    const valores = cartas.map(carta => carta.valor)
    const soma = valores.reduce((acc, val) => acc + val, 0)  
    const ases = valores.filter(val => val === 11).length // Conta quantos ases existem na mão   
    return soma > 21 && ases > 0 ?
    calcularValor(cartas.slice(1).concat({ valor: 1 })) : soma // se a soma ultrapassar 21 e houver  ases ajusta o valor do ás para 1
}

// inicialização do jogo
const inicializarJogo = (placar = {jogador: 0, oponente: 0 }) => {
    const baralho = criarBaralho()
    return {
        baralho,jogador: { cartas: [baralho[0], baralho[2]] }, // O jogador começa com duas cartas
        oponente: { cartas: [baralho[1], baralho[3]] }, // O oponente também começa com duas cartas
        status: "jogando", placar, indiceBaralho: 4
    }
}

// permite que o jogador compre uma nova carta
const jogadorCompra = estado => {
    if (estado.status !== "jogando") return estado
    const novaCarta = estado.baralho[estado.indiceBaralho] // obtém a próxima carta do baralho
    const novoJogador = { cartas: [...estado.jogador.cartas, novaCarta] } // adiciona a carta à mão do jogador
    const pontos = calcularValor(novoJogador.cartas) 
    return pontos > 21 ? { ...estado, jogador: novoJogador, status: "perdeu" } :
           { ...estado, jogador: novoJogador, indiceBaralho: estado.indiceBaralho + 1 } // atualiza o estado do jogo
}
//o oponente compra uma carta
const oponenteCompra = estado => {
    if (estado.status !== "jogando") return estado
    const pontosOponente = calcularValor(estado.oponente.cartas)
    if (pontosOponente >= 17) {
        return verificarResultado(estado)
    }
    const novaCarta = estado.baralho[estado.indiceBaralho]
    const novoOponente = { cartas: [...estado.oponente.cartas, novaCarta] }
    const novoEstado = { ...estado, oponente: novoOponente, indiceBaralho: estado.indiceBaralho + 1 }
    const novosPontosOponente = calcularValor(novoOponente.cartas)
    if (novosPontosOponente > 21) {
        return { ...novoEstado, status: "ganhou" }
    }
    return novoEstado
}
// oponente jogando
const oponenteJoga = estado => {
    if (estado.status !== "jogando") return estado
    
    const pontosOponente = calcularValor(estado.oponente.cartas)
    if (pontosOponente >= 17) {
        return { ...estado, status: definirVencedor(estado) } // O oponente para de jogar se tiver 17 pontos ou mais
    }
    // O oponente compra uma nova carta
    const novaCarta = estado.baralho[estado.indiceBaralho]
    const novoOponente = { cartas: [...estado.oponente.cartas, novaCarta] }
    const novoEstado = { ...estado, oponente: novoOponente, indiceBaralho: estado.indiceBaralho + 1 }
    return oponenteJoga(novoEstado)
}

// determina o vencedor
const definirVencedor = estado => {
    const pontosJogador = calcularValor(estado.jogador.cartas)
    const pontosOponente = calcularValor(estado.oponente.cartas)
    if (pontosJogador > 21) return "perdeu"
    if (pontosJogador === 21) return "ganhou"
    if (pontosOponente === 21) return "perdeu"
    if (pontosOponente > 21 || pontosJogador > pontosOponente) return "ganhou" 
    if (pontosJogador === pontosOponente) return "empate" 
    if (pontosOponente > 21) return "perdeu" 
}
// funcao para atualizar o placar
const atualizarPlacar = (estado) => {
    if (estado.status === "jogando" || estado.status === "empate") return estado
    const novoPlacar = {
        jogador: estado.status === "ganhou" ? estado.placar.jogador + 1 : estado.placar.jogador,
        oponente: estado.status === "perdeu" ? estado.placar.oponente + 1 : estado.placar.oponente
    }
    return { ...estado, placar: novoPlacar }
}
// verifica o resultado atual do jogo
const verificarResultado = estado => {
    const pontosJogador = calcularValor(estado.jogador.cartas)
    const pontosOponente = calcularValor(estado.oponente.cartas)
    if (pontosJogador > 21) return { ...estado, status: "perdeu" }
    if (pontosOponente > 21) return { ...estado, status: "ganhou" }
    if( pontosJogador === 21) return { ...estado, status: "ganhou" }
    if(pontosOponente === 21) return { ...estado, status: "perdeu" }
    return estado
}
// função para renderizar uma carta na tela baseada na cor do naipe
const renderizarCarta = (carta) => {
    const naipesVermelhos = ["♥", "♦"]
    const isRed = naipesVermelhos.includes(carta.carta.slice(-1)) // verifica tem o naipe vermelho   
    return `<div class="card" ${isRed ? 'data-red="true"' : ""}>${carta.carta}</div>` // aplica estilo e retorna HTML
}

// função para atualizar a exibição das cartas, pontuação, placar e resultado do jogo na tela
const atualizarTela = (estado) => {
    document.getElementById("jogador-cartas").innerHTML = estado.jogador.cartas.map(renderizarCarta).join("")
    document.getElementById("oponente-cartas").innerHTML = estado.oponente.cartas.map(renderizarCarta).join("")
    document.getElementById("jogador-pontos").textContent = calcularValor(estado.jogador.cartas)
    document.getElementById("oponente-pontos").textContent = calcularValor(estado.oponente.cartas)
    document.getElementById("placar").textContent = `Jogador: ${estado.placar.jogador} | Oponente: ${estado.placar.oponente}`
    document.getElementById("resultado").textContent = estado.status === "ganhou" ? "Você venceu!" :
    estado.status === "perdeu"? "Você perdeu!":
    estado.status === "empate"? "Empate!": ""
}
//função para processar uma rodada
const processarRodada = estado => {
    if (estado.status !== "jogando") return estado
    return oponenteCompra(estado)
}
const iniciar = (estado = inicializarJogo()) => {
    atualizarTela(estado)
    document.getElementById("comprar").onclick = () => {  
        const estadoAposJogador = jogadorCompra(estado)
        const novoEstado = estadoAposJogador.status === "jogando" ?
        processarRodada(estadoAposJogador) : estadoAposJogador
        iniciar(atualizarPlacar(novoEstado))
    }
    document.getElementById("parar").onclick = () => {    
        const novoEstado = oponenteJoga(estado)
        iniciar(atualizarPlacar(novoEstado))
    }
    document.getElementById("reiniciar").onclick = () => iniciar(inicializarJogo(estado.placar))
}

//inicializar o jogo
iniciar()