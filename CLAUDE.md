# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri-based desktop application called "Cyberboard Config Merger" for merging and customizing CYBERBOARD R4 LED configurations. The application allows users to select base configurations and merge them with custom LED mappings for slots 1, 2, and 3 (corresponding to pages 5, 6, 7 in the configuration).

## Development Commands

```bash
# Development server
pnpm dev

# Build for production
pnpm build

# Run Tauri development mode
pnpm tauri dev

# Build Tauri app
pnpm tauri build

# Linting and formatting
pnpm lint                # Run Biome linter
pnpm lint:fix           # Auto-fix with Biome
pnpm lint:oxlint        # Additional Oxlint checks
pnpm format             # Format code with Biome
pnpm check              # Run all checks (lint + oxlint + type check)
```

## Architecture

### Frontend (React + TypeScript)
- **React 19** with TypeScript for UI components
- **Vite** for development and build tooling
- **Biome** for linting and formatting (with strict rules including noExplicitAny)
- **Oxlint** for additional linting

### Backend (Rust + Tauri)
- **Tauri v2** for desktop application framework
- **Clean Architecture** pattern with domain/usecase/infrastructure layers
- File system operations for loading and saving LED configurations

### Key Architecture Components

#### Frontend Structure
- `src/App.tsx` - Main application with step-based workflow
- `src/components/` - React components for each step
- `src/types.ts` - TypeScript interfaces for LED configurations
- `src/utils/platform.ts` - Platform detection (Tauri vs Web)

#### Backend Structure (src-tauri/src/)
- `domain/` - Core business entities and interfaces
- `usecase/` - Application business logic
- `infrastructure/` - File system implementation
- `presentation/` - Tauri command handlers

## Key Data Structures

### LEDConfiguration
Core configuration structure with `page_data` array containing LED pages. Each page has:
- `page_index` (5, 6, 7 for custom LEDs)
- `frames` with RGB data for LED animations
- Speed, lightness, and other display properties

### SlotFile
Represents a configuration file assigned to an LED slot:
```typescript
interface SlotFile {
    fileInfo: FileInfo;
    config: LEDConfiguration;
    sourceLED: number; // Which LED from source file (5, 6, or 7)
}
```

## UI Component Standards

### Button Implementation
**CRITICAL**: All interactive buttons MUST use `<input type="button">` tags, NOT `<button>` tags. This was a specific requirement implemented throughout the application.

```tsx
// Correct
<input 
    type="button" 
    onClick={handleClick} 
    className="continue-button" 
    value="Continue" 
/>

// Incorrect - DO NOT USE
<button onClick={handleClick}>Continue</button>
```

### LEDPreview Component Usage
- Regular size: No `className` prop
- Compact size: `className="compact"` (60px max-height)
- In SlotMapper: Use regular size to match screen 1 layout
- Preview titles: Use simple "Preview" text for multi-file scenarios

## Application Workflow

### Step-by-Step Process
1. **Select Base** - Choose base LED configuration file
2. **Configure Mappings** - Assign additional files to LED slots with multi-file support
3. **Review** - Simple preview of final configuration (no complex summaries)
4. **Complete** - Save merged configuration

### SlotMapper Component Specifications
- **Multi-file support**: Each LED slot (1, 2, 3) can have multiple configuration files
- **Default initialization**: 
  - LED 1 gets Base Configuration LED 1 (page 5)
  - LED 2 gets Base Configuration LED 2 (page 6)  
  - LED 3 gets Base Configuration LED 3 (page 7)
- **File management**: Add/remove files per slot with delete buttons (×)
- **Source LED selection**: Dropdown to choose which LED from source file to use
- **NO radio buttons**: Files are multi-selectable, use individual management instead

### Review Screen Specifications
- **Simplified layout**: Only show LED previews matching screen 1 layout
- **Remove sections**: No "Base Configuration", "Custom LED Mappings", or "Summary" sections
- **Preview consistency**: Same size and layout as initial preview screen

## Development Guidelines

### Code Quality
- Use functional programming patterns
- Prefer small, focused functions
- Maintain type safety with TypeScript
- Follow single responsibility principle

### File Organization
- Keep components under 400 lines
- Use absolute imports for better maintainability  
- Separate concerns between presentation and business logic

### State Management
- Use React useState for local component state
- Pass data through props for component communication
- Maintain immutable state updates

## Platform Considerations

The application supports both Tauri (desktop) and web modes:
- **Tauri mode**: Use `invoke()` for backend operations, native file dialogs
- **Web mode**: Direct JSON parsing, browser download APIs
- Platform detection via `isTauri()` utility function

## Configuration Files

- `biome.json` - Strict linting rules with formatting preferences
- `tauri.conf.json` - Desktop app configuration (1000x700 window)
- `package.json` - Uses pnpm package manager
- `mise.toml` - Runtime version management

## Development Session Learnings

### Tailwind CSS Migration (January 2025)
Successfully migrated the entire application from custom CSS to pure Tailwind utility classes:

#### Custom CSS to Tailwind Mappings
- `.bg-gradient-primary` → `bg-gradient-to-br from-blue-500 to-purple-600`
- `.text-shadow` → `drop-shadow-md`
- `.backdrop-blur-glass` → `backdrop-blur-md`

#### Migration Process
1. **Replace custom classes in components**: Search and replace all instances across TSX files
2. **Update App.css**: Remove custom utility classes, keep only base typography styles
3. **Maintain design consistency**: Ensure gradients and visual effects remain identical

### Multi-File LED Configuration System
Implemented advanced slot-based architecture for handling multiple configuration files:

#### Frame Concatenation Logic
- **Validation**: Real-time validation ensuring 1-300 frames per LED slot
- **State Management**: Pass concatenated configurations through component hierarchy
- **Warning System**: Display warnings when frame limits are exceeded
- **Live Updates**: Use `useMemo` for real-time validation with immediate UI feedback

#### Slot Initialization Pattern
- LED Slot 1 → Base Configuration LED 1 (page index 5)
- LED Slot 2 → Base Configuration LED 2 (page index 6)
- LED Slot 3 → Base Configuration LED 3 (page index 7)

### Code Quality Improvements
#### Debug Code Cleanup
- **Console.log removal**: Systematically removed all debug logging from production code
- **Component simplification**: Eliminated unnecessary IIFE patterns and wrapper functions
- **State consistency**: Fixed navigation data loss by maintaining concatenated configurations

#### Component Design Patterns
- **Reusable FileSelectButton**: Platform-aware component supporting both Tauri and web modes
- **Real-time validation**: Immediate button disable/enable based on validation state
- **Consistent button styling**: Standardized `<input type="button">` usage throughout

### Biome Configuration Best Practices
#### Auto-generated File Exclusion
- **Limitation discovered**: Biome doesn't support direct `ignore` property in files configuration
- **Solution implemented**: Use `.gitignore` with `"useIgnoreFile": true` in biome.json
- **Patterns added**: `*.min.js`, `*.bundle.js`, `**/generated/**`, `**/*.generated.*`, lock files

#### Development Workflow Integration
- Biome automatically respects .gitignore patterns
- No additional configuration needed for standard auto-generated files
- Consistent exclusion across development tools