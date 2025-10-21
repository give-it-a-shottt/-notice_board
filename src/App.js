import { useState } from 'react';
import './App.css';
import MemoContainer from './components/MemoContainer';
import SideBar from './components/SideBar';

function App() {
  const [activeView, setActiveView] = useState('home');

  return (
    <div className="App">
      <SideBar activeView={activeView} onChangeView={setActiveView} />
      <MemoContainer activeView={activeView} onChangeView={setActiveView} />
    </div>
  );
}

export default App;
