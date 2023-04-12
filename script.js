import Grid from './Grid.js';
import Tile from './Tile.js';

const gameBoard = document.getElementById('game-board');
const scoreAmount = document.getElementById('score-amount');
const tryAgain = document.getElementById('try-again');
const modalTryAgain = document.getElementById('modal-try-again');
const bestScore = document.getElementById('best-score');
const scoreValue = document.getElementById('score-value');
const modalWindow = document.getElementById('modalWindow');
const modalWinner = document.getElementById('modalWinner');
const modalInfo = document.getElementById('modalInfo');
const closeModal = document.getElementById('close-modal');
const closeModalWinner = document.getElementById('close-modal-winner');
const closeModalInfo = document.getElementById('close-modal-info');
const moreInfo = document.getElementById('more-info');

let modalWinnerShown = false;

const grid = new Grid(gameBoard);

grid.randomEmptyCell().tile = new Tile(gameBoard);
grid.randomEmptyCell().tile = new Tile(gameBoard);
setupInput();

function setupInput() {
  if (!scoreAmount.textContent.length) {
    scoreAmount.textContent = 0;
  }

  if (!bestScore.textContent.length) {
    bestScore.textContent = 0;
  }

  scoreAmount.addEventListener('animationend', () => scoreAmount.classList.remove('score-animation'), { once: true });
  scoreValue.addEventListener('animationend', () => scoreValue.classList.remove('added-score'), { once: true });
  bestScore.addEventListener('animationend', () => bestScore.classList.remove('score-animation'), { once: true });

  window.addEventListener('keydown', handleInput, { once: true });
}

tryAgain.addEventListener('click', handleClick);
modalTryAgain.addEventListener('click', () => {
  modalWindow.style.display = 'none';
  handleClick();
});
closeModal.addEventListener('click', () => {
  modalWindow.style.display = 'none';
})
window.addEventListener('click', (event) => {
  if (event.target === modalWindow) {
    modalWindow.style.display = 'none';
  }

  if (event.target === modalWinner) {
    modalWinner.style.display = 'none';
    setupInput();
  }

  if (event.target === modalInfo) {
    modalInfo.style.display = 'none';
  }
});
closeModalWinner.addEventListener('click', () => {
  modalWinner.style.display = 'none';
  setupInput();
});
moreInfo.addEventListener('click', () => {
  modalInfo.style.display = 'flex';
});
closeModalInfo.addEventListener('click', () => {
  modalInfo.style.display = 'none';
});

function handleClick() {
  scoreAmount.textContent = 0;

  grid.cells.forEach(cell => {
    cell.removeTile();
    cell.score = 0;
  });

  grid.randomEmptyCell().tile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = new Tile(gameBoard);

  setupInput();
}

async function handleInput(e) {
  switch (e.key) {
    case 'ArrowUp':
      if (!canMoveUp()) {
        setupInput();

        return;
      }
      await moveUp();
      break;

    case 'ArrowDown':
      if (!canMoveDown()) {
        setupInput();

        return;
      }
      await moveDown();
      break;

    case 'ArrowLeft':
      if (!canMoveLeft()) {
        setupInput();

        return;
      }
      await moveLeft();
      break;

    case 'ArrowRight':
      if (!canMoveRight()) {
        setupInput();

        return;
      }
      await moveRight();
      break;

    default:
      setupInput();
      return;
  }

  grid.cells.forEach(cell => cell.mergeTiles());

  getScore();

  const newTile = new Tile(gameBoard);
  grid.randomEmptyCell().tile = newTile;

  if (!canMoveUp() && !canMoveDown() && !canMoveLeft() && !canMoveRight()) {
    Promise.all([
      newTile.waitForTransition(true),
      waitForAnimation(scoreAmount, 'score-animation'),
      waitForAnimation(scoreValue, 'added-score'),
      waitForAnimation(bestScore, 'score-animation'),
    ]).then(() => {
      modalWindow.style.display = 'flex';
    });

    return;
  }

  const filledTiles = grid.cells.map(cell => {
    if (cell.tile) {
      return cell.tile.value;
    }
    
    return;
  });

  if (!filledTiles.some(value => value === 2048) || modalWinnerShown) {
    setupInput();
  }

  if (filledTiles.some(value => value === 2048) && !modalWinnerShown) {
    Promise.all([
      waitForAnimation(scoreAmount, 'score-animation'),
      waitForAnimation(scoreValue, 'added-score'),
      waitForAnimation(bestScore, 'score-animation'),
    ]).then(() => {
      modalWinner.style.display = 'flex';
      modalWinnerShown = true;
    });
  };
}

function moveUp() {
  return slideTiles(grid.cellsByColumn);
}

function moveDown() {
  return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()));
}

function moveLeft() {
  return slideTiles(grid.cellsByRow);
}

function moveRight() {
  return slideTiles(grid.cellsByRow.map(row => [...row].reverse()));
}

function slideTiles(cells) {
  return Promise.all(
  cells.flatMap(group => {
    const promises = [];

    for (let i = 1; i < group.length; i++) {
      const cell = group[i];

      if (cell.tile == null) continue;

      let lastValidCell;

      for (let j = i - 1; j >= 0; j--) {
        const moveToCell = group[j];

        if (!moveToCell.canAcceptTile(cell.tile)) break;

        lastValidCell = moveToCell;
      }

      if (lastValidCell != null) {
        promises.push(cell.tile.waitForTransition());

        if (lastValidCell.tile != null) {
          lastValidCell.mergeTile = cell.tile;
        } else {
          lastValidCell.tile = cell.tile;
        }

        cell.tile = null;
      }
    }

    return promises;
  }))
}

function canMoveUp() {
  return canMove(grid.cellsByColumn);
}

function canMoveDown() {
  return canMove(grid.cellsByColumn.map(column => [...column].reverse()));
}

function canMoveLeft() {
  return canMove(grid.cellsByRow);
}

function canMoveRight() {
  return canMove(grid.cellsByRow.map(row => [...row].reverse()));
}

function canMove(cells) {
  return cells.some(group => {
    return group.some((cell, index) => {
      if (index === 0) return false;

      if (cell.tile == null) return false;

      const moveToCell = group[index - 1];

      return moveToCell.canAcceptTile(cell.tile);
    })
  })
}

function getScore() {
  const scoresArray = grid.cells.map(cell => cell.score)
    .filter(score => !!score);

  const addedValueArray = grid.cells.map(cell => cell.addedValue)
    .filter(value => !!value);

  let score;
  let addedValue;

  if (!!scoresArray.length) {
    score = scoresArray.reduce((prev, current) => prev + current);
  }

  if (!!addedValueArray.length) {
    addedValue = addedValueArray.reduce((prev, curr) => prev + curr);
  }
  
  if (score > 0 && +scoreAmount.textContent < score) {
    scoreAmount.textContent = score;
    scoreAmount.classList.add('score-animation');
    scoreValue.style.setProperty('--score', `${addedValue}`);
    scoreValue.classList.add('added-score');
  }

  if (+bestScore.textContent < +scoreAmount.textContent) {
    bestScore.textContent = score;
    bestScore.classList.add('score-animation');
  }

  grid.cells.forEach(cell => cell.addedValue = 0);
}

function waitForAnimation(element, value) {
  return new Promise(resolve => {
    element.addEventListener(
      'animationend',
      resolve(element.classList.remove(value)),
      { once: true },
    )
  })
}
