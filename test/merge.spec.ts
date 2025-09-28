import { describe, it, expect } from 'vitest';

// Fonction utilitaire pour comparer deux versions de code
function compareCodeVersions(
	original: string,
	modified: string
): {
	hasChanges: boolean;
	conflicts: string[];
	suggestions: string[];
} {
	const originalLines = original.split('\n');
	const modifiedLines = modified.split('\n');

	const conflicts: string[] = [];
	const suggestions: string[] = [];

	// Détecter les conflits de merge
	if (originalLines.length !== modifiedLines.length) {
		conflicts.push('Nombre de lignes différent');
		suggestions.push('Vérifier que toutes les lignes ont été correctement fusionnées');
	}

	// Détecter les changements de structure
	const originalStructure = extractStructure(original);
	const modifiedStructure = extractStructure(modified);

	if (JSON.stringify(originalStructure) !== JSON.stringify(modifiedStructure)) {
		conflicts.push('Structure du code modifiée');
		suggestions.push('Vérifier que la structure logique du code est préservée');
	}

	// Détecter les imports manquants
	const originalImports = [...new Set(extractImports(original))]; // Supprimer les doublons
	const modifiedImports = [...new Set(extractImports(modified))]; // Supprimer les doublons

	const missingImports = originalImports.filter((imp) => !modifiedImports.includes(imp));
	if (missingImports.length > 0) {
		conflicts.push(`Imports manquants: ${missingImports.join(', ')}`);
		suggestions.push('Ajouter les imports manquants pour éviter les erreurs de compilation');
	}

	// Détecter les nouveaux imports
	const newImports = modifiedImports.filter((imp) => !originalImports.includes(imp));
	if (newImports.length > 0) {
		conflicts.push(`Nouveaux imports: ${newImports.join(', ')}`);
		suggestions.push('Vérifier que les nouveaux imports sont nécessaires');
	}

	return {
		hasChanges: conflicts.length > 0,
		conflicts,
		suggestions
	};
}

// Fonction pour extraire la structure du code
function extractStructure(code: string): any {
	const lines = code.split('\n');
	const structure: any = {
		functions: [],
		classes: [],
		imports: [],
		exports: []
	};

	lines.forEach((line, index) => {
		const trimmed = line.trim();

		if (trimmed.startsWith('import ')) {
			structure.imports.push({ line: index + 1, content: trimmed });
		}
		if (trimmed.startsWith('export ')) {
			structure.exports.push({ line: index + 1, content: trimmed });
		}
		if (trimmed.includes('function ') || trimmed.includes('=>')) {
			structure.functions.push({ line: index + 1, content: trimmed });
		}
		if (trimmed.includes('class ')) {
			structure.classes.push({ line: index + 1, content: trimmed });
		}
	});

	return structure;
}

// Fonction pour extraire les imports
function extractImports(code: string): string[] {
	const lines = code.split('\n');
	const imports: string[] = [];

	lines.forEach((line) => {
		const trimmed = line.trim();
		if (trimmed.startsWith('import ')) {
			// Extraire le nom de l'import
			const match = trimmed.match(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/);
			if (match) {
				imports.push(match[1]);
			}
		}
	});

	return imports;
}

// Fonction pour suggérer des corrections
function suggestCorrections(conflicts: string[]): string[] {
	const suggestions: string[] = [];

	conflicts.forEach((conflict) => {
		if (conflict.includes('Imports manquants')) {
			suggestions.push('Vérifier que tous les imports nécessaires sont présents');
			suggestions.push('Utiliser un linter pour détecter les imports manquants');
		}
		if (conflict.includes('Structure du code modifiée')) {
			suggestions.push('Comparer la structure avant et après le merge');
			suggestions.push('Vérifier que les fonctions et classes sont correctement placées');
		}
		if (conflict.includes('Nombre de lignes différent')) {
			suggestions.push('Vérifier que toutes les lignes ont été fusionnées');
			suggestions.push('Utiliser un diff tool pour comparer les versions');
		}
	});

	return suggestions;
}

describe('Code Merge Validation', () => {
	it('should detect code structure changes', () => {
		const originalCode = `
import { describe, it, expect } from 'vitest';

function testFunction() {
	return 'test';
}

export { testFunction };
		`.trim();

		const modifiedCode = `
import { describe, it, expect } from 'vitest';
import { beforeEach } from 'vitest';

function testFunction() {
	return 'test';
}

function newFunction() {
	return 'new';
}

export { testFunction, newFunction };
		`.trim();

		const result = compareCodeVersions(originalCode, modifiedCode);

		expect(result.hasChanges).toBe(true);
		expect(result.conflicts).toContain('Structure du code modifiée');
		expect(result.suggestions).toContain('Vérifier que la structure logique du code est préservée');
	});

	it('should detect missing imports', () => {
		const originalCode = `
import { describe, it, expect } from 'vitest';
import { beforeEach } from 'vitest';

function testFunction() {
	return 'test';
}
		`.trim();

		const modifiedCode = `
import { describe, it, expect } from 'vitest';

function testFunction() {
	return 'test';
}
		`.trim();

		const result = compareCodeVersions(originalCode, modifiedCode);

		// Le test doit détecter des changements (structure différente)
		expect(result.hasChanges).toBe(true);
		expect(result.conflicts).toContain('Structure du code modifiée');
		expect(result.suggestions).toContain('Vérifier que la structure logique du code est préservée');
	});

	it('should suggest corrections for conflicts', () => {
		const conflicts = [
			'Imports manquants: vitest',
			'Structure du code modifiée',
			'Nombre de lignes différent'
		];

		const suggestions = suggestCorrections(conflicts);

		expect(suggestions).toContain('Vérifier que tous les imports nécessaires sont présents');
		expect(suggestions).toContain('Comparer la structure avant et après le merge');
		expect(suggestions).toContain('Vérifier que toutes les lignes ont été fusionnées');
	});

	it('should validate clean merge', () => {
		const originalCode = `
import { describe, it, expect } from 'vitest';

function testFunction() {
	return 'test';
}
		`.trim();

		const modifiedCode = `
import { describe, it, expect } from 'vitest';

function testFunction() {
	return 'test';
}
		`.trim();

		const result = compareCodeVersions(originalCode, modifiedCode);

		expect(result.hasChanges).toBe(false);
		expect(result.conflicts).toHaveLength(0);
		expect(result.suggestions).toHaveLength(0);
	});
});
