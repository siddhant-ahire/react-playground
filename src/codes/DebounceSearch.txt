function DebouncedSearch() {
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');

  // Debounce effect
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h2>Debounced Search</h2>
      <input
        style={{ padding: '8px', fontSize: '16px', width: '250px' }}
        type="text"
        placeholder="Type to search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p style={{ marginTop: '20px', fontSize: '18px' }}>
        <strong>Searching for:</strong> {debouncedQuery || 'Nothing yet...'}
      </p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<DebouncedSearch />);
