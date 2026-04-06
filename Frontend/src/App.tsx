import { useState, useEffect } from 'react';

function App() {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [results, setResults] = useState<string[][]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initGame = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/start', { method: 'POST' });
        
        if (!res.ok) throw new Error("Server failed to initialize");
        
        // Only set ready to true once the backend confirms success.
        setIsReady(true);
      } catch (err) {
        console.error(err);
      }
    };

    initGame();
  }, []);

  // Handle Keyboard Input
  useEffect(() => {
    const handleInput = async (e: KeyboardEvent) => {
      if (gameOver) return;

      // Handle Submit
      if (e.key === 'Enter' && currentGuess.length === 5) {
        if (!isReady) {
            console.warn("Wait for the word to be chosen!");
            return;
        }
        try {
          const res = await fetch('http://localhost:5000/api/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guess: currentGuess })
          });
          
          if (!res.ok) throw new Error("Backend rejected guess");
          
          const data = await res.json();
          
          setResults(prev => [...prev, data.result]);
          setGuesses(prev => [...prev, currentGuess]);
          setCurrentGuess('');
          
          if (data.isWin) setGameOver(true);
          
        } catch (error) {
          console.error("Error submitting guess:", error);
        }
      }

      // Handle Delete
      if (e.key === 'Backspace') {
        setCurrentGuess(prev => prev.slice(0, -1));
      }
      
      // Handle Typing (A-Z only)
      if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 5) {
        setCurrentGuess(prev => prev + e.key.toUpperCase());
      }
    };

    window.addEventListener('keyup', handleInput);
    return () => window.removeEventListener('keyup', handleInput);
  }, [currentGuess, gameOver]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white font-sans">
      <h1 className="text-4xl font-bold mb-8 tracking-wider border-b border-gray-700 pb-2 px-10">
        WORDLE
      </h1>
      
      <div className="grid gap-1.5">
        {[...Array(6)].map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5">
            {[...Array(5)].map((_, colIndex) => {
              // Determine what letter to show in this specific box.
              const char = (guesses[rowIndex] || (rowIndex === guesses.length ? currentGuess : ''))[colIndex] || '';
              // Determine what color the backend said this box should be.
              const status = results[rowIndex]?.[colIndex];
              
              return (
                <div 
                  key={colIndex} 
                  className={`w-16 h-16 border-2 flex items-center justify-center text-3xl font-bold uppercase transition-all duration-300
                    ${status === 'correct' ? 'bg-wordle-green border-wordle-green' : 
                      status === 'present' ? 'bg-wordle-yellow border-wordle-yellow' : 
                      status === 'absent' ? 'bg-wordle-gray border-wordle-gray' : 
                      char ? 'border-gray-500' : 'border-gray-700'}`}
                >
                  {char}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {gameOver && (
        <div className="mt-8 px-6 py-3 bg-white text-black font-bold rounded shadow-lg animate-bounce">
          You Win!
        </div>
      )}
    </div>
  );
}

export default App;