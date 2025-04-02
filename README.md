# Draw.io Interface Generator

This VSCode extension allows you to generate a draw.io diagram from a selected TypeScript interface.

## Features

- Generates a UML diagram from a selected TypeScript interface
- Copies the diagram directly to your clipboard
- Accessible via the context menu (right-click) in a TypeScript file
- Shows a confirmation notification when the diagram is copied

## Usage

1. Open a TypeScript file in VSCode
2. Select a TypeScript interface
3. Right-click on the selection
4. Choose "Generate draw.io diagram" from the context menu
5. The diagram is copied to your clipboard
6. Open https://app.diagrams.net/ in your browser
7. Create a new diagram and paste the content (Ctrl+V)

## Prerequisites

- Visual Studio Code 1.85.0 or higher
- TypeScript files with interfaces

## Installation

1. Clone this repository
2. Run `npm install`
3. Press F5 to launch the extension in debug mode
4. Or use `vsce package` to create a .vsix file and install it via VSCode

## Development

To modify the extension:

1. Make your changes in the `src` directory
2. Run `npm run compile` to compile the changes
3. Press F5 to test the changes in a new VSCode window

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request. 