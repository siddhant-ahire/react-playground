import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav style={{ marginBottom: 20 }}>
      <Link to="/" style={{ marginRight: 10 }}>
        Home
      </Link>
      <Link to="/about">About</Link>
    </nav>
  );
};

export default Navbar;
