import { Component } from 'solid-js'
import TetrisGame from './components/TetrisGame'
import './App.css'

const App: Component = () => {
  return (
    <div class="App">
      <main>
        <TetrisGame />
      </main>
    </div>
  )
}

export default App
