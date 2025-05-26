const canvas = document.getElementById('renderCanvas');
const engine = new BABYLON.Engine(canvas, true);
const scene = new BABYLON.Scene(engine);

const camera = new BABYLON.UniversalCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
camera.setTarget(BABYLON.Vector3.Zero());
camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
light.intensity = 0.7;

const ground = BABYLON.MeshBuilder.CreateGround("ground", {width: 20, height: 20}, scene);
const player = BABYLON.MeshBuilder.CreateBox("player", {height: 2}, scene);
player.position.y = 1;

scene.enablePhysics();
player.physicsImpostor = new BABYLON.PhysicsImpostor(player, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, friction: 0.5 }, scene);
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0 }, scene);

let inputMap = {};
scene.actionManager = new BABYLON.ActionManager(scene);
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, evt => inputMap[evt.sourceEvent.key] = true));
scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, evt => inputMap[evt.sourceEvent.key] = false));

engine.runRenderLoop(() => {
  const moveSpeed = 0.1;
  let dir = new BABYLON.Vector3.Zero();

  if (inputMap['w'] || inputMap['ArrowUp']) dir.z -= moveSpeed;
  if (inputMap['s'] || inputMap['ArrowDown']) dir.z += moveSpeed;
  if (inputMap['a'] || inputMap['ArrowLeft']) dir.x -= moveSpeed;
  if (inputMap['d'] || inputMap['ArrowRight']) dir.x += moveSpeed;

  if (window.getJoystick) {
    const { dx, dy } = window.getJoystick();
    dir.x += dx * 0.005;
    dir.z += dy * 0.005;
  }

  player.moveWithCollisions(dir);
  scene.render();
});

runLua(`function onUpdate() print("Lua script running") end onUpdate()`);