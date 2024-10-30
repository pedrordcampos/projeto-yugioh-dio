const state = {
    score: {
        playerScore: 0,
        computerScore: 0,
        scoreBox: document.getElementById('score_points'),
    },
    cardSprites: {
        avatar: document.getElementById('card-image'),
        name: document.getElementById('card-name'),
        type: document.getElementById('card-type'),
    },
    fieldCards: {
        player: document.getElementById('player-field-card'),
        computer: document.getElementById('computer-field-card'),
    },
    playerSides: {
        player1: 'player-cards',
        player1Box: document.querySelector("#player-cards"),
        computer: 'computer-cards',
        computerBox: document.querySelector("#computer-cards"),
    },
    actions: {
        button: document.getElementById('next-duel'),
    },   
};

const pathImages = "src/assets/icons/";
const cardData = [
    {
        id: 0,
        name: "Blue Eyes White Dragon",
        type: 'Paper',
        img: `${pathImages}dragon.png`,
        WinOf: [1],
        LoseOf: [2],
    },
    {
        id: 1,
        name: "Dark Magician",
        type: 'Rock',
        img: `${pathImages}magician.png`,
        WinOf: [2],
        LoseOf: [0],
    },
    {
        id: 2,
        name: "Exodia",
        type: 'Scissors',
        img: `${pathImages}exodia.png`,
        WinOf: [0],
        LoseOf: [1],
    },
];

async function getRandomCardId() {
    const randomIndex = Math.floor(Math.random() * cardData.length);
    return cardData[randomIndex].id;    
}

async function createCardImage(IdCard, fieldSide) {
    const cardImage = document.createElement("img");
    cardImage.setAttribute("height", "100px");
    cardImage.setAttribute("src", "src/assets/icons/card-back.png");
    cardImage.setAttribute("data-id", IdCard);
    cardImage.classList.add("card");

    if(fieldSide === state.playerSides.player1Box) {
        cardImage.addEventListener('mouseover', ()=> {
            drawSelectCard(IdCard);
        });
        cardImage.addEventListener('click', ()=> {
            setCardsField(cardImage.getAttribute('data-id'));
        });
    }

    return cardImage;
}

async function drawCards(cardNumbers, fieldSide) {
    const fieldBox = fieldSide === 'player-cards' ? state.playerSides.player1Box : state.playerSides.computerBox;

    for(let i = 0; i < cardNumbers; i++) {
        const randomIdCard = await getRandomCardId();
        const cardImage = await createCardImage(randomIdCard, fieldBox);

        fieldBox.appendChild(cardImage);
    }
}

async function drawButton(duelResults) {
    const button = state.actions.button;
    button.innerText = duelResults;
    button.style.display = "block"; 
    button.style.visibility = "visible"; 
}

async function setCardsField(cardId) {
    await removeAllCardsImages();
    let computerCardId = await getRandomCardId();

    state.fieldCards.player.style.display = "block";
    state.fieldCards.computer.style.display = "block";

    state.fieldCards.player.src = cardData[cardId].img;
    state.fieldCards.computer.src = cardData[computerCardId].img;

    let duelResults = await checkDuelResults(cardId, computerCardId); 
    await updateScore();
    await drawButton(duelResults); 
}

async function removeAllCardsImages() {
    let {computerBox, player1Box } = state.playerSides;
    let imgElements = computerBox.querySelectorAll("img");
    imgElements.forEach((img) => img.remove());

    imgElements = player1Box.querySelectorAll("img");
    imgElements.forEach((img) => img.remove());
}

async function checkDuelResults(playerCardId, computerCardId) {
    let duelResults = "DRAW"; 
    let playerCard = cardData[playerCardId];
    let winningCardId; 

    if (playerCard.WinOf.includes(computerCardId)) {
        duelResults = "WIN";
        await playAudio("win");
        state.score.playerScore++;
        winningCardId = playerCardId; 
    } else if (playerCard.LoseOf.includes(computerCardId)) {
        duelResults = "LOSE";
        await playAudio("lose");
        state.score.computerScore++;
        winningCardId = computerCardId; 
    } else {
        await playAudio("draw");

        state.fieldCards.player.classList.add('blink');
        state.fieldCards.computer.classList.add('blink');

        setTimeout(() => {
            state.fieldCards.player.classList.remove('blink'); 
            state.fieldCards.computer.classList.remove('blink'); 
        }, 2000);
    }

    if (winningCardId !== undefined) {
        const winningCardImage = winningCardId === playerCardId ? state.fieldCards.player : state.fieldCards.computer;
        winningCardImage.classList.add('blink'); 
        
        setTimeout(() => {
            winningCardImage.classList.remove('blink'); 
        }, 2000);
    }

    return duelResults; 
}

async function updateScore() {
    state.score.scoreBox.innerText = `Player: ${state.score.playerScore} | Computer: ${state.score.computerScore}`;
}

async function drawSelectCard(index) {
    state.cardSprites.avatar.src = cardData[index].img;
    state.cardSprites.name.innerText = cardData[index].name;
    state.cardSprites.type.innerText = "Attribute : " + cardData[index].type;   
}

async function hiddenCardsDetail (){

    state.cardSprites.avatar.src = "";
    state.cardSprites.name.innerText = "";
    state.cardSprites.type.innerText = "";

    state.actions.button.style.display = "none"; 
    state.fieldCards.player.style.display = "none";
    state.fieldCards.computer.style.display = "none";

}

async function resetDuel() {
    
    await hiddenCardsDetail();
    await removeAllCardsImages(); 

    state.fieldCards.player.classList.remove('blink');
    state.fieldCards.computer.classList.remove('blink');

    init();
}

async function playAudio(status) {
    const audio = new Audio(`/src/assets/audios/${status}.mp3`);
    try {
        audio.play();
    }catch {};  
    
}

const bgm = new Audio("src/assets/audios/egyptian_duel.mp3");
bgm.volume = 0.5;
bgm.loop = true;

let isMuted = false; 

function toggleSound() {
    const soundIcon = document.getElementById("sound-icon");

    if (isMuted) {
        bgm.play().catch(error => console.error("Erro ao reproduzir o áudio:", error));
        soundIcon.src = "src/assets/icons/sound-on.png";
    } else {
        bgm.pause();
        soundIcon.src = "src/assets/icons/sound-off.png";
    }
    isMuted = !isMuted;
}

function tryPlayAudio() {
    if (!isMuted) {
        bgm.play().catch(() => {
            document.body.addEventListener('click', playOnFirstInteraction, { once: true });
        });
    }
}

function playOnFirstInteraction() {
    if (!isMuted) {
        bgm.play().catch(error => console.error("Erro ao reproduzir o áudio:", error));
    }
}

function init() {
    tryPlayAudio();

    document.getElementById("sound-icon").addEventListener("click", toggleSound);

    state.fieldCards.player.src = ""; 
    state.fieldCards.computer.src = ""; 
    drawCards(5, 'player-cards');
    drawCards(5, 'computer-cards');
}

init();
