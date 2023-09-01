import { Suspense, useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar/Sidebar';

function App() {
  return (
    <>
      <Suspense fallback={null}>
        <Sidebar />
      </Suspense>
    </>
  );
}

export default App;
