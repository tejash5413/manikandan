const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const defaultPassword = 'Student@123';

// ✅ Assign admin role to a specific UID
const assignAdminRole = async () => {
  const targetUID = 'FQ6iixtNyfOtyBuyOJMasNOFZ322'; // 🔁 Replace with actual admin UID
  try {
    await admin.auth().setCustomUserClaims(targetUID, { role: 'admin' });
    console.log(`✅ Admin role set for UID: ${targetUID}`);
  } catch (error) {
    console.error('❌ Failed to set admin role:', error.message);
  }
};

// ✅ Sync students from Firestore and assign roles
const syncStudentsFromFirestore = async () => {
  const snapshot = await db.collection('students_list').get();

  if (snapshot.empty) {
    console.log('⚠️ No students found in "students_list".');
    return;
  }

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const rollno = data.rollno;
    const email = `${rollno}@student.com`;

    try {
      let userRecord;

      try {
        userRecord = await admin.auth().getUserByEmail(email);
        console.log(`✅ User exists: ${email}`);
      } catch (err) {
        userRecord = await admin.auth().createUser({
          email,
          password: defaultPassword,
          displayName: data.name || rollno,
        });
        console.log(`✅ Created new user: ${email}`);
      }

      await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'student' });
      console.log(`🎓 Assigned 'student' role to ${email}`);

      if (!data.uid) {
        await db.collection('students_list').doc(doc.id).update({ uid: userRecord.uid });
        console.log(`📝 UID updated for ${rollno}`);
      }

    } catch (err) {
      console.error(`❌ Failed for ${email}:`, err.message);
    }
  }

  console.log('🎉 Student sync complete.');
};

// ✅ Run both
(async () => {
  await assignAdminRole();
  await syncStudentsFromFirestore();
})();
