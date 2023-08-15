import { Suspense, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';
import { Canvas } from '@react-three/fiber';

function App() {
  return (
    <>
      <Canvas className='h-100'>
        <Suspense fallback={null}>
          <Sidebar />
        </Suspense>
      </Canvas>
    </>
  );
}

export default App;
