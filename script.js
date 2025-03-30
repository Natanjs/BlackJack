// Criação do baralho com símbolos
const criarBaralho = () => {
    const valores = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    const naipes = ["♠", "♥", "♣", "♦"];
    return naipes.flatMap(naipe =>
        valores.map(valor => ({
            carta: `${valor}${naipe}`,
            valor: valor === "A" ? 11 : ["J", "Q", "K"].includes(valor) ? 10 : parseInt(valor)
        }))
    ).sort(() => Math.random() - 0.5); // Embaralha o baralho
};

// Cálculo do valor das cartas
const calcularValor = cartas => {
    const valores = cartas.map(carta => carta.valor);
    const soma = valores.reduce((acc, val) => acc + val, 0);
    const ases = valores.filter(val => val === 11).length;
    return soma > 21 && ases > 0
        ? calcularValor(cartas.slice(1).concat({ valor: 1 })) // Ajusta o valor do Ás
        : soma;
};

// Inicialização do jogo
const inicializarJogo = (placar = { jogador: 0, oponente: 0 }) => {
    const baralho = criarBaralho();
    return {
        baralho,
        jogador: { cartas: [baralho[0], baralho[2]] },
        oponente: { cartas: [baralho[1], baralho[3]] },
        status: "jogando",
        placar,
        indiceBaralho: 4
    };
};
