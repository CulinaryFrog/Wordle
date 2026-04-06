import express from "express";
import type {Request, Response} from "express";
import { Pool } from "pg";
import cors from "cors";
import dotenv from "dotenv";

// Load values from .env 
dotenv.config();


const app = express();
app.use(cors({
  origin: "http://localhost:5173"
}));
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

let solutionWord = "";

// Get word
app.post("/api/start", async (req: Request, res: Response) => {
    try {
        const { rows } = await pool.query("SELECT word FROM wordbank ORDER BY RANDOM() LIMIT 1");
        solutionWord = rows[0].word.toUpperCase(); // Store solution in backend, so more secure.
        res.json({ message: "Successful word select." });
        //res.json({ word: result.rows[0].word.toUpperCase() });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({error: "DB connection failed."});
    }

});

type GuessStatus = "absent" | "present" | "correct";

// Check solution
app.post("/api/check", (req: Request, res: Response) => {
    const { guess }: {guess: string } = req.body;
    const result : GuessStatus[] = Array<GuessStatus>(5).fill("absent");
    const solArr = solutionWord.toUpperCase().split('');
    const guessArr = guess.toUpperCase().split('');

    // Find correct
    guessArr.forEach((char, i) => {
        if (char === solArr[i]) {
            result[i] = "correct";
            solArr[i] = "";
        }
    });

    // Find include
    guessArr.forEach((char, i) => {
        if (result[i] !== "correct" && solArr.includes(char)) {
            result[i] = "present";
            solArr[solArr.indexOf(char)] = "";
        }
    });

    const isWin = result.every(c => c === "correct");
    res.json({ result, isWin });


});
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log("Server listening on 5000");
}
);

server.on('error', (err: NodeJS.ErrnoException) => { 
    if (err.code === 'EADDRINUSE') {
        console.error("Port 5000 is in use.");
    } 
    else {
        console.error("Error:", err);
    }
});
