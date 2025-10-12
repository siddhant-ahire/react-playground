function App() {
  const [arr, setArr] = React.useState(Array.from({ length: 30 }, (_, n) => n + 1));
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handleScroll = (e) => {
      const { scrollHeight, scrollTop, clientHeight } = e.target;
      console.log(scrollHeight, scrollTop, clientHeight);
      if (scrollTop + clientHeight >= scrollHeight) {
        setArr((prev) => [...prev, ...Array.from({ length: 10 }, (_, n) => prev.length + n + 1)]);
      }
    };

    const currentRef = ref.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        overflowY: 'auto',
        height: 300,
        width: 300,
        border: '1px solid black',
        margin: 'auto',
        marginTop: 50,
      }}
    >
      <ul style={{ padding: 0, margin: 0, listStyle: 'none', textAlign: 'center', fontSize: 20 }}>
        {arr.map((v) => (
          <li key={v}>{v}</li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
