import { useState, useRef } from 'react';
import { useTimer } from '../../context/TimerContext';
import { exportAllData, downloadJsonFile, readJsonFile, importAllData } from '../../services/storage';

export default function Header() {
  const { startTimer } = useTimer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showBackupMenu, setShowBackupMenu] = useState(false);

  const handleExport = () => {
    const data = exportAllData();
    const filename = `forge-gymAK-backup-${new Date().toISOString().split('T')[0]}.json`;
    downloadJsonFile(data, filename);
    setShowBackupMenu(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
    setShowBackupMenu(false);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      const result = importAllData(data as Record<string, unknown>);
      alert(result.message);
      if (result.success) window.location.reload();
    } catch (error) {
      alert('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-white/60"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.85), rgba(255,255,255,0.7))' }}
    >
      <div className="max-w-lg mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800">FORGE</h1>
            <span className="text-sm text-gray-400 hidden xs:inline">Abel & Keneni</span>
          </div>
          <div className="flex items-center gap-2 relative">
            <button
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="w-9 h-9 rounded-lg hover:bg-white/60 flex items-center justify-center text-lg transition-all duration-200 active:scale-90"
              title="Backup / Restore data"
              style={{ backgroundColor: showBackupMenu ? 'rgba(255,255,255,0.6)' : undefined }}
            >
              💾
            </button>
            {showBackupMenu && (
              <>
                <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[160px] z-50">
                  <button
                    onClick={handleExport}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    📤 Export data
                  </button>
                  <button
                    onClick={handleImportClick}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 flex items-center gap-2"
                  >
                    📥 Import data
                  </button>
                </div>
                <div className="fixed inset-0 z-40" onClick={() => setShowBackupMenu(false)} />
              </>
            )}
            <button
              onClick={() => startTimer(2)}
              className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-lg transition-all duration-200 active:scale-90"
              title="Rest timer"
            >
              ⏱
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
