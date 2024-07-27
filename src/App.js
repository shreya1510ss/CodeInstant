import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';
import { Toaster } from 'react-hot-toast';
import Whiteboard from './components/Whiteboard';
import { EditorProvider} from './context/EditorContext'



function App() {
  return (
    <>
    <EditorProvider>
    <div>
      <Toaster
       position='top-center'

      ></Toaster>
    </div>
    <BrowserRouter>
    <Routes>
    <Route  path="/" element={<Home />} />
    <Route  path="/editor/:roomid" element={<EditorPage/>} />
    </Routes>
    </BrowserRouter>
    </EditorProvider>

    </>
  );
}

export default App;
