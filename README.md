# 📸 ImageEditorPro – Custom Node for n8n

Advanced image manipulation node for [n8n.io](https://n8n.io) using [sharp](https://sharp.pixelplumbing.com/) and [canvas](https://github.com/Automattic/node-canvas).

## ✨ Features

- 🧩 **Collage Mode**  
  Combine multiple images into a grid layout (2x2, 3x3, etc.) with spacing and background color.

- ✍️ **Add Text Mode**  
  Overlay text on an image with options:
  - Font size
  - Color and opacity
  - Position (`top-left`, `center`, `bottom-right`, or exact coordinates)
  - Background shape (circle or rectangle) behind the text

- 💦 **Add Watermark Mode**  
  Add a text or image watermark on top of an image with control over opacity and positioning.

- 🌐 **Input support**  
  Accepts both:
  - Binary image input from previous nodes (`imageInput`)
  - Comma-separated image URLs

- 📤 **Output**  
  Processed image returned as PNG binary under the key `data`.

---

## 🚀 Installation

### 1. Prerequisites for Linux

Before installing this node, make sure the following system packages are installed:

```bash
sudo apt update
sudo apt install -y libcairo2-dev libjpeg-dev libpango1.0-dev libgif-dev build-essential g++

### 2. Clone / Download

```bash
git clone https://github.com/YOUR_USERNAME/n8n-nodes-image-editor-pro.git
cd n8n-nodes-image-editor-pro
npm install
npm run build
