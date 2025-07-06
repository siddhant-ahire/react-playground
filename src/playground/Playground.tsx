import React, { useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

const defaultFiles: { [key: string]: string } = {
  'App.tsx': `import React from 'react';\n\nexport default function App() {\n  return <h1>Hello React Playground!</h1>;\n}`,
  'HelloWorld.tsx': `import React from 'react';\n\nexport default function HelloWorld() {\n  return <div>Hello, World!</div>;\n}`,
};

const Playground: React.FC = () => {
  const [files, setFiles] = useState<{ [key: string]: string }>(defaultFiles);
  const [activeFile, setActiveFile] = useState('App.tsx');
  const [code, setCode] = useState(files[activeFile]);

  const handleFileChange = (filename: string) => {
    setActiveFile(filename);
    setCode(files[filename]);
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      setFiles({ ...files, [activeFile]: value });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <header className="h-14 bg-zinc-900 text-white flex items-center px-6 text-xl font-semibold tracking-wide shadow">
        <span className="text-cyan-400 mr-3">⚡</span> React Playground
      </header>
      <div className="flex flex-1 min-h-0">
        <aside className="w-56 bg-white border-r border-zinc-200 flex flex-col">
          <div className="px-4 py-3 border-b border-zinc-200 font-medium text-base">Files</div>
          <div className="flex-1 overflow-y-auto">
            {Object.keys(files).map((filename) => (
              <div
                key={filename}
                className={`cursor-pointer px-4 py-2 transition-colors border-l-4 ${filename === activeFile ? 'bg-cyan-50 text-cyan-700 border-cyan-600 font-bold' : 'hover:bg-zinc-100 border-transparent'}`}
                onClick={() => handleFileChange(filename)}
              >
                {filename}
              </div>
            ))}
          </div>
        </aside>
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0 border-b border-zinc-200">
            <MonacoEditor
              height="40vh"
              defaultLanguage="typescript"
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                fontSize: 15,
                minimap: { enabled: false },
                fontFamily: 'Fira Mono, monospace',
              }}
            />
          </div>
          <div className="flex-1 bg-white overflow-auto">
            <div className="px-4 py-2 border-b border-zinc-200 bg-gray-50 font-medium text-sm">
              Live Preview
            </div>
            <iframe
              title="preview"
              className="w-full h-full bg-white border-0"
              srcDoc={`<div id='root'></div><script type='module'>${code}</script>`}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Playground;
