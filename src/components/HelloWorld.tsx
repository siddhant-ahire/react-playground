import React from 'react';

interface HelloWorldProps {
  name?: string;
}

const HelloWorld: React.FC<HelloWorldProps> = ({ name = 'World' }) => {
  return <h2>Hello, {name}!</h2>;
};

export default HelloWorld;
