Hooks.once("init", function () {
  console.log("Solars Tracker | Initializing");

  // Register settings
  game.settings.register("solars-tracker", "currencyName", {
    name: "Currency Name",
    hint: "The display name for the currency (e.g., Solars, Gold, Credits)",
    scope: "world",
    config: true,
    type: String,
    default: "Solars",
  });

  game.settings.register("solars-tracker", "dataPath", {
    name: "Currency Data Path",
    hint: "The path to the currency value on the actor (e.g., system.solars, system.currency.gold, system.credits)",
    scope: "world",
    config: true,
    type: String,
    default: "system.solars",
  });

  game.settings.register("solars-tracker", "enableTracking", {
    name: "Enable Currency Tracking",
    hint: "Toggle currency tracking on/off without disabling the module",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register("solars-tracker", "fontSize", {
    name: "Font Size",
    hint: "Font size for currency tracking messages (in pixels)",
    scope: "world",
    config: true,
    type: Number,
    default: 14,
    range: {
      min: 10,
      max: 24,
      step: 1,
    },
  });
});

Hooks.once("ready", function () {
  console.log("Solars Tracker | Ready");
  const currencyName = game.settings.get("solars-tracker", "currencyName");
  const dataPath = game.settings.get("solars-tracker", "dataPath");
  console.log(
    `Solars Tracker | Tracking "${currencyName}" at path "${dataPath}"`
  );
});

// Helper function to get nested property value
function getNestedProperty(obj, path) {
  return path.split(".").reduce((current, prop) => current?.[prop], obj);
}

// Helper function to check if a path changed in the update
function hasPathChanged(changes, path) {
  const parts = path.split(".");
  let current = changes;

  for (let i = 0; i < parts.length; i++) {
    if (current[parts[i]] === undefined) {
      return false;
    }
    if (i === parts.length - 1) {
      return true;
    }
    current = current[parts[i]];
  }
  return false;
}

// Helper function to get the new value from changes
function getNewValueFromChanges(changes, path) {
  const parts = path.split(".");
  let current = changes;

  for (let part of parts) {
    if (current[part] === undefined) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

// Track updates to actors
Hooks.on("preUpdateActor", function (actor, changes, options, userId) {
  // Check if tracking is enabled
  if (!game.settings.get("solars-tracker", "enableTracking")) {
    return;
  }

  const dataPath = game.settings.get("solars-tracker", "dataPath");

  // Check if the currency path is being changed
  if (hasPathChanged(changes, dataPath)) {
    const oldValue = getNestedProperty(actor, dataPath) || 0;
    const newValue = getNewValueFromChanges(changes, dataPath);
    const difference = newValue - oldValue;

    // Store the old value for the update hook
    options.currencyTracking = {
      oldValue: oldValue,
      newValue: newValue,
      difference: difference,
    };
  }
});

Hooks.on("updateActor", async function (actor, changes, options, userId) {
  // Only the first active GM should create the message
  const firstGM = game.users.find((u) => u.isGM && u.active);

  if (!game.user.isGM || game.user.id !== firstGM?.id) {
    return;
  }

  // Check if we tracked currency changes
  if (options.currencyTracking) {
    const { oldValue, newValue, difference } = options.currencyTracking;
    const currencyName = game.settings.get("solars-tracker", "currencyName");
    const fontSize = game.settings.get("solars-tracker", "fontSize");

    // Get player owners
    const owners = [];
    for (let [userId, permission] of Object.entries(actor.ownership)) {
      if (
        permission === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER &&
        userId !== "default"
      ) {
        owners.push(userId);
      }
    }

    // Create whisper array (GMs + owners)
    const gmIds = game.users.filter((u) => u.isGM).map((u) => u.id);
    const whisperTo = [...new Set([...gmIds, ...owners])];

    // Format the difference with + or - sign
    const diffDisplay = difference >= 0 ? `+${difference}` : `${difference}`;
    const diffClass = difference >= 0 ? "positive" : "negative";

    // Create chat message
    const chatData = {
      user: userId,
      speaker: ChatMessage.getSpeaker({ actor: actor }),
      whisper: whisperTo,
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: `
        <div class="solars-tracker-message" style="font-size: ${fontSize}px;">
          <div class="solars-details">
            <span class="value">☉ ${currencyName}: ${oldValue}</span>
            <span class="value-change ${diffClass}"> ${diffDisplay}</span>
            <span class="value"> → ${newValue}</span>
          </div>
        </div>
      `,
      flavor: "",
      flags: {
        "solars-tracker": {
          oldValue: oldValue,
          newValue: newValue,
          difference: difference,
          currencyName: currencyName,
        },
      },
    };

    await ChatMessage.create(chatData);
  }
});
