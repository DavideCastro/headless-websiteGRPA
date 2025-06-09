import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import DynamicPage from './pages/DynamicPage';
import Game from "./pages/Game.jsx";
import './App.css';

function App() {
    return (
        <div className="app-container">
            <header>
                <h1>Lost in the Dark</h1>
                <Navbar />
            </header>

            <Routes>
                <Route path="/" element={<Navigate to="/description" replace />} />
                <Route path="/game" element={<Game />} />
                <Route path="/:slug" element={<DynamicPage />} />
            </Routes>

            <footer>
                <img src="/headless-websiteGRPA/ressources/images/logo.png" alt="HES-SO Logo" />
            </footer>
        </div>
    );
}
export default App;