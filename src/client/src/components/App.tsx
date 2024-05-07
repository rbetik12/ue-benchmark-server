import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import RunInfoTable from './RunInfoTable/RunInfoTable';
import TopBar from './TopBar';
import NotFoundPage from './NotFoundPage';
import RunDataTable from './RunData/RunDataTable';
import RunDataGraphPage from './RunDataGraph/RunDataGraphPage';
import RunDataComparePage from './RunDataCompare/RunDataComparePage';

const App: React.FC = () => {
  return (
    <div>
      <BrowserRouter>
      <TopBar name="Mem Benchmark" />
        <Routes>
          <Route path="/" element={<RunInfoTable/>} />
          <Route path="/run/:id" element={<RunDataTable/>} />
          <Route path="/run/:id/graph" element={<RunDataGraphPage/>} />
          <Route path="/compare/:ids" element={<RunDataComparePage/>} />
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
