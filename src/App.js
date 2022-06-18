import './App.css'
import times from 'lodash/times'
import cloneDeep from 'lodash/cloneDeep'
import { useEffect, useState, useRef } from 'react'
import isEqual from 'lodash/isEqual'
import Box from '@mui/material/Box'
import CloseIcon from '@mui/icons-material/Close'
import tmi from 'tmi.js'

const App = () => {
  const [dimensions, setDimensions] = useState({ x: 5, y: 5 })
  const [difficulty, setDifficulty] = useState('easy')
  const [puzzle, setPuzzle] = useState(null)
  const [solution, setSolution] = useState(null)
  const [topRow, setTopRow] = useState(null)
  const [sideRow, setSideRow] = useState(null)
  const [isSolved, setIsSolved] = useState(false)
  const puzzleRef = useRef(puzzle)
  const difficulties = {
    easy: 0.4,
    medium: 0.5,
    hard: 0.6,
  }

  const startNewGame = () => {
    setSolution(
      times(dimensions.y, () =>
        times(dimensions.x, () =>
          Math.random() >= difficulties[difficulty] ? 1 : 0
        )
      )
    )
  }

  useEffect(() => {
    const client = new tmi.Client({
      connection: {
        reconnect: true
      },
      channels: [
        'dada5714'
      ]
    });
    
    client.connect();

    client.on('message', async (channel, context, message) => {
      console.log('channel', {
        channel,
        user: context.username,
        message
      });

      if (message === '!reset') {
        startNewGame()
      }

      if (message[0] === '!' && message.replace("!", "").split(',').length === 2) {
        const [x, y] = message.replace("!", "").split(',')
        const newPuzzleState = cloneDeep(puzzleRef.current)
        console.log(newPuzzleState)
        newPuzzleState[y - 1][x - 1] = newPuzzleState[y - 1][x - 1] === 1 ? 0 : 1
        setPuzzle(newPuzzleState)
      }
      if (message[0] === 'x' && message.replace("x", "").split(',').length === 2) {
        const [x, y] = message.replace("x", "").split(',')
        const newPuzzleState = cloneDeep(puzzleRef.current)
        console.log(newPuzzleState)
        newPuzzleState[y - 1][x - 1] = newPuzzleState[y - 1][x - 1] === 2 ? 0 : 2
        setPuzzle(newPuzzleState)
      }
    });
  }, [])

  useEffect(() => {
    startNewGame()
  }, [])

  useEffect(() => {
    puzzleRef.current = puzzle
  }, [puzzle])

  useEffect(() => {
    if (dimensions.x && dimensions.y) {
      setPuzzle(times(dimensions.y, () => times(dimensions.x, () => 0)))
    }
  }, [solution])

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
    if (isSolved) return
    const newPuzzleState = cloneDeep(puzzle)
    newPuzzleState[y][x] = newPuzzleState[y][x] === 1 ? 0 : 1
    setPuzzle(newPuzzleState)
  }

  const toggleNoBlock = (y, x) => (e) => {
    e.preventDefault()
    if (isSolved) return
    const newPuzzleState = cloneDeep(puzzle)
    newPuzzleState[y][x] = newPuzzleState[y][x] === 2 ? 0 : 2
    setPuzzle(newPuzzleState)
  }

  return (
    <Box sx={{ alignItems: 'center', justifyContent: 'center', display: 'flex', height: '100%' }}>
      <Box sx={{ border: '2px solid black' }}>
        <Box sx={{ display: 'flex' }}>
          <Box
            sx={{
              display: 'inline-flex',
              width: 30 * (dimensions.x / 2),
              borderColor: 'black',
              borderStyle: 'solid',
              borderWidth: 1,
              alignItems: 'center',
            }}
          />
          {topRow?.map((r) => (
            <Box
              sx={{
                display: 'inline-flex',
                width: 50,
                height: 30 * (dimensions.y / 2),
                borderColor: 'black',
                borderStyle: 'solid',
                borderWidth: 1,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {r.map((f) => (
                  <Box>{f}</Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
        {puzzle?.map((row, i) => (
          <Box sx={{ display: 'flex' }}>
            <Box
              sx={{
                width: 30 * (dimensions.x / 2),
                borderColor: 'black',
                borderStyle: 'solid',
                borderWidth: 1,
              }}
            >
              {sideRow?.[i].map((j) => (
                <Box sx={{ display: 'inline-flex' }}>{j}</Box>
              ))}
            </Box>
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
                  transition: '0.3s',
                  '&:hover': {
                    background: column === 1 ? 'blue': 'lightblue',
                    opacity: '0.7'
                  }
                }}
              >
                {column === 2 && <CloseIcon sx={{ fontSize: 50 }} />}
              </Box>
            ))}
          </Box>
        ))}
        {isSolved && <div>You win!</div>}
      </Box>
    </Box>
  )
}

export default App
