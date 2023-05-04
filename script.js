let start = document.getElementById("start");
let title = document.getElementById("title");
let map = document.getElementById("map");
let restart = document.getElementById("restart");
let score = document.getElementById("score");
let scoreValue = 0;
// Variavel usada para saber para qual lado a cobrinha está andando (ela inicia andando para cima)
let target = 'w';
let startGame = false;
// Serve para verificar se não há movimento pendente, para cada movimento esperar pelo proximo para ser efetuado
let pendingMove = false;
// Declaração do tamanho e do mapa e da matriz responsável por gerenciar esse mapa
let mapColumnSize = 21;
let mapLineSize = 11;
let mapPositions = new Array(mapLineSize);
// Em js uma matriz é um vetor de vetores, portanto é necessário declarar o vetor e após declarar outros vetores dentro
for (let i = 0; i < mapLineSize; i++) {
	mapPositions[i] = new Array(mapColumnSize);
}
// Velocidade que a cobrinha percorre em ms
let speed = 120;
let initColumnPosition = Math.round((mapColumnSize / 2) - 1);
let initLinePosition = Math.round((mapLineSize / 2) - 2);

let foodPosition = null;

// Função construtora para definir um objeto que terá a posição de cada nodo da cobra
function Nodo(linePosition, columnPosition) {
	this.linePosition = linePosition;
	this.columnPosition = columnPosition;
}

// Toda cobrinha começara com 2 de tamanho, sendo o primeiro a cabeça e o restante o corpo
let snake = [new Nodo((initLinePosition), initColumnPosition), new Nodo((initLinePosition + 1), initColumnPosition), new Nodo((initLinePosition + 2), initColumnPosition)];

// Método de reiniciar o jogo, apenas atualiza a pagina xD
restart.addEventListener("click", () => {
	window.location.reload();
});

// Método para desenhar a cobrinha
let printSnake = () => {
	// For para desenhar a cobrinha no mapa
	for (let i = 0; i < snake.length; i++) {
		if (((snake[0].linePosition >= 0 && snake[0].linePosition < (mapLineSize)) && (snake[0].columnPosition >= 0 && snake[0].columnPosition < (mapColumnSize)))) {
			if (i === 0) {
				mapPositions[snake[i].linePosition][snake[i].columnPosition].style.backgroundColor = "#1d2400";
			} else {
				mapPositions[snake[i].linePosition][snake[i].columnPosition].style.backgroundColor = "#005a17";
			}
		}
	}
}

//Variavel que receberá o setInterval
let myInterval;

// Evento de click que aguarda a tecla espaço (Code 32)
document.addEventListener('keypress', function (e) {

	// Tecla espaço para iniciar o jogo
	if (e.which == 32 && startGame === false) {
		start.style.display = "none";
		// For para percorrer e desenhar minha matriz do mapa
		for (let x = 0; x < mapLineSize; x++) {
			for (let y = 0; y < mapColumnSize; y++) {
				// Adiciono um elemento do tipo div para cada posição do meu mapa
				mapPositions[x][y] = document.createElement("div");
				// Defino uma classe para cada um desses elementos para poder manusear pelo css
				mapPositions[x][y].className = "map-position";

				// Adiciono as divs ao meu mapa
				map.append(mapPositions[x][y]);
			}
		}
		startGame = true;
		foodRespawn();
		score.innerHTML = scoreValue;
		//A cobrinha precisa ficar em constante movimento, portanto terá esse setInterval executando o movimento
		myInterval = setInterval(() => {
			move();
			pendingMove = false;
		}, speed);
	}

	/* Lista de movimentações:
	OBS: sempre cuidando para não movimentar para o target oposto do movimento atual
	e verifico se não há um movimento pendente para evitar que eu mude diretamente o trageto para o lado oposto
	clicando rapido nas teclas para fazer um retorno
	*/

	// Movimentação para baixo
	if (target !== 's' && (e.which == 87 || e.which == 119) && !pendingMove) {
		direction = 'x';
		signal = '-';
		target = 'w';
		pendingMove = true;
	}

	// Movimentação para cima
	if (target !== 'w' && (e.which == 83 || e.which == 115) && !pendingMove) {
		direction = 'x';
		signal = '+';
		target = 's';
		pendingMove = true;
	}

	// Movimentação para direita
	if (target !== 'd' && (e.which == 10 || e.which == 97) && !pendingMove) {
		direction = 'y';
		signal = '-';
		target = 'a';
		pendingMove = true;
	}

	// Movimentação para a esquerda
	if (target !== 'a' && (e.which == 13 || e.which == 100) && !pendingMove) {
		direction = 'y';
		signal = '+';
		target = 'd';
		pendingMove = true;
	}

}, false);


// Eixo que a cobrinha está andando, se é o x ou y, e se ela está indo pra frente ou pra traz subindo ou descendo
let direction = 'x';
let signal = '-';

// Método para verificar se ocorreu alguma colisão em parede ou no corpo
let colision = () => {
	// Colisão no corpo, verifico se a posição da cabeça é igual a posição de algum nodo do corpo
	for (let i = 1; i < snake.length; i++) {
		if (JSON.stringify(snake[0]) == JSON.stringify(snake[i])) {
			return true;
		}
	}

	// Colisão nas paredes, verifico se a posição da cabeça extrapolou as dimensões do mapa
	if ((snake[0].linePosition >= 0 && snake[0].linePosition < (mapLineSize)) && (snake[0].columnPosition >= 0 && snake[0].columnPosition < (mapColumnSize))) {
		return false;
	}
	return true;
}

// Metodo para movimentar a cobrinha
async function move() {
	if (startGame == true && !colision()) {
		// Copiando o conteudo do array, sem receber a referencia
		let snakeAux = JSON.parse(JSON.stringify(snake));
		for (let i = 0; i < snake.length; i++) {
			// i === 0 é a cabeça da cobrinha
			if (i === 0) {
				if (direction === 'x' && signal === '-') {
					snake[i].linePosition--;
				}
				if (direction === 'x' && signal === '+') {
					snake[i].linePosition++;
				}
				if (direction === 'y' && signal === '-') {
					snake[i].columnPosition--;
				}
				if (direction === 'y' && signal === '+') {
					snake[i].columnPosition++;
				}
			}
			// Movimentação do resto do corpo, necessário validar se não houve colisão, para evitar deixar o corpo transparente quando morre
			if (i !== 0 && !colision()) {
				mapPositions[snake[i].linePosition][snake[i].columnPosition].style.backgroundColor = "transparent";
				snake[i] = snakeAux[i - 1];
			}

			// Verifico se houve uma colisão com algum alimento para gerar ele em outro local
			if (foodColision()) {
				foodRespawn();
				// Testando o melhor reposicionamento do novo nodo da cobrinha
				snake.push(new Nodo(snake[snake.length - 1].linePosition, snake[snake.length - 1].columnPosition));
			}
		}
		printSnake();
		mapPositions[randomLine][randomColumn].style.backgroundColor = "#fe6e52";
	} else {
		// Finalizo o meu setInterval
		clearInterval(myInterval);
	}
}

let foodPositionValidation = (randomColumn, randomLine) => {
	for (let i = 0; i < snake.length; i++) {
		// Verifico se a posição da comida não vai ser no corpo da cobrinha
		if ((snake[i].columnPosition === randomColumn) && (snake[i].linePosition === randomLine)){
			return true;
		}
	}
	// Verifico se a posição não é a mesma posição de antes
	if(foodPosition !== null){
		if((foodPosition.columnPosition === randomColumn) && (foodPosition.linePosition === randomLine)) {
			return true;
		}
	}

	return false;
}

// Método para gerar os alimentos
let foodRespawn = () => {
	// Gero a posição aleatoria de onde a comida vai ficar, depois valido essa posição no while
	randomColumn = Math.round(Math.random() * ((mapColumnSize - 1) - 0) + 0);
	randomLine = Math.round(Math.random() * ((mapLineSize - 1) - 0) + 0);
	while(foodPositionValidation(randomColumn, randomLine)){
		randomColumn = Math.round(Math.random() * ((mapColumnSize - 1) - 0) + 0);
		randomLine = Math.round(Math.random() * ((mapLineSize - 1) - 0) + 0);
	}

	// Guardo essa posição em um objeto
	foodPosition = new Nodo(randomLine, randomColumn);
	// Adiciono ele ao meu mapa
	// mapPositions[randomLine][randomColumn].style.backgroundColor = "#fe6e52";
}

let foodColision = () => {
	if (JSON.stringify(snake[0]) == JSON.stringify(foodPosition)) {
		scoreValue++;
		score.innerHTML = scoreValue;
		return true;
	}
	return false;
}
