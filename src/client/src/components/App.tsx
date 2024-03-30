import React from 'react';
import RunInfoTable from './RunInfoTable/RunInfoTable';
import TopBar from './TopBar';

const App: React.FC = () => {
  return (
    <div>
      <TopBar name="Right Benchmark" />
      <RunInfoTable></RunInfoTable>
    </div>
  );
};

export default App;
