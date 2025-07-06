import React from 'react';
import HelloWorld from '../components/HelloWorld';

const Home: React.FC = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <HelloWorld name="React Playground" />
    </div>
  );
};

export default Home;
