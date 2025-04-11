import { Component } from 'solid-js'
import TetrisGame from './components/TetrisGame'
import './App.css'

const App: Component = () => {
  return (
    <div class="App">
      <header>
        <h1>テトリス</h1>
      </header>
      <main>
        <TetrisGame />
      </main>
    </div>
  )
}

export default App
