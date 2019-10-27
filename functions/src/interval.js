const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getRadiationForEpoch } = require('./utils');

exports.runInterval = functions.pubsub.topic('interval').onPublish(async () => {
        // set game state in this tick
        const db = admin.firestore();
        const gameRef = db.collection('game').doc('operacexxx');
        const game = await gameRef.get().data();
        console.log(`======evaulate epoch ${game.epoch} ======`);
        const timestamp = Date.now();
        // update GAME
        await gameRef.update({
            radiation: getRadiationForEpoch(game.epoch),
            timestamp,
            epoch: game.epoch + 1,
        });
    
        // update USERS
        let users = [];
        await db.collection('users').get().then((querySnapshot) => {
            return querySnapshot.forEach((doc) => {
                const userRef = db.collection('users').doc(doc.id);
                users.push({
                    ...doc.data(),
                    id: doc.id,
                });
                const currentUserRadiation = doc.data().status.radiation;
                // only 5% of regular radiation affects player in protectiveSuite;
                const DOSE_MODIFIER = doc.data().status.protectiveSuiteOn ? 0.05 : 1;
                return userRef.update({
                    'status.radiation': currentUserRadiation + ((game.radiation / 60 ) * DOSE_MODIFIER)
                });
            });
        }).catch((err) => console.error(err));
    
        // updated BUNKERS
    
        return db.collection('bunkers').get().then((querySnapshot) => {
            return querySnapshot.forEach((doc) => {
                const bunkerRef = db.collection('bunkers').doc(doc.id);
    
                const bunker = {
                    ...doc.data(),
                    id: doc.id,
                };
                const numberOfUsers = users.filter(u => u.BunkerId === doc.id).length;
                console.log('numberOfUsers', numberOfUsers);
                if (typeof numberOfUsers !== 'number' || isNaN(numberOfUsers)) {
                    console.error('number of users not defined in bunker, this looks like error')
                    return;
                }
                // nothing needs to change
                if ((numberOfUsers === 0 && bunker.oxygenGeneration === 0) || bunker.isDestroyed) {
                    return;
                }
    
                let updatedOxygen = bunker.oxygen - (numberOfUsers * 1) + bunker.oxygenGeneration;
                if (updatedOxygen < 0) {
                    bunkerRef.update({
                        isDestroyed: true,
                    });
                } else if (updatedOxygen > bunker.oxygenCap) {
                    updatedOxygen = bunker.oxygenCap;
                }
    
                bunkerRef.update({
                    'oxygen': updatedOxygen,
                });

            });
        }).catch((err) => console.error(err));
    });

