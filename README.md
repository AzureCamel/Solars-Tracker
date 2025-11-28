# Solars Tracker

A lightweight Foundry VTT module that monitors currency changes and logs a transaction receipt to the chat.

Made with AI, I have no idea what I'm doing, so hopefully it works!

**Manifest** https://github.com/AzureCamel/Solars-Tracker/releases/latest/download/module.json

## Features

* **Automatic Logging:** Detects changes to actor data (default: `system.solars`) and calculates the difference.
* **Private Receipts:** Chat messages are whispered only to the GM and the actor's owners.
* **Visual Feedback:** Displays positive changes in green and negative changes in red.
* **Customizable:** Configure the currency name, data path, and font size in the module settings.

## Installation

1.  In Foundry VTT, go to **Add-on Modules** > **Install Module**.
2.  Paste the following into the **Manifest URL** field:
    `https://github.com/AzureCamel/Solars-Tracker/releases/latest/download/module.json`
3.  Click **Install**.

## Configuration

Go to **Game Settings** > **Solars Tracker** to adjust:

* **Currency Name:** Label used in chat (e.g., Solars, Gold).
* **Currency Data Path:** The actor property to track (default: `system.solars`).
* **Enable Tracking:** Toggle the module on/off.
* **Font Size:** Adjust text size for the log message.

## License

MIT License - Feel free to modify and distribute.
