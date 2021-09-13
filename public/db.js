//Create a new IDB database for online use
let db;
const request = indexedDB.open("budget", 1);

//Create a new Object Store
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  db.createdObjectStore("pending", { autoIncrement: true });
};

//Check if navigator is online. If it is check the database
request.onsuccess = function (event) {
  db = event.target.result;
  if (navigator.onLine) {
    checkDatabase();
  }
};

//Catch for an error
request.onerror = function (event) {
  console.log("Something went wrong!" + event.target.errorCode);
};

/*
=========== HELPER FUNCTIONS
*/

//Create a new transaction in the budget database, pending Object Store
function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  store.add(record);
}

//When the app is online, take anything from the IDB and POST to Mongo Database
function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  const store = transaction.objectStore("pending");
  const getAll = store.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("api/trasnaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text,plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

//Listen for window to go back online, run checkDatabase function
window.addEventListener("online", checkDatabase);
