const GRID_SIZE = 4;
const CELL_SIZE = 17;
const CELL_GAP = 2;

export default class Grid {
  #cells;

  constructor(gridElement) {
    gridElement.style.setProperty("--grid-size", GRID_SIZE);
    gridElement.style.setProperty("--cell-size", `${CELL_SIZE}vmin`);
    gridElement.style.setProperty("--cell-gap", `${CELL_GAP}vmin`);
    this.#cells = createCellElement(gridElement)
      .map((cellElement, index) => {
        return new Cell(
          cellElement,
          index % GRID_SIZE,
          Math.floor(index / GRID_SIZE),
        )
      });
  }

  get cells() {
    return this.#cells;
  }

  get #emptyCells() {
    return this.#cells.filter(cell => cell.tile == null);
  }

  randomEmptyCell() {
    const randomIndex = Math.floor(Math.random() * this.#emptyCells.length);

    return this.#emptyCells[randomIndex];
  }

  get cellsByColumn() {
    return this.#cells.reduce((cellGrid, cell) => {
      cellGrid[cell.x] = cellGrid[cell.x] || [];
      cellGrid[cell.x][cell.y] = cell;

      return cellGrid;
    }, []);
  }

  get cellsByRow() {
    return this.#cells.reduce((cellGrid, cell) => {
      cellGrid[cell.y] = cellGrid[cell.y] || [];
      cellGrid[cell.y][cell.x] = cell;

      return cellGrid;
    }, []);
  }
};

class Cell {
  #cellElement;
  #x;
  #y;
  #tile;
  #mergeTile;
  #score;
  #addedValue;

  constructor(cellElement, x, y) {
    this.#cellElement = cellElement;
    this.#x = x;
    this.#y = y;
  }

  get x() {
    return this.#x;
  }

  get y() {
    return this.#y;
  }

  get tile() {
    return this.#tile;
  }

  set tile(value) {
    this.#tile = value;

    if (value == null) return;

    this.#tile.x = this.#x;
    this.#tile.y = this.#y;
  }

  get mergeTile() {
    return this.#mergeTile;
  }

  set mergeTile(value) {
    this.#mergeTile = value;

    if (value == null) return;

    this.#mergeTile.x = this.#x;
    this.#mergeTile.y = this.#y;
  }

  get score() {
    return this.#score;
  }

  set score(value) {
    if (!this.#score || !value) {
      this.#score = 0;
    }

    this.#score = this.#score + value;
  }

  get addedValue() {
    return this.#addedValue;
  }

  set addedValue(value) {
    if (!this.#addedValue || !value) {
      this.#addedValue = 0;
    }

    this.#addedValue = value;
  }

  canAcceptTile(tile) {
    return (
      this.#tile == null ||
      (this.mergeTile == null && this.tile.value === tile.value)
    )
  }

  mergeTiles() {
    if (this.tile == null || this.mergeTile == null) return;

    this.tile.value = this.tile.value + this.mergeTile.value;
    this.score = this.tile.value;
    this.addedValue = this.tile.value;
    this.mergeTile.remove();
    this.mergeTile = null;
  }

  removeTile() {
    if (!this.tile) return;

    this.tile.remove();
    this.tile = null;
  }
}

function createCellElement(gridElement) {
  const cells = [];

  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cells.push(cell);
    gridElement.append(cell);
  }

  return cells;
}
