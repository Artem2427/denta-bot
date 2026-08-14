import { Button } from '@repo/ui';
import { useState } from 'react';

import './App.css';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import viteLogo from './assets/vite.svg';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <section className="p-4">
        <Button onClick={() => setCount(count + 1)} variant="destructive">
          Test {count}
        </Button>
      </section>
    </>
  );
}

export default App;
