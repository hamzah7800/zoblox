const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

// Camera
const camera = new BABYLON.UniversalCamera("cam", new BABYLON.Vector3(0, 5, -10), scene);
camera.attachControl(canvas, true);

// Light
const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

// Ground
const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 50, height: 50}, scene);
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);

// Player
const player = BABYLON.MeshBuilder.CreateBox("player", {height: 2, width: 1, depth: 1}, scene);
player.position.y = 2;
player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 1 }, scene);

// Physics
scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), new BABYLON.CannonJSPlugin());

// Input
const input = { forward: 0, backward: 0, left: 0, right: 0 };

window.addEventListener("keydown", e => {
  if (e.key === "w" || e.key === "ArrowUp") input.forward = 1;
  if (e.key === "s" || e.key === "ArrowDown") input.backward = 1;
  if (e.key === "a" || e.key === "ArrowLeft") input.left = 1;
  if (e.key === "d" || e.key === "ArrowRight") input.right = 1;
});
window.addEventListener("keyup", e => {
  if (e.key === "w" || e.key === "ArrowUp") input.forward = 0;
  if (e.key === "s" || e.key === "ArrowDown") input.backward = 0;
  if (e.key === "a" || e.key === "ArrowLeft") input.left = 0;
  if (e.key === "d" || e.key === "ArrowRight") input.right = 0;
});

// Joystick
const joystick = new Joystick("joystick-container");

engine.runRenderLoop(() => {
  scene.render();

  // Movement vector
  const moveVector = new BABYLON.Vector3();
  const joy = joystick.getDirection();

  // Mobile movement
  if (joy.x !== 0 || joy.y !== 0) {
    moveVector.z = -joy.y * 0.2;
    moveVector.x = joy.x * 0.2;
  } else {
    // Keyboard movement
    moveVector.z = (input.backward - input.forward) * 0.2;
    moveVector.x = (input.right - input.left) * 0.2;
  }

  const playerImpostor = player.physicsImpostor;
  const velocity = playerImpostor.getLinearVelocity();
  playerImpostor.setLinearVelocity(new BABYLON.Vector3(
    moveVector.x * 10,
    velocity.y,
    moveVector.z * 10
  ));
});