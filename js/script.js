const mario = document.querySelector('.mario');
const game = document.querySelector('.game-board');
const scoreLabel = document.querySelector('.score');
const gameoverLabel = document.querySelector('.gameover');

// variaveis
var gameStarted = false;
var isDead = false;
var isJumping = false;
var scored = false;
var cloudsArray = [];
var pipesArray = [];
var score = 0;
var clouds_loop = undefined;
var pipes_loop = undefined;
var esperaDepoisCriaCano = undefined;
var pipeSpawnSpeed = 2000; // 2s
var canCreatePipe = true;

// sounds
const jumpSound = new Audio('./sounds/mario_jump.mp3');
const deathSound = new Audio('./sounds/mario_death.mp3');
const themeSound = new Audio('./sounds/mario_theme.mp3');

jumpSound.volume = 0.05;
deathSound.volume = 0.5;
themeSound.currentTime = 0.2;
themeSound.volume = 0.3;
themeSound.loop= true;

const jump = () => {
    isJumping = true;
    mario.classList.add('jump');

    jumpSound.pause();
    jumpSound.currentTime = 0;
    jumpSound.play();

    setTimeout(() => {

        mario.classList.remove('jump');
        isJumping = false;

    }, 500);

    console.log('Pulou')
};

// cria uma imagem da nuvem 
const createClouds = () => {
    let newClouds = document.createElement('img');
    newClouds.setAttribute('src', './images/clouds.png')
    newClouds.classList.add('clouds');

    game.appendChild(newClouds); 
    cloudsArray.push(newClouds);

    setTimeout(() => {

        let cloudPosition = newClouds.offsetLeft + newClouds.offsetWidth;

        if (cloudPosition <= 0) {
            const index = cloudsArray.indexOf(newClouds);
            if (index > -1) { // only splice array when item is found
                cloudsArray.splice(index, 1); // 2nd parameter means remove one item only
            }

            game.removeChild(newClouds);
            console.log('destruiu nuvem');
        }        

    }, 19000); // A animação da nuvem dura 20 segundos, então destruímos ela um pouco antes
}

const createPipes = () => {
    let newPipe = document.createElement('img');
    newPipe.setAttribute('src', './images/pipe.png')
    newPipe.classList.add('pipe');

    game.appendChild(newPipe);
    pipesArray.push(newPipe);

    setTimeout(() => {
        if (!isDead) {
            const index = pipesArray.indexOf(newPipe);
            if (index > -1) { // only splice array when item is found
                pipesArray.splice(index, 1); // 2nd parameter means remove one item only
            }

            game.removeChild(newPipe);
            console.log('destruiu cano');
        }

    }, 2000); // Depois de 2 segundos deve destruir o cano
}

/*const criaLoopPipes = () => {
    pipes_loop = setTimeout(() => {
        createPipes();
    }, pipeSpawnSpeed);
}*/

const startGame = () => {
    const startgameBackground = document.querySelector('.startgame-background');
    startgameBackground.style.visibility = 'hidden';    

    game.style.filter = 'none';
    game.style.webkitFilter = 'none';
    scoreLabel.style.visibility = 'visible';
    mario.style.visibility = 'visible';

    // cria a primeira nuvem
    createClouds();

    // cria uma nuvem a cada 10 segundos
    clouds_loop = setInterval(() => {
        createClouds();
    }, 10000);

    themeSound.play();

    gameStarted = true;
    console.log('Iniciou o jogo');
}

// verifica a tecla que foi apertada
document.addEventListener('keydown', event => {
    if (!gameStarted) {
        startGame();
    }
    else
    if ((event.code === 'Space' || event.code === 'ArrowUp') && !isJumping && !isDead) {
        jump();
    }
    else
    if (event.code === 'KeyR') {
        document.location.reload(true);
    }
});

// verifica se clicou na tela
document.addEventListener('mousedown', event => {
    if (!gameStarted) {
        startGame();
    }
    else
    if (!isJumping && !isDead) {
        jump();
    }
});

const pontuar = () => {
    scored = true;
    score += 10;
    scoreLabel.innerHTML = 'SCORE: ' + score;

    setTimeout(() => {

        scored = false;

    }, 500);
}

const pipe_Speed_Up = setInterval(() => {
    if (pipeSpawnSpeed > 600) {
        pipeSpawnSpeed -= 200; // diminui 0.2s
        console.log('Pipe speed: ' + pipeSpawnSpeed);
    }
}, 10000);

const randomSpeedVariation = () => {
    let num = Math.floor(Math.random() * ((pipeSpawnSpeed / 2) - 200)) + 1; // this will get a random number
    num *= Math.round(Math.random()) ? 1 : -1; // this will add minus sign in 50% of cases
    
    console.log(num);
    
    return num;
}

const pipe_Spawner = setInterval(() => {
    if (gameStarted) {
        // Para o loop e recria ele com o tempo atualizado
        //clearInterval(pipes_loop);
        //criaLoopPipes();

        if (canCreatePipe) {
            canCreatePipe = false;
                        
            esperaDepoisCriaCano = setTimeout(() => {
                createPipes();
                canCreatePipe = true;
            }, pipeSpawnSpeed + randomSpeedVariation());    
        }
    }
}, 10);

// loop do jogo
const game_loop = setInterval(() => {

    pipesArray.forEach((thisPipe) => {
        const pipePosition = thisPipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
        
        // Se entrar nesse IF é porque o jogo acabou
        if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
            isDead = true;

            deathSound.currentTime = 0.6; // adicionado porque o som tem alguns segundos de silêncio
            deathSound.play();
            themeSound.pause();
            jumpSound.pause();

            thisPipe.style.animation = 'none';
            thisPipe.style.left = `${pipePosition}px`;

            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;

            mario.src = './images/game-over.png';
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';
            
            cloudsArray.forEach((c) => {
                let cloudLeft = c.offsetLeft;

                c.style.animation = 'none';
                c.style.left = `${cloudLeft}px`;
            });

            pipesArray.forEach((p) => {
                let pipeLeft = p.offsetLeft;

                p.style.animation = 'none';
                p.style.left = `${pipeLeft}px`;
            });

            // Insere o text de gameover
            scoreLabel.style.fontSize = '50px';      
            scoreLabel.style.top = '150px';
            scoreLabel.style.right = 'auto';
            gameoverLabel.style.visibility = 'visible';

            const restartLabel = document.querySelector('#restart');
            restartLabel.style.visibility = 'visible';

            clearInterval(clouds_loop);
            clearInterval(game_loop);     
            clearInterval(pipe_Spawner);
            clearInterval(pipe_Speed_Up);
            clearTimeout(esperaDepoisCriaCano);
            
            console.log('Game over');
        }
        else 
        // pontuou
        if (pipePosition <= 0 && !scored) {
            pontuar();
        }
    });

}, 10);