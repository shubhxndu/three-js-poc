import { Suspense, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import { Canvas } from '@react-three/fiber';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Canvas className='h-100'>
        <Suspense fallback={null}>
          <mesh className='h-full w-full'>
            <Sidebar />
          </mesh>
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
