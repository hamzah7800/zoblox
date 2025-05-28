const healthBar = document.createElement("div");
healthBar.id = "healthBarContainer";
healthBar.innerHTML = `<div id="healthBar"></div>`;
document.body.appendChild(healthBar);

const teamLabel = document.createElement("div");
teamLabel.id = "teamIndicator";
teamLabel.textContent = "Team: Unknown";
document.body.appendChild(teamLabel);
