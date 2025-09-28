#!/usr/bin/env node
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔍 Validation de merge en cours...\n');

// Fonction pour exécuter une commande et capturer la sortie
function runCommand(command, description) {
	console.log(`📋 ${description}...`);
	try {
		const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
		console.log(`✅ ${description} - Succès`);
		return output;
	} catch (error) {
		console.error(`❌ ${description} - Échec`);
		console.error(error.message);
		process.exit(1);
	}
}

// Fonction pour vérifier les changements de fichiers
function checkFileChanges() {
	console.log('📁 Vérification des changements de fichiers...');

	try {
		// Obtenir la liste des fichiers modifiés
		const changedFiles = execSync('git diff --name-only HEAD~1 HEAD', { encoding: 'utf8' });

		if (changedFiles.trim()) {
			console.log('📝 Fichiers modifiés :');
			changedFiles
				.split('\n')
				.filter((f) => f.trim())
				.forEach((file) => {
					console.log(`   - ${file}`);
				});
		} else {
			console.log('ℹ️  Aucun fichier modifié détecté');
		}

		return changedFiles
			.trim()
			.split('\n')
			.filter((f) => f.trim());
	} catch (error) {
		console.log('ℹ️  Impossible de détecter les changements (première commit ?)');
		return [];
	}
}

// Fonction pour vérifier la qualité du code
function checkCodeQuality() {
	console.log('\n🔍 Vérification de la qualité du code...');

	// Vérifier que les tests passent
	runCommand('npm run test:unit', 'Tests unitaires');

	// Formater le code automatiquement
	try {
		runCommand('npm run format', 'Formatage automatique du code');
	} catch (error) {
		console.log('⚠️  Formatage automatique échoué, continuation...');
	}

	// Vérifier le linting (tolérant)
	try {
		runCommand('npm run lint', 'Linting du code');
	} catch (error) {
		console.log('⚠️  Problèmes de linting détectés, mais continuation...');
		console.log('💡 Utilisez "npm run format" pour corriger automatiquement');
		// Ne pas faire échouer le script pour des problèmes de linting
	}

	// Vérifier la compilation TypeScript
	runCommand('npm run check', 'Vérification TypeScript');
}

// Fonction pour vérifier les dépendances
function checkDependencies() {
	console.log('\n📦 Vérification des dépendances...');

	try {
		// Vérifier que package.json existe
		if (!fs.existsSync('package.json')) {
			throw new Error('package.json non trouvé');
		}

		// Vérifier que node_modules existe
		if (!fs.existsSync('node_modules')) {
			console.log('📥 Installation des dépendances...');
			runCommand('npm ci', 'Installation des dépendances');
		}

		console.log('✅ Dépendances vérifiées');
	} catch (error) {
		console.error('❌ Erreur avec les dépendances :', error.message);
		process.exit(1);
	}
}

// Fonction pour vérifier la configuration Docker
function checkDockerConfig() {
	console.log('\n🐳 Vérification de la configuration Docker...');

	const requiredFiles = ['Dockerfile', 'docker-compose.yml'];

	requiredFiles.forEach((file) => {
		if (fs.existsSync(file)) {
			console.log(`✅ ${file} trouvé`);
		} else {
			console.error(`❌ ${file} manquant`);
			process.exit(1);
		}
	});

	// Vérifier que Docker est disponible
	try {
		execSync('docker --version', { stdio: 'pipe' });
		console.log('✅ Docker disponible');
	} catch (error) {
		console.error('❌ Docker non disponible');
		process.exit(1);
	}
}

// Fonction principale
async function main() {
	console.log('🚀 Début de la validation de merge\n');

	try {
		// Vérifier les changements de fichiers
		const changedFiles = checkFileChanges();

		// Vérifier les dépendances
		checkDependencies();

		// Vérifier la qualité du code
		checkCodeQuality();

		// Vérifier la configuration Docker
		checkDockerConfig();

		console.log('\n✅ Validation de merge terminée avec succès !');
		console.log('🎉 Le code est prêt pour le déploiement');
	} catch (error) {
		console.error('\n❌ Validation de merge échouée :', error.message);
		process.exit(1);
	}
}

// Exécuter le script
main();
