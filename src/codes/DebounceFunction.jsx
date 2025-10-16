function debounce(func, delay = 300) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function DebouncedFunction() {
  const handleSearch = (e) => {
    console.log(e.target.value);
  };

  const debouncedSearch = debounce(handleSearch, 300);
  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <input
        style={{ padding: '8px', fontSize: '16px', width: '250px' }}
        placeholder="Type to search..."
        type="text"
        id="search-input"
        onChange={debouncedSearch}
      />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<DebouncedFunction />);
