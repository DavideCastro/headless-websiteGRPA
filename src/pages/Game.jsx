function Game() {
    const basePath = import.meta.env.BASE_URL || '/';
    return (
        <div style={{ padding: '20px' }}>
            <h1>Play the Game</h1>
            <iframe
                src={`${basePath}game.html`}
                title="Lost in the Dark"
                width="100%"
                height="800px"
                style={{ border: 'none' }}
            />
        </div>
    );
}

export default Game;
