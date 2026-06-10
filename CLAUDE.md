# Halvr (Tauri)

Cross-platform HEVC video converter. Tauri 2.x (Rust) + React 19 + TypeScript.

## Build

```sh
npm install                    # Install JS dependencies
npm run tauri dev              # Development mode
npm run tauri build            # Release build → .app/.dmg (macOS), .exe (Windows)
```

Rust backend is in `src-tauri/`. Frontend dev server: `npm run dev` (Vite, port 1420).

Re-check Rust: `cd src-tauri && cargo check`

## Dependencies

- **Rust**: tauri 2, tokio, serde, thiserror, regex, uuid, filetime, which
- **JS**: react 19, zustand 5, i18next, @tauri-apps/api 2, tailwindcss 4, vite 6

## Supported Formats

- Input: MP4, MOV, M4V, M2TS, TS, MKV, AVI, WMV, WebM
- Output: HEVC/H.265 in MP4 container (`{name}_HEVC.mp4`)
- Audio: copied as-is (no re-encoding)

## Architecture

### Communication

- **Frontend → Backend**: `invoke()` (Tauri commands)
- **Backend → Frontend**: `app.emit()` (Tauri events: `conversion-progress`, `conversion-complete`, `conversion-error`)
- **State**: Zustand (frontend) + `Arc<Mutex<AppState>>` (backend)

### Queue Management

Backend processes queue sequentially. Each `QueueItem` has status:
- `pending` → `converting(progress)` → `completed(outputPath)` / `skipped(error)`

Files can be added during conversion. New items are enqueued and processed after current conversion.

### Conversion Engine

Uses system-installed ffmpeg via `tokio::process::Command`. Progress parsed from stderr regex `time=HH:MM:SS.CC`.

- Encoder selection: `hevc_videotoolbox` (macOS HW), `hevc_nvenc` (NVIDIA), `hevc_qsv` (Intel), `libx265` (SW fallback)
- Quality by preset: videotoolbox uses `-q:v`, libx265 uses `-crf`, nvenc uses `-cq`, qsv uses `-global_quality`
- Cancel: `child.start_kill()`, partial output files deleted
- Metadata: ffprobe JSON output (`-print_format json -show_format -show_streams`)

### Encoder Detection

`ffmpeg -encoders` parsed at startup. Only detected encoders shown in settings UI.

### Output Filename

`{original_name}_HEVC.mp4`. Appends `_1`, `_2` suffix when file exists (max 1000).

### FFmpeg/FFprobe Discovery

1. macOS: `/opt/homebrew/bin/`, `/usr/local/bin/`
2. System PATH via `which` crate

## File Structure

```
Halvr_Tauri/
├── src-tauri/
│   ├── Cargo.toml
│   ├── tauri.conf.json              # Window: 280x420, no decorations, not resizable
│   ├── capabilities/default.json
│   └── src/
│       ├── lib.rs                   # Tauri builder, command registration
│       ├── main.rs                  # Binary entry
│       ├── state.rs                 # AppState (Arc<Mutex<AppStateInner>>)
│       ├── events.rs                # Event payloads (Progress, Completion, Error)
│       ├── models/
│       │   ├── errors.rs            # ConversionError (thiserror)
│       │   ├── metadata.rs          # VideoMetadata
│       │   ├── settings.rs          # ConversionSettings, EncoderType, ExportPreset
│       │   └── queue_item.rs        # QueueItem, QueueItemStatus, ErrorInfo
│       ├── services/
│       │   ├── ffmpeg.rs            # FfmpegConverter: spawn, progress parse, cancel
│       │   ├── ffprobe.rs           # Metadata extraction via ffprobe JSON
│       │   ├── encoder_detect.rs    # HW encoder detection
│       │   ├── output_path.rs       # Output path generation + dedup
│       │   └── supported_formats.rs # Extension validation
│       └── commands/
│           ├── conversion.rs        # start/cancel/add/remove/clear/get queue
│           ├── encoder.rs           # detect_available_encoders
│           ├── files.rs             # validate_files, reveal_in_folder
│           ├── metadata.rs          # get_metadata
│           └── settings.rs          # load/save settings
├── src/
│   ├── App.tsx                      # Root: two layouts (empty/queue), dark theme
│   ├── main.tsx                     # React entry + i18n init
│   ├── components/
│   │   ├── TitleBar.tsx             # Title + settings button + window drag
│   │   ├── DropZone.tsx             # Compact (220x60) / normal (180x160) modes
│   │   ├── QueueList.tsx            # Scrollable queue + action bar
│   │   ├── QueueItemRow.tsx         # Status icon + filename + action
│   │   └── SettingsDialog.tsx       # Encoder, preset, timestamp toggle
│   ├── hooks/
│   │   ├── use-conversion.ts        # Event listeners → store, addFiles/cancel
│   │   ├── use-drag-drop.ts         # Tauri D&D + HTML D&D events
│   │   └── use-settings.ts          # Load settings + detect encoders
│   ├── stores/
│   │   └── conversion-store.ts      # Zustand (immutable updates)
│   ├── lib/
│   │   ├── commands.ts              # Typed invoke() wrappers
│   │   ├── events.ts                # Typed listen() wrappers
│   │   └── format-utils.ts          # Duration, file size, bitrate formatting
│   ├── types/index.ts               # All TypeScript interfaces
│   ├── i18n/{index.ts, en.json, ja.json}
│   └── styles/globals.css           # Tailwind v4 + dark base styles
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Notes

- Window: 280x420px, custom title bar (decorations: false), dark theme
- `FfmpegConverter` uses `Arc<Mutex<>>` for cancel state sharing across tasks
- `QueueItemStatus` uses `#[serde(tag = "type")]` for TypeScript discriminated union
- All structs use `#[serde(rename_all = "camelCase")]` for frontend interop
- UI localized for English and Japanese (auto-detected via `navigator.language`)
- Settings persisted via `tauri-plugin-store`
- Bundle targets: DMG (macOS) + NSIS (Windows)
