import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Babel from '@babel/standalone';

const FILES: Record<string, string> = {
  'App.tsx': `
function App() {
  return <h1>Hello React Playground! ⚡</h1>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`.trim(),
  'Counter.tsx': `
function Counter() {
  const [count, setCount] = React.useState(0);
  return (
    <div style={{textAlign: 'center'}}>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <button onClick={() => setCount(count - 1)} style={{marginLeft: 8}}>Decrement</button>
    </div>
  );
}

var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Counter />);
`.trim(),
  'Clock.tsx': `
function Clock() {
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{textAlign: 'center'}}>
      <h2>Current Time</h2>
      <p style={{fontSize: 24}}>{time.toLocaleTimeString()}</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Clock />);
`.trim(),
};

const FILE_NAMES = Object.keys(FILES);

const MODULE_HEADER = 'export {}\n';

const Playground = () => {
  const [activeFile, setActiveFile] = useState<string>(FILE_NAMES[0]);
  const [codeMap, setCodeMap] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(FILES).map(([k, v]) => [k, MODULE_HEADER + v])),
  );
  const [modalOpen, setModalOpen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const runCode = (fileName?: string) => {
    const fileToRun = fileName || activeFile;
    try {
      let code = codeMap[fileToRun];
      if (code.startsWith(MODULE_HEADER)) {
        code = code.slice(MODULE_HEADER.length);
      }
      const wrappedCode = `(function() {\n${code}\n})();`;
      const output = Babel.transform(wrappedCode, {
        presets: ['react', 'typescript'],
        filename: fileToRun,
      }).code;

      const fullHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Preview</title>
        <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
      </head>
      <body>
        <div id="root"></div>
        <script>${output}</script>
      </body>
      </html>
    `;

      if (iframeRef.current) {
        iframeRef.current.srcdoc = fullHtml;
      }
    } catch (err: unknown) {
      if (iframeRef.current) {
        const message = err instanceof Error ? err.message : String(err);
        iframeRef.current.srcdoc = `<pre style="color:red;padding:1rem;">${message}</pre>`;
      }
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '10px',
          background: '#111',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <strong>⚛️ React Playground</strong>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              background: '#222',
              color: '#fff',
              border: 'none',
              padding: '6px 16px',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginLeft: 12,
              borderBottom: '2px solid #0ea5e9',
            }}
          >
            Open Components List
          </button>
        </div>
        <button
          onClick={() => runCode()}
          style={{
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            padding: '6px 12px',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Run ▶️
        </button>
      </div>

      {/* Modal for file/component selection */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setModalOpen(false)}
        >
          <div
            style={{
              background: '#222',
              color: '#fff',
              borderRadius: 8,
              padding: 24,
              minWidth: 320,
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 4px 32px #0008',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 20 }}>Components</h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none',
                  color: '#fff',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FILE_NAMES.map((file) => (
                <button
                  key={file}
                  onClick={() => {
                    setActiveFile(file);
                    setModalOpen(false);
                    setTimeout(() => runCode(file), 0);
                  }}
                  style={{
                    background: activeFile === file ? '#0ea5e9' : '#333',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: 4,
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {file}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <Editor
            defaultLanguage="typescript"
            defaultValue={MODULE_HEADER + FILES[activeFile]}
            theme="vs-dark"
            value={codeMap[activeFile]}
            onChange={(val) => setCodeMap((prev) => ({ ...prev, [activeFile]: val || '' }))}
            path={activeFile}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
            }}
            beforeMount={(monaco) => {
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                jsx: monaco.languages.typescript.JsxEmit.React,
                target: monaco.languages.typescript.ScriptTarget.ESNext,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.ESNext,
                esModuleInterop: true,
                allowJs: true,
                typeRoots: ['node_modules/@types'],
              });

              monaco.languages.typescript.typescriptDefaults.addExtraLib(
                `
        declare module "react" {
          export = React;
        }
        declare var React: any;
        declare var ReactDOM: any;
      `,
                'file:///node_modules/@types/react/index.d.ts',
              );
            }}
          />
        </div>
        <div style={{ flex: 1, borderLeft: '1px solid #ccc' }}>
          <iframe
            ref={iframeRef}
            title="preview"
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Playground;
