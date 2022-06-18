import './App.css'
import times from 'lodash/times'
import cloneDeep from 'lodash/cloneDeep'
import { useEffect, useState } from 'react'
import isEqual from 'lodash/isEqual'
import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'

const App = () => {
  const [dimensions, setDimensions] = useState({ x: 10, y: 10 })
  const [puzzle, setPuzzle] = useState(null)
  const [solution, setSolution] = useState(null)
  const [topRow, setTopRow] = useState(null)
  const [sideRow, setSideRow] = useState(null)
  const [isSolved, setIsSolved] = useState(false)

  const startNewGame = () => {
    setSolution(
      times(dimensions.y, () =>
        times(dimensions.x, () => (Math.random() >= 0.5 ? 1 : 0))
      )
    )
  }

  useEffect(() => {
    startNewGame()
  }, [dimensions])

  useEffect(() => {
    if (dimensions.x && dimensions.y) {
      setPuzzle(times(dimensions.y, () => times(dimensions.x, () => 0)))
    }
  }, [dimensions])
  useEffect(() => {
    if (solution) {
      const clues = times(dimensions.x, (num) => {
        const row = times(dimensions.y, (num2) => solution[num2][num])
          .join('')
          .split('0')
          .filter((n) => n)
          .map((n) => n.length)
        return row.length > 0 ? row : [0]
      })

      setTopRow(clues)
    }
  }, [solution])

  useEffect(() => {
    if (solution) {
      const clues = solution.map((row) => {
        const thing = row
          .join('')
          .split('0')
          .filter((n) => n)
          .map((n) => n.length)
        return thing.length > 0 ? thing : [0]
      })
      setSideRow(clues)
    }
  }, [solution])

  useEffect(() => {
    if (solution && puzzle) {
      const puzzleWithout2s = puzzle.map((a) => a.map((b) => (b === 2 ? 0 : b)))
      setIsSolved(isEqual(solution, puzzleWithout2s))
    }
  }, [solution, puzzle])

  const toggleBlock = (y, x) => () => {
    const newPuzzleState = cloneDeep(puzzle)
    newPuzzleState[y][x] = newPuzzleState[y][x] === 1 ? 0 : 1
    setPuzzle(newPuzzleState)
  }

  const toggleNoBlock = (y, x) => (e) => {
    e.preventDefault()
    const newPuzzleState = cloneDeep(puzzle)
    newPuzzleState[y][x] = newPuzzleState[y][x] === 2 ? 0 : 2
    setPuzzle(newPuzzleState)
  }

  return (
    <div>
      <div>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ display: 'inline-flex', width: 30 * (dimensions.x / 2), borderColor: 'black', borderStyle: 'solid', borderWidth: 1 }} />
          {topRow?.map((r) => (
            <Box sx={{ display: 'inline-flex', width: 50, height: 30 * (dimensions.y / 2), borderColor: 'black', borderStyle: 'solid', borderWidth: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {r.map(f => <Box >{f}</Box>)}
              </Box>
            </Box>
          ))}
        </Box>
      </div>
      <div>
        {puzzle?.map((row, i) => (
          <Box sx={{ display: 'flex' }}>
            <Box sx={{ width: 30 * (dimensions.x / 2), borderColor: 'black', borderStyle: 'solid', borderWidth: 1 }}>{sideRow?.[i].map(j => <Box sx={{ display: 'inline-flex'}}>{j}</Box>)}</Box>
            {row.map((column, i2) => (
              <Box
                onClick={toggleBlock(i, i2)}
                onContextMenu={toggleNoBlock(i, i2)}
                sx={{
                  borderColor: 'black',
                  borderWidth: 1,
                  borderStyle: 'solid',
                  width: 50,
                  height: 50,
                  display: 'inline-flex',
                  background: column === 1 ? 'blue' : 'white',
                }}
              >
                {column === 2 && <CloseIcon sx={{ fontSize: 50 }} />}
              </Box>
            ))}
          </Box>
        ))}
      </div>
      {isSolved && <div>You win!</div>}
    </div>
  )
}

export default App
