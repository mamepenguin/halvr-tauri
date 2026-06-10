import { useState, useCallback } from "react";
import { TitleBar } from "./components/TitleBar";
import { DropZone } from "./components/DropZone";
import { QueueList } from "./components/QueueList";
import { SettingsDialog } from "./components/SettingsDialog";
import { useConversion } from "./hooks/use-conversion";
import { useSettings } from "./hooks/use-settings";
import { useConversionStore } from "./stores/conversion-store";
import { revealInFolder } from "./lib/commands";

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const { queueItems, isProcessing } = useConversionStore();
  const { addFiles, cancel, clearCompleted, removeItem } = useConversion();
  const { settings, availableEncoders, updateSettings } = useSettings();

  const hasQueueItems = queueItems.length > 0;

  const handleFilesAdded = useCallback(
    (paths: ReadonlyArray<string>) => {
      addFiles(paths);
    },
    [addFiles],
  );

  const handleReveal = useCallback((path: string) => {
    revealInFolder(path);
  }, []);

  const handleSettingsChange = useCallback(
    (newSettings: typeof settings) => {
      updateSettings(newSettings);
    },
    [updateSettings],
  );

  return (
    <div className="relative flex h-[420px] w-[280px] flex-col overflow-hidden bg-black/85 text-white select-none">
      <TitleBar onSettingsClick={() => setShowSettings(true)} />

      {hasQueueItems ? (
        <>
          <DropZone compact onFilesAdded={handleFilesAdded} />

          <div className="mx-3 border-t border-neutral-700/50" />

          <div className="mt-2 min-h-0 flex-1">
            <QueueList
              items={queueItems}
              isProcessing={isProcessing}
              onRemove={removeItem}
              onCancel={cancel}
              onClear={clearCompleted}
              onReveal={handleReveal}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <DropZone compact={false} onFilesAdded={handleFilesAdded} />
        </div>
      )}

      <SettingsDialog
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        availableEncoders={availableEncoders}
        onSettingsChange={handleSettingsChange}
      />
    </div>
  );
}

export default App;
