function Game() {
    return (
        <div style={{ padding: '20px' }}>
            <h1>Play the Game</h1>
            <iframe
                src="/game.html"
                title="Lost in the Dark"
                width="100%"
                height="800px"
                style={{ border: 'none' }}
            />
        </div>
    );
}

export default Game;
