import { useState, useEffect, useCallback } from 'react';

export type Grid = boolean[][];
export type SizeOption = 4 | 5 | 6;

const STORAGE_KEY_PREFIX = 'lightsout_best_web_';

export function useGameState(initialSize: SizeOption = 5) {
    const [size, setSize] = useState<SizeOption>(initialSize);
    const [grid, setGrid] = useState<Grid>([]);
    const [moves, setMoves] = useState(0);
    const [isWon, setIsWon] = useState(false);
    const [bestScore, setBestScore] = useState<number | null>(null);

    // Initialize grid
    const createEmptyGrid = (s: number): Grid =>
        Array(s).fill(null).map(() => Array(s).fill(false));

    const toggleAt = (currentGrid: Grid, r: number, c: number): Grid => {
        const s = currentGrid.length;
        // Deep copy
        const next = currentGrid.map(row => [...row]);

        const dirs = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];

        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < s && nc >= 0 && nc < s) {
                next[nr][nc] = !next[nr][nc];
            }
        }
        return next;
    };

    const isSolved = (g: Grid) => g.every(row => row.every(cell => !cell));

    const loadBestScore = useCallback((s: SizeOption) => {
        if (typeof window === 'undefined') return;
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${s}`);
        setBestScore(stored ? parseInt(stored, 10) : null);
    }, []);

    const saveBestScore = (s: SizeOption, score: number) => {
        const current = localStorage.getItem(`${STORAGE_KEY_PREFIX}${s}`);
        const currentBest = current ? parseInt(current, 10) : null;

        if (currentBest === null || score < currentBest) {
            localStorage.setItem(`${STORAGE_KEY_PREFIX}${s}`, score.toString());
            setBestScore(score);
        }
    };

    const newGame = useCallback((s: SizeOption = size) => {
        let nextGrid = createEmptyGrid(s);
        // Randomize: simulate clicks to ensure solubility
        const toggles = Math.max(6, s * s);
        for (let i = 0; i < toggles; i++) {
            const r = Math.floor(Math.random() * s);
            const c = Math.floor(Math.random() * s);
            nextGrid = toggleAt(nextGrid, r, c); // Re-use logic but this function isn't hoisted yet if inside. 
            // Actually we need to separate the pure toggle logic to avoid dependency issues or duplicate it.
            // Let's refactor `toggleAt` to be pure outside or use a helper.
        }

        setSize(s);
        setGrid(nextGrid); // Wait, toggleAt logic needs to be robust. 
        setMoves(0);
        setIsWon(false);
        loadBestScore(s);
    }, [size, loadBestScore]);

    // Refined toggle that is pure
    const performToggle = (g: Grid, r: number, c: number) => {
        const s = g.length;
        const next = g.map(row => [...row]);
        const dirs = [[0, 0], [-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < s && nc >= 0 && nc < s) {
                next[nr][nc] = !next[nr][nc];
            }
        }
        return next;
    };

    // Override newGame to use pure toggle
    const startNewGame = useCallback((s: SizeOption) => {
        let g = createEmptyGrid(s);
        const toggles = Math.max(10, s * s);
        for (let i = 0; i < toggles; i++) {
            const r = Math.floor(Math.random() * s);
            const c = Math.floor(Math.random() * s);
            g = performToggle(g, r, c);
        }
        setSize(s);
        setGrid(g);
        setMoves(0);
        setIsWon(false);
        loadBestScore(s);
    }, [loadBestScore]);

    useEffect(() => {
        startNewGame(size);
    }, []);

    const handleToggle = (r: number, c: number) => {
        if (isWon) return;

        const nextGrid = performToggle(grid, r, c);
        const nextMoves = moves + 1;
        const solved = isSolved(nextGrid);

        setGrid(nextGrid);
        setMoves(nextMoves);

        if (solved) {
            setIsWon(true);
            saveBestScore(size, nextMoves);
        }
    };

    return {
        size,
        grid,
        moves,
        isWon,
        bestScore,
        newGame: () => startNewGame(size),
        changeSize: (s: SizeOption) => startNewGame(s),
        toggleLight: handleToggle
    };
}
