import * as vscode from "vscode";
import * as ts from "typescript";

interface PropertyInfo {
	name: string;
	type: string;
	isOptional: boolean;
}

function parseInterface(
	sourceFile: ts.SourceFile,
	interfaceName: string,
): PropertyInfo[] {
	const properties: PropertyInfo[] = [];

	function visit(node: ts.Node) {
		if (ts.isInterfaceDeclaration(node) && node.name.text === interfaceName) {
			for (const member of node.members) {
				if (ts.isPropertySignature(member)) {
					const propertyName = member.name.getText(sourceFile);
					const propertyType = member.type
						? member.type.getText(sourceFile)
						: "any";
					const isOptional = member.questionToken !== undefined;

					properties.push({
						name: propertyName,
						type: propertyType,
						isOptional,
					});
				}
			}
		}
	}

	ts.forEachChild(sourceFile, visit);
	return properties;
}

function generateDrawioDiagram(
	interfaceName: string,
	properties: PropertyInfo[],
): string {
	const PADDING_TOP = 40; // Top padding of the class
	const LINE_HEIGHT = 30; // Height of each line
	const CLASS_WIDTH = 200; // Width of the class
	const CLASS_HEIGHT = Math.max(
		60,
		properties.length * LINE_HEIGHT + PADDING_TOP + 20,
	); // Total height of the class

	let mxGraphModel = `
<mxfile host="app.diagrams.net" modified="2024-01-01T00:00:00.000Z" agent="Mozilla/5.0" version="21.6.6" etag="your-etag" type="device">
  <diagram name="Page-1" id="interface-diagram">
    <mxGraphModel dx="1422" dy="798" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
        <mxCell id="2" value="${interfaceName}" style="swimlane;whiteSpace=wrap;html=1;fillColor=#dae8fc;strokeColor=#6c8ebf;" vertex="1" parent="1">
          <mxGeometry x="320" y="240" width="${CLASS_WIDTH}" height="${CLASS_HEIGHT}" as="geometry" />
        </mxCell>`;

	// Add properties with better spacing
	for (let i = 0; i < properties.length; i++) {
		const prop = properties[i];
		const propertyText = `${prop.name}${prop.isOptional ? "?" : ""}: ${prop.type}`;
		const yOffset = 280 + i * LINE_HEIGHT + PADDING_TOP;

		mxGraphModel += `
        <mxCell id="${yOffset}" value="${propertyText}" style="text;html=1;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;whiteSpace=wrap;rounded=0;" vertex="1" parent="2">
          <mxGeometry y="${yOffset - 280}" width="${CLASS_WIDTH - 20}" height="${LINE_HEIGHT}" as="geometry" />
        </mxCell>`;
	}

	mxGraphModel += `
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;

	return mxGraphModel;
}

function generateMermaidDiagram(
	interfaceName: string,
	properties: PropertyInfo[],
): string {
	let mermaidDiagram = `classDiagram
    class ${interfaceName} {`;

	for (const prop of properties) {
		const propertyText = `${prop.name}${prop.isOptional ? "?" : ""}: ${prop.type}`;
		mermaidDiagram += `
        ${propertyText}`;
	}

	mermaidDiagram += `
    }`;

	return mermaidDiagram;
}

function generatePlantUmlDiagram(
	interfaceName: string,
	properties: PropertyInfo[],
): string {
	let plantUmlDiagram = `@startuml
class ${interfaceName} {`;

	for (const prop of properties) {
		const propertyText = `${prop.name}${prop.isOptional ? "?" : ""}: ${prop.type}`;
		plantUmlDiagram += `
    ${propertyText}`;
	}

	plantUmlDiagram += `
}
@enduml`;

	return plantUmlDiagram;
}

async function generateDiagram(
	editor: vscode.TextEditor,
	format: "drawio" | "mermaid" | "plantuml",
) {
	const document = editor.document;
	if (document.languageId !== "typescript") {
		vscode.window.showErrorMessage("The current file is not a TypeScript file");
		return;
	}

	const selection = editor.selection;
	const selectedText = document.getText(selection);

	if (!selectedText) {
		vscode.window.showErrorMessage("Please select a TypeScript interface");
		return;
	}

	try {
		// Create TypeScript program
		const program = ts.createProgram([document.fileName], {});
		const sourceFile = program.getSourceFile(document.fileName);
		if (!sourceFile) {
			throw new Error("Unable to parse the TypeScript file");
		}

		// Find the selected interface
		const interfaceName = selectedText.match(/interface\s+(\w+)/)?.[1];
		if (!interfaceName) {
			vscode.window.showErrorMessage(
				"Please select a valid TypeScript interface",
			);
			return;
		}

		// Parse the interface
		const properties = parseInterface(sourceFile, interfaceName);

		// Generate diagram
		let diagram: string;
		switch (format) {
			case "drawio":
				diagram = generateDrawioDiagram(interfaceName, properties);
				break;
			case "mermaid":
				diagram = generateMermaidDiagram(interfaceName, properties);
				break;
			case "plantuml":
				diagram = generatePlantUmlDiagram(interfaceName, properties);
				break;
		}

		// Copy to clipboard
		await vscode.env.clipboard.writeText(diagram);
		vscode.window.showInformationMessage(
			`${format === "drawio" ? "Draw.io" : format === "mermaid" ? "Mermaid" : "PlantUML"} diagram generated and copied to clipboard!`,
		);
	} catch (error) {
		vscode.window.showErrorMessage(`Error generating diagram: ${error}`);
	}
}

export function activate(context: vscode.ExtensionContext) {
	const drawioDisposable = vscode.commands.registerCommand(
		"drawio-copier.generateDrawioDiagram",
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage("No active editor");
				return;
			}
			await generateDiagram(editor, "drawio");
		},
	);

	const mermaidDisposable = vscode.commands.registerCommand(
		"drawio-copier.generateMermaidDiagram",
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage("No active editor");
				return;
			}
			await generateDiagram(editor, "mermaid");
		},
	);

	const plantUmlDisposable = vscode.commands.registerCommand(
		"drawio-copier.generatePlantUmlDiagram",
		async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {
				vscode.window.showErrorMessage("No active editor");
				return;
			}
			await generateDiagram(editor, "plantuml");
		},
	);

	context.subscriptions.push(
		drawioDisposable,
		mermaidDisposable,
		plantUmlDisposable,
	);
}

export function deactivate() {}
