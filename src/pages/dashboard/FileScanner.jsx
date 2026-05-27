import { useState, useRef } from 'react';
import { FolderOpen, Search, Shield, File, AlertTriangle, CheckCircle, Clock, Upload, X, Scan, HardDrive, Folder } from 'lucide-react';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import ProgressBar from '../../components/ui/ProgressBar';
import { useToast } from '../../components/ui/Toast';

export default function FileScanner() {
  const { addToast } = useToast();
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [path, setPath] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [files, setFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  const handleFilePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPath(file.name);
      addToast(`Selected: ${file.name}`);
    }
  };

  const handleFolderPick = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const folderPath = files[0].webkitRelativePath || files[0].name;
      const folderName = folderPath.split('/')[0];
      setPath(folderName + '/');
      setSelectedFile(null);
      addToast(`Selected folder: ${folderName}`);
    }
  };

  const handleScanFolder = async () => {
    const target = selectedFile ? selectedFile.name : path.trim();
    if (!target) { addToast('Select a file or enter a folder path', 'warning'); return; }

    setScanning(true);
    setProgress(0);
    setResults(null);

    const mockFiles = selectedFile
      ? [{ name: selectedFile.name, path: selectedFile.name, size: selectedFile.size, hash: 'a1b2c3d4e5f6...', status: selectedFile.name.endsWith('.exe') ? 'suspicious' : 'clean', reason: selectedFile.name.endsWith('.exe') ? 'Executable file — verify source' : null }]
      : [
          { name: 'document.pdf', path: path + 'document.pdf', size: 245000, hash: 'a1b2c3...', status: 'clean' },
          { name: 'setup.exe', path: path + 'setup.exe', size: 5800000, hash: 'd4e5f6...', status: 'clean' },
          { name: 'invoice.pdf.exe', path: path + 'invoice.pdf.exe', size: 120000, hash: 'x7y8z9...', status: 'suspicious', reason: 'Double extension detected' },
          { name: 'notes.txt', path: path + 'notes.txt', size: 1200, hash: 'p1q2r3...', status: 'clean' },
          { name: 'crack.exe', path: path + 'crack.exe', size: 3200000, hash: 'm4n5o6...', status: 'malicious', reason: 'Detected by VirusTotal (12/67)' },
          { name: 'image.jpg', path: path + 'image.jpg', size: 890000, hash: 's7t8u9...', status: 'clean' },
        ];

    const steps = mockFiles.length === 1 ? [0, 50, 100] : [0, 20, 40, 60, 80, 100];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setProgress(steps[i]);
      if (mockFiles.length > 1) setFiles(mockFiles.slice(0, Math.ceil((steps[i] / 100) * mockFiles.length)));
      else if (steps[i] === 50) setFiles(mockFiles);
    }
    setFiles(mockFiles);

    setResults({
      total: mockFiles.length,
      clean: mockFiles.filter(f => f.status === 'clean').length,
      suspicious: mockFiles.filter(f => f.status === 'suspicious').length,
      malicious: mockFiles.filter(f => f.status === 'malicious').length,
      scannedAt: new Date().toISOString(),
    });

    setScanning(false);
    addToast('Scan completed');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) {
      setSelectedFile(dropped[0]);
      setPath(dropped[0].name);
      addToast(`Dropped: ${dropped[0].name}`);
    }
  };

  const handleClear = () => {
    setResults(null);
    setFiles([]);
    setProgress(0);
    setSelectedFile(null);
    setPath('');
  };

  const statusIcon = (status) => {
    if (status === 'clean') return <CheckCircle size={14} className="text-green-500" />;
    if (status === 'suspicious') return <AlertTriangle size={14} className="text-yellow-500" />;
    if (status === 'malicious') return <X size={14} className="text-red-500" />;
    return <Clock size={14} className="text-gray-400" />;
  };

  const statusColor = (s) => s === 'clean' ? 'green' : s === 'suspicious' ? 'yellow' : s === 'malicious' ? 'red' : 'gray';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">File Scanner</h1>
        <Button onClick={handleClear} variant="ghost" size="sm" disabled={!results && files.length === 0}>Clear</Button>
      </div>

      <Card>
        <CardBody>
          <div className="flex flex-wrap gap-2 mb-3">
            <input ref={fileInputRef} type="file" onChange={handleFilePick} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <File size={14} className="mr-1" /> Choose File
            </Button>

            <input ref={folderInputRef} type="file" webkitdirectory="" directory="" multiple onChange={handleFolderPick} className="hidden" />
            <Button variant="outline" size="sm" onClick={() => folderInputRef.current?.click()}>
              <Folder size={14} className="mr-1" /> Choose Folder
            </Button>

            <div className="flex-1 flex gap-2 min-w-[200px]">
              <Input
                value={path}
                onChange={e => { setPath(e.target.value); setSelectedFile(null); }}
                placeholder={selectedFile ? selectedFile.name : 'Folder path...'}
                className="flex-1 font-mono text-sm"
                disabled={!!selectedFile}
              />
              <Button onClick={handleScanFolder} disabled={scanning}>
                <Search size={16} className="mr-1" /> {scanning ? 'Scanning...' : 'Scan'}
              </Button>
            </div>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${dragOver ? 'border-orange-500 bg-orange-50 dark:bg-orange-950' : 'border-gray-300 dark:border-gray-600 hover:border-orange-400'}`}
          >
            <Upload size={24} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Drag & drop a file here</p>
            <p className="text-xs text-gray-400 mt-1">or use the buttons above</p>
          </div>
        </CardBody>
      </Card>

      {scanning && (
        <Card>
          <CardBody className="text-center py-6">
            <Scan size={32} className="text-orange-500 mx-auto mb-3 animate-pulse" />
            <p className="font-medium mb-2">Scanning files...</p>
            <ProgressBar value={progress} max={100} size="sm" showLabel />
            <p className="text-xs text-gray-500 mt-2">{files.length} files found</p>
          </CardBody>
        </Card>
      )}

      {files.length > 0 && !scanning && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><FolderOpen size={16} /> Scanned Files ({files.length})</h3>
              {results && (
                <div className="flex gap-2">
                  <Badge color="green">{results.clean} Clean</Badge>
                  <Badge color="yellow">{results.suspicious} Suspicious</Badge>
                  <Badge color="red">{results.malicious} Malicious</Badge>
                </div>
              )}
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    {statusIcon(f.status)}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2"><File size={14} className="text-gray-400 shrink-0" /><p className="text-sm font-medium truncate">{f.name}</p></div>
                      <p className="text-xs text-gray-500 truncate">{f.path}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5"><span>{(f.size / 1024).toFixed(1)} KB</span><span className="font-mono">{f.hash}</span></div>
                    </div>
                  </div>
                  <Badge color={statusColor(f.status)}>{f.status === 'suspicious' ? f.reason : f.status}</Badge>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {results && (
        <Card>
          <CardHeader><h3 className="font-semibold flex items-center gap-2"><Shield size={16} /> Scan Summary</h3></CardHeader>
          <CardBody>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div><p className="text-2xl font-bold">{results.total}</p><p className="text-xs text-gray-500">Total</p></div>
              <div><p className="text-2xl font-bold text-green-500">{results.clean}</p><p className="text-xs text-gray-500">Clean</p></div>
              <div><p className="text-2xl font-bold text-yellow-500">{results.suspicious}</p><p className="text-xs text-gray-500">Suspicious</p></div>
              <div><p className="text-2xl font-bold text-red-500">{results.malicious}</p><p className="text-xs text-gray-500">Malicious</p></div>
            </div>
          </CardBody>
        </Card>
      )}

      {!scanning && files.length === 0 && !results && (
        <Card>
          <CardBody className="text-center py-12">
            <HardDrive size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg font-medium mb-2">No Files Scanned</p>
            <p className="text-sm text-gray-500">Choose a file, select a folder, or drag & drop to scan</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}