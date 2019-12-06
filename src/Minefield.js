import React, { Component } from 'react';
import './Minefield.css';

const CellState = { default: 0, revealed: 1, flagged: -1 }

function Svg({ size, color='#000000', ...props }) {
  return (
    <svg width={size} height={size} stroke={color} fill={color} {...props} />
  )
}

function FlagSvg({ size=48, strokeWidth=3, ...props}) {
  return (
    <Svg size={size} strokeWidth={strokeWidth}
         fill="none" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12"></polyline>
    </Svg>
  )
}

function MineSvg({ size=48, strokeWidth=3, ...props}) {
  return (
    <Svg size={size} strokeWidth={strokeWidth}
         fill="none" viewBox="0 0 24 24">
      <line x1="12" y1="2" x2="12" y2="6"></line>
      <line x1="12" y1="18" x2="12" y2="22"></line>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
      <line x1="2" y1="12" x2="6" y2="12"></line>
      <line x1="18" y1="12" x2="22" y2="12"></line>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
    </Svg>
  )
}

function Cell({ value, state, onClick }) {
  let content
  switch (state) {
  case CellState.revealed:
    content = isNaN(value) ? <MineSvg size="16" strokeWidth="2"/> : value
    break;
  case CellState.flagged:
    content = <FlagSvg size="16" strokeWidth="2"/>
    break;
  default:
    content = null
  }
  return (
    <button className="cell" onClick={onClick} datavalue={isNaN(value) ? 'mine' : value}>
      {content}
    </button>
  )
}

class Board extends Component {
  renderCell(cell, x, y) {
    return (
      <Cell key={x + " " + y}
        value={cell.value}
        state={cell.state}
        onClick={() => this.props.onCellClick(x, y)}
      />
    )
  }
  renderRow(row, y) {
    return (
      <span className="board-row" key={y}>
        {row.map((cell, x) => this.renderCell(cell, x, y))}
      </span>      
    )
  }
  render() {    
    return (
      <div>
        {this.props.cells.map((row, y) => this.renderRow(row, y))}
      </div>
    )
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      settings: { width: 10, height: 10, mines: 10 },
      cells: this.constructor.generateCells(10, 10)
    }
  }
  static generateCells(width, height) {
    const empty = { value: 0, state: CellState.default }
    return Array(height).fill()
      .map(() => Array(width).fill().map(() => ({ ...empty })))    
  }
  static neighborCoords(cells, x, y) {
    return (
      [[x-1,y-1],[x-1,y],[x-1,y+1],[x,y-1],[x,y+1],[x+1,y-1],[x+1,y],[x+1,y+1]]
        .filter(p => cells[p[1]] != undefined && cells[p[1]][p[0]] != undefined)
    )
  }
  static areCellsEmpty(cells) {
    return cells.every(row => row.every(cell => !(cell.value || cell.state)))
  }
  static reveal(cells, x, y) {
    if (cells[y][x].state == CellState.revealed) {
      return
    }
    cells[y][x].state = CellState.revealed
    if (!cells[y][x].value && !isNaN(cells[y][x].value)) {
      const neighbors = this.neighborCoords(cells, x, y)
      neighbors.forEach(([i, j]) => this.reveal(cells, i, j))
    }
  }
  static handleDefaultCellClick(cells, x, y) {
    this.reveal(cells, x, y)
  }
  static handleRevealedCellClick(cells, x, y) {
    const neighbors = this.neighborCoords(cells, x, y)
    const flagged = neighbors.filter(
      ([i, j]) => cells[j][i].state == CellState.flagged
    )
    if (flagged.length == cells[y][x].value) {
      neighbors.filter(([i, j]) => cells[j][i].state != CellState.flagged)
        .forEach(([i, j]) => this.reveal(cells, x, y))
    }
  }
  static handleFlaggedCellClick(cells, x, y) {
  }
  handleCellClick(x, y) {
        const { cells } = this.state
// const cells = this.state.cells.map(row => row.map(cell => ({ ...cell })))
    switch (cells[y][x].state) {
    case CellState.default:
      this.constructor.handleDefaultCellClick(cells, x, y)
      break
    case CellState.revealed:
      this.constructor.handleRevealedCellClick(cells, x, y)
      break
    case CellState.flagged:
      this.constructor.handleFlaggedCellClick(cells, x, y)
      break
    }
    this.setState({ cells })
  }
  setMines(startX, startY) {
    let { width, height, mines } = this.state.settings
    const { cells } = this.state
    // const cells = this.state.cells.map(row => row.map(cell => ({ ...cell })))
    // const cells = this.constructor.generateCells(width, height)
    let indices = [...Array(width * height).keys()]
    indices.splice(startX + startY * width, 1)
    while (mines && indices.length) {
      const pos = Math.floor(Math.random() * indices.length)
      const index = indices[pos]
      const { x, y } = { x: index % height, y: ~~(index / width) }
      cells[y][x].value = NaN
      const neighbors = this.constructor.neighborCoords(cells, x, y)
      neighbors.forEach(([i, j]) => cells[j][i].value++)
      mines--
      indices.splice(pos, 1)
    }
    this.setState({ cells })
  }
  render() {
    const { cells } = this.state
    // const cells = this.state.cells.map(row => row.map(cell => ({ ...cell })))
    return (
      <div className="game">
        <h1>MineSweeper</h1> 
        <Board
          className="board"
          cells={cells}
          onCellClick={(x, y) => {
            if (this.constructor.areCellsEmpty(cells)) {
              this.setMines(x, y)
            }
            this.handleCellClick(x, y) 
          }}
        />
      </div>
    )
  }
}


export default Game;

