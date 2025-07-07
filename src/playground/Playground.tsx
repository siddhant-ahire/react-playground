import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Babel from '@babel/standalone';

const DEFAULT_CODE = `
function App() {
  return <h1>Hello React Playground! ⚡</h1>;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`.trim();

const Playground = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const runCode = () => {
    try {
      const output = Babel.transform(code, {
        presets: ['react', 'typescript'],
        filename: 'file.tsx', // ✅ Fixes the error
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = `<pre style="color:red;padding:1rem;">${err?.message}</pre>`;
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
          justifyContent: 'space-between',
        }}
      >
        <strong>⚛️ React Playground</strong>
        <button
          onClick={runCode}
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

      <div style={{ flex: 1, display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <Editor
            defaultLanguage="typescript"
            defaultValue={DEFAULT_CODE}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            path="file.tsx" // 👈 This tells Monaco it's a .tsx file
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
