const admin = require('firebase-admin');

// ✅ Load your Firebase service account key JSON
const serviceAccount = require('./serviceAccountKey.json'); // download from Firebase console

// ✅ Initialize Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

// ✅ Replace with the UID of the user you want to make admin
const targetUID = 'FQ6iixtNyfOtyBuyOJMasNOFZ322';

admin.auth().setCustomUserClaims(targetUID, { role: 'admin' })
    .then(() => {
        console.log(`✅ Admin role set for UID: ${targetUID}`);
    })
    .catch((error) => {
        console.error('❌ Error setting custom claims:', error);
    });
