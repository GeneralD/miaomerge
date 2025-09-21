# Cyberboard Config Merger

A Tauri-based desktop application for merging and customizing CYBERBOARD R4 LED configurations. This application allows users to select base configurations and merge them with custom LED mappings for slots 1, 2, and 3 (corresponding to pages 5, 6, 7 in the configuration).

## Features

- **Base Configuration Selection**: Load existing CYBERBOARD R4 LED configuration files
- **Multi-File LED Mapping**: Assign multiple configuration files to each LED slot with frame concatenation
- **Live Preview**: Real-time visualization of LED configurations with compact and regular view modes
- **Frame Validation**: Ensure frame counts stay within limits (1-300 frames per slot)
- **Cross-Platform**: Works as both desktop app (Tauri) and web application
- **Internationalization**: Support for English, Japanese, and Chinese languages
- **Cyberpunk Theme**: Matrix-style background with neon green styling

## Technology Stack

### Frontend
- **React 19** with TypeScript for UI components
- **Vite** for development and build tooling
- **Tailwind CSS** for styling with cyberpunk theme
- **react-i18next** for internationalization
- **react-mdr** for Matrix rain background effect

### Backend
- **Tauri v2** for desktop application framework
- **Rust** with clean architecture pattern (domain/usecase/infrastructure layers)
- **Serde** for JSON serialization with flexible property handling

### Development Tools
- **Biome** for linting and formatting with strict rules
- **Oxlint** for additional linting
- **pnpm** package manager
- **mise** for runtime version management

## Installation

### Prerequisites
- Node.js 18+
- Rust (latest stable)
- pnpm package manager

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd miaomerge

# Install dependencies
pnpm install

# Run development server
pnpm dev

# Run Tauri development mode
pnpm tauri dev
```

## Usage

### Workflow Steps

1. **Select Base Configuration**
   - Choose your base CYBERBOARD R4 LED configuration file
   - Preview shows LED configurations for pages 5, 6, 7

2. **Configure LED Mappings**
   - Assign additional configuration files to each LED slot (1, 2, 3)
   - Multiple files can be assigned per slot
   - Select which LED from source files to use
   - Real-time frame count validation (1-300 frames per slot)

3. **Review Configuration**
   - Preview final merged LED configurations
   - Verify frame counts and visual appearance

4. **Save Configuration**
   - Export merged configuration as JSON file
   - Maintains all non-LED properties from base configuration

### Key Features

- **Multi-File Support**: Each slot can have multiple source files
- **Frame Concatenation**: Automatically combines frames from multiple sources
- **Source LED Selection**: Choose which LED (page 5, 6, or 7) to use from each source file
- **Validation**: Real-time checking of frame limits and configuration integrity
- **Property Preservation**: All non-LED properties (Fn_key, MACRO_key, etc.) are preserved from base configuration

## Development

### Available Commands

```bash
# Development
pnpm dev                # Start Vite development server
pnpm tauri dev         # Start Tauri development mode

# Building
pnpm build             # Build for production
pnpm tauri build       # Build Tauri desktop app

# Code Quality
pnpm lint              # Run Biome linter
pnpm lint:fix          # Auto-fix with Biome
pnpm lint:oxlint       # Additional Oxlint checks
pnpm format            # Format code with Biome
pnpm check             # Run all checks (lint + oxlint + type check)
```

### Architecture

#### Frontend Structure
- `src/App.tsx` - Main application entry point with Provider wrapper
- `src/components/` - React components for each workflow step
- `src/contexts/` - React Context for state management
- `src/types.ts` - TypeScript interfaces with flexible property handling
- `src/utils/` - Utility functions for platform detection and frame operations

#### Backend Structure (src-tauri/src/)
- `domain/` - Core business entities and interfaces
- `usecase/` - Application business logic
- `infrastructure/` - File system implementation
- `presentation/` - Tauri command handlers

### Code Standards

- **Functional Programming**: Prefer small, focused functions
- **Single Responsibility**: One function, one purpose
- **Type Safety**: Strict TypeScript with proper interfaces
- **Button Implementation**: Use `<input type="button">` tags, not `<button>` tags
- **File Size Limit**: Components should not exceed 400 lines

## Data Structures

### LEDConfiguration
Core configuration structure with flexible property handling:
- `product_info` - Product information
- `page_num` - Number of pages
- `page_data` - Array of LED page configurations
- `[key: string]: any` - Preserves all other properties from base configuration

### SlotFile
Represents a configuration file assigned to an LED slot:
- `fileInfo` - File metadata
- `config` - LED configuration data
- `sourceLED` - Which LED from source file to use (5, 6, or 7)

## Configuration Files

- `biome.json` - Strict linting rules with formatting preferences
- `tauri.conf.json` - Desktop app configuration (1000x700 window)
- `package.json` - Uses pnpm package manager
- `mise.toml` - Runtime version management

## Contributing

1. Follow the established code style using Biome
2. Maintain type safety throughout the codebase
3. Write focused, single-responsibility functions
4. Use the TodoWrite tool for tracking multi-step tasks
5. Test both Tauri and web modes

## License

[Add your license information here]
