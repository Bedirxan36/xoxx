// 🔥 Firebase (COMPAT)
const firebaseConfig = {
    apiKey: "AIzaSyCTA6oV8_VMH8HXYqw0vkgTdGIUH4JdGMg",
    authDomain: "uygupdater.firebaseapp.com",
    databaseURL: "https://uygupdater-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "uygupdater",
    storageBucket: "uygupdater.firebasestorage.app",
    messagingSenderId: "329985818176",
    appId: "1:329985818176:web:76a35b7c3e5a68c28ee9a5",
    measurementId: "G-44P9WCYTJ4"
  };
  
  // Başlat
  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();
  
  let roomId = "";
  let player = "X";
  
  // URL'den oda var mı kontrol et
  const params = new URLSearchParams(window.location.search);
  if (params.get("room")) {
    roomId = params.get("room");
    player = "O"; // katılan oyuncu O olur
    startGame();
  }
  
  // Oda oluştur
  function createGame() {
    const name = document.getElementById("username").value;
    if (!name) return alert("İsim gir!");
  
    roomId = Math.random().toString(36).substr(2, 5);
  
    db.ref("rooms/" + roomId).set({
      board: ["","","","","","","","",""],
      turn: "X",
    });
  
    startGame();
  }
  
  // Oyunu başlat
  function startGame() {
    document.getElementById("login").classList.add("hidden");
    document.getElementById("game").classList.remove("hidden");
  
    document.getElementById("roomId").innerText =
      "Link: " + window.location.origin + "?room=" + roomId;
  
    renderBoard();
  
    db.ref("rooms/" + roomId).on("value", (snap) => {
      const data = snap.val();
      if (!data) return;
  
      updateBoard(data.board);
      document.getElementById("status").innerText =
        "Sıra: " + data.turn;
  
      checkWinner(data.board);
    });
  }
  
  // Tahta oluştur
  function renderBoard() {
    const board = document.getElementById("board");
    board.innerHTML = "";
  
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.onclick = () => move(i);
      board.appendChild(cell);
    }
  }
  
  // Hamle
  function move(i) {
    const ref = db.ref("rooms/" + roomId);
  
    ref.once("value", (snap) => {
      let data = snap.val();
      if (!data) return;
  
      // sıra kontrolü
      if (data.turn !== player) return;
  
      // doluysa oynama
      if (data.board[i] !== "") return;
  
      data.board[i] = player;
      data.turn = player === "X" ? "O" : "X";
  
      ref.set(data);
    });
  }
  
  // Tahtayı güncelle
  function updateBoard(board) {
    document.querySelectorAll(".cell").forEach((c, i) => {
      c.innerText = board[i];
    });
  }
  
  // Kazanan kontrol
  function checkWinner(b) {
    const wins = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
  
    for (let w of wins) {
      if (b[w[0]] && b[w[0]] === b[w[1]] && b[w[1]] === b[w[2]]) {
        document.getElementById("status").innerText = b[w[0]] + " kazandı!";
        document.getElementById("rematch").classList.remove("hidden");
        return;
      }
    }
  
    // beraberlik
    if (!b.includes("")) {
      document.getElementById("status").innerText = "Berabere!";
      document.getElementById("rematch").classList.remove("hidden");
    }
  }
  
  // Rövanş
  document.getElementById("rematch").onclick = () => {
    db.ref("rooms/" + roomId).update({
      board: ["","","","","","","","",""],
      turn: "X"
    });
  };