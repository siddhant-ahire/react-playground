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
      {/* Responsive styles */}
      <style>{`
        body { background: #0a0a0a; }
        .rp-navbar {
          box-shadow: 0 2px 8px #0002;
          border-bottom: 1px solid #222;
        }
        .rp-navbar-btn {
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .rp-navbar-btn:hover, .rp-navbar-btn:focus {
          background: #164e63 !important;
          color: #fff !important;
          box-shadow: 0 2px 8px #0ea5e988;
        }
        .rp-modal-content {
          box-shadow: 0 8px 40px #000a, 0 1.5px 8px #0ea5e955;
          border-radius: 16px !important;
          animation: rp-modal-in 0.18s cubic-bezier(.4,1.4,.6,1) both;
        }
        @keyframes rp-modal-in {
          from { opacity: 0; transform: translateY(40px) scale(0.98); }
          to { opacity: 1; transform: none; }
        }
        .rp-modal-list-btn {
          font-size: 1.1rem;
          padding: 14px 10px !important;
          border-radius: 8px !important;
          margin-bottom: 2px;
          transition: background 0.15s, color 0.15s, box-shadow 0.15s;
        }
        .rp-modal-list-btn:hover, .rp-modal-list-btn:focus {
          background: #0ea5e9 !important;
          color: #fff !important;
          box-shadow: 0 2px 8px #0ea5e988;
        }
        .rp-main {
          background: linear-gradient(120deg, #18181b 0%, #23272f 100%);
          border-radius: 0 0 16px 16px;
          box-shadow: 0 2px 16px #0002;
        }
        .rp-editor, .rp-preview {
          background: #18181b;
          border-radius: 0 0 0 16px;
        }
        .rp-preview {
          border-radius: 0 0 16px 0;
        }
        @media (max-width: 700px) {
          .rp-navbar {
            flex-direction: column;
            align-items: stretch !important;
            gap: 8px !important;
            border-radius: 0 0 16px 16px;
          }
          .rp-navbar-btn {
            width: 100%;
            margin-left: 0 !important;
            border-radius: 4px !important;
            font-size: 1.1rem;
            padding: 12px 0 !important;
          }
          .rp-modal-content {
            min-width: 0 !important;
            width: 97vw !important;
            max-width: 500px !important;
            padding: 12px !important;
            border-radius: 12px !important;
          }
          .rp-modal-list-btn {
            font-size: 1.1rem;
            padding: 16px 10px !important;
            border-radius: 8px !important;
          }
          .rp-main {
            flex-direction: column !important;
            border-radius: 0 0 16px 16px;
          }
          .rp-editor, .rp-preview {
            min-width: 0 !important;
            width: 100% !important;
            border-left: none !important;
            border-top: 1px solid #333 !important;
            height: 50vh !important;
            max-height: 50vh !important;
            border-radius: 0 0 16px 16px !important;
          }
        }
      `}</style>
      <div
        className="rp-navbar"
        style={{
          padding: '10px',
          background: '#111',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          <strong
            style={{
              fontSize: '1.3rem',
              wordBreak: 'break-word',
              letterSpacing: '0.01em',
              color: '#0ea5e9',
              textShadow: '0 2px 8px #0ea5e955',
            }}
          >
            ⚛️ React Playground
          </strong>
          <button
            className="rp-navbar-btn"
            onClick={() => setModalOpen(true)}
            style={{
              background: '#222',
              color: '#fff',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginLeft: 12,
              borderBottom: '2px solid #0ea5e9',
              flex: 1,
              minWidth: 0,
              boxShadow: '0 1px 4px #0002',
            }}
          >
            <span style={{ fontWeight: 600, fontSize: '1.08em', letterSpacing: '0.01em' }}>
              📂 Components
            </span>
          </button>
        </div>
        <button
          className="rp-navbar-btn"
          onClick={() => runCode()}
          style={{
            background: '#0ea5e9',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            minWidth: 0,
            boxShadow: '0 1px 4px #0ea5e955',
            fontSize: '1.08em',
            letterSpacing: '0.01em',
          }}
        >
          ▶️ Run
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
            className="rp-modal-content"
            style={{
              background: '#23272f',
              color: '#fff',
              borderRadius: 16,
              padding: 28,
              minWidth: 320,
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 8px 40px #000a, 0 1.5px 8px #0ea5e955',
              border: '1.5px solid #0ea5e9',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
                borderBottom: '1px solid #333',
                paddingBottom: 8,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 22, color: '#0ea5e9', letterSpacing: '0.01em' }}>
                Components
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  background: 'none',
                  color: '#fff',
                  border: 'none',
                  fontSize: 28,
                  cursor: 'pointer',
                  padding: 0,
                  marginLeft: 8,
                  lineHeight: 1,
                }}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FILE_NAMES.map((file) => (
                <button
                  className="rp-modal-list-btn"
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
                    padding: '12px 16px',
                    borderRadius: 8,
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '1.08em',
                    letterSpacing: '0.01em',
                    boxShadow: activeFile === file ? '0 2px 8px #0ea5e988' : 'none',
                  }}
                >
                  {file}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="rp-main" style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <div className="rp-editor" style={{ flex: 1, minWidth: 0 }}>
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
        <div className="rp-preview" style={{ flex: 1, borderLeft: '1px solid #ccc', minWidth: 0 }}>
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
