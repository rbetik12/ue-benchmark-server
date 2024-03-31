import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RunInfoTable from './RunInfoTable/RunInfoTable';
import TopBar from './TopBar';
import NotFoundPage from './NotFoundPage';
import RunData from './RunData/RunData';

const App: React.FC = () => {
  return (
    <div>
      <TopBar name="Right Benchmark" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RunInfoTable/>} />
          <Route path="/run/:runId" element={<RunData/>} />
          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
