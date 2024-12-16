// start-ngrok.js
require('dotenv').config(); // Charge les variables d'environnement à partir du fichier .env
console.log(process.env);

const { exec } = require('child_process');

exec('ngrok start --all --config=ngrok.yml', (error, stdout, stderr) => {
    if (error) {
        console.error(`Erreur: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`Erreur de sortie: ${stderr}`);
        return;
    }
    console.log(`Résultat: ${stdout}`);
});