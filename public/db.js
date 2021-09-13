//CREATE A NEW INDEXEDDB INSTANCE FOR OFFLINE USE
let db;
const request = indexedDB.open("transaction", 1);
