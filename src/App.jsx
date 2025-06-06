import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home';
import Description from './pages/Description';
import Logbook from './pages/Logbook';
import Flow from './pages/Flow';
import Mockup from './pages/Mockup';
import Model from './pages/Model';
import Game from "./pages/Game.jsx";
import Rules from './pages/Rules';

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/description" element={<Description />} />
                <Route path="/logbook" element={<Logbook />} />
                <Route path="/flow" element={<Flow />} />
                <Route path="/mockup" element={<Mockup />} />
                <Route path="/model" element={<Model />} />
                <Route path="/rules" element={<Rules />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </>
    );
}

export default App;
