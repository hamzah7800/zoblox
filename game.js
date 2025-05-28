// game.js
const canvas = document.getElementById("renderCanvas");
canvas.style.width = "100vw";
canvas.style.height = "100vh";
canvas.style.position = "absolute";
canvas.style.top = "0";
canvas.style.left = "0";
const engine = new BABYLON.Engine(canvas, true);

const socket = new WebSocket("ws://localhost:3000");
const players = {}; // Store other players
let myId = null;

const createScene = () => {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.1);

  const camera = new BABYLON.UniversalCamera("camera", new BABYLON.Vector3(0, 2, -10), scene);
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 100, height: 100 }, scene);
  const groundMat = new BABYLON.StandardMaterial("groundMat", scene);
  groundMat.diffuseTexture = new BABYLON.Texture("textures/ground.jpg", scene);
  ground.material = groundMat;

  const player = BABYLON.MeshBuilder.CreateBox("player", { height: 2, width: 1, depth: 1 }, scene);
  player.position.y = 1;
  const playerMat = new BABYLON.StandardMaterial("playerMat", scene);
  playerMat.diffuseTexture = new BABYLON.Texture("textures/player_skin.png", scene);
  player.material = playerMat;

  const weapons = {
    AR: BABYLON.MeshBuilder.CreateBox("ar", { width: 1, height: 0.3, depth: 2 }, scene),
    pistol: BABYLON.MeshBuilder.CreateBox("pistol", { width: 0.5, height: 0.2, depth: 1 }, scene)
  };
  weapons.AR.parent = camera;
  weapons.pistol.parent = camera;
  weapons.AR.position.set(0.5, -0.5, 1);
  weapons.pistol.position.set(0.5, -0.5, 1);
  weapons.pistol.setEnabled(false);

  let currentWeapon = "AR";
  let ammo = 30;
  const maxAmmo = 30;

  document.getElementById("ammoDisplay").textContent = `Ammo: ${ammo}`;
  const shootSound = new BABYLON.Sound("shoot", "sounds/shoot.wav", scene);

  const inputMap = {};
  scene.actionManager = new BABYLON.ActionManager(scene);
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, evt => inputMap[evt.sourceEvent.key] = true));
  scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, evt => inputMap[evt.sourceEvent.key] = false));

  scene.onBeforeRenderObservable.add(() => {
    const speed = 0.2;
    if (inputMap["w"]) player.position.z += speed;
    if (inputMap["s"]) player.position.z -= speed;
    if (inputMap["a"]) player.position.x -= speed;
    if (inputMap["d"]) player.position.x += speed;
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "1") {
      weapons.AR.setEnabled(true);
      weapons.pistol.setEnabled(false);
      currentWeapon = "AR";
    }
    if (e.key === "2") {
      weapons.AR.setEnabled(false);
      weapons.pistol.setEnabled(true);
      currentWeapon = "pistol";
    }
    if (e.key === "f" && ammo > 0) {
      shootBullet();
      shootSound.play();
      ammo--;
      document.getElementById("ammoDisplay").textContent = `Ammo: ${ammo}`;
      socket.send(JSON.stringify({ type: "shoot", from: player.position }));
    }
    if (e.key === "r") {
      ammo = maxAmmo;
      document.getElementById("ammoDisplay").textContent = `Ammo: ${ammo}`;
    }
  });

  const shootBullet = () => {
    const bullet = BABYLON.MeshBuilder.CreateSphere("bullet", { diameter: 0.2 }, scene);
    bullet.position = camera.position.clone();
    const direction = camera.getForwardRay().direction;
    const velocity = direction.scale(2);

    const disposeTimeout = setTimeout(() => bullet.dispose(), 3000);

    scene.registerBeforeRender(() => {
      bullet.position.addInPlace(velocity);
    });
  };

  let health = 100;
  const updateHealth = (amount) => {
    health = Math.max(0, Math.min(100, health + amount));
    document.getElementById("healthBar").style.width = `${health}%`;
    document.getElementById("healthText").textContent = `${health}%`;
  };

  const team = Math.random() > 0.5 ? "Alliance" : "The Force";
  document.getElementById("teamIndicator").innerText = `Team: ${team}`;

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "init") {
      myId = data.id;
    } else if (data.type === "player") {
      if (!players[data.id]) {
        const remote = BABYLON.MeshBuilder.CreateBox("remotePlayer", { height: 2, width: 1, depth: 1 }, scene);
        remote.material = playerMat;
        players[data.id] = remote;
      }
      players[data.id].position = new BABYLON.Vector3(data.x, data.y, data.z);
    } else if (data.type === "shoot") {
      // TODO: render other player's bullet if needed
    }
  };

  scene.registerBeforeRender(() => {
    if (myId) {
      socket.send(JSON.stringify({
        type: "player",
        id: myId,
        x: player.position.x,
        y: player.position.y,
        z: player.position.z
      }));
    }
  });

  return scene;
};

const scene = createScene();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
