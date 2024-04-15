import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RunInfoTable from './RunInfoTable/RunInfoTable';
import TopBar from './TopBar';
import NotFoundPage from './NotFoundPage';
import RunDataTable from './RunData/RunDataTable';

const App: React.FC = () => {
  return (
    <div>
      <BrowserRouter>
      <TopBar name="Right Benchmark" />
        <Routes>
          <Route path="/" element={<RunInfoTable/>} />
          <Route path="/run/:id" element={<RunDataTable/>} />
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
