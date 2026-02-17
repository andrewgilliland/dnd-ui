import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";

function App() {
  const [count, setCount] = useState(0);

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-6 flex items-center justify-center gap-4">
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img
            src={viteLogo}
            className="h-24 p-2 transition duration-300 hover:drop-shadow-[0_0_2em_rgba(100,108,255,0.67)]"
            alt="Vite logo"
          />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img
            src={reactLogo}
            className="h-24 animate-spin p-2 [animation-duration:20s] transition duration-300 hover:drop-shadow-[0_0_2em_rgba(97,218,251,0.67)]"
            alt="React logo"
          />
        </a>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-slate-900">
        Vite + React
      </h1>
      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <button
          className="cursor-pointer rounded-md border border-slate-300 bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
        <p className="mt-4 text-slate-600">
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Click on the Vite and React logos to learn more
      </p>
    </main>
  );
}

export default App;
