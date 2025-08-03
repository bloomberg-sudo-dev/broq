<h1 align="center">
  <img src="https://github.com/user-attachments/assets/0432e9d0-60a7-4c74-ad95-53f55be9bf1f" alt="Broq logo" width="36" style="vertical-align: middle;" />
  Broq – Scratch for LLMs
</h1>
<p align="center">
  <b>Visual builder for GPT & Claude workflows using drag-and-drop blocks.</b><br>
  <i>Open-source, testable, and designed for everyone — no code required.</i>
</p>

<p align="center">
  <a href="broq-home.vercel.app" target="_blank">
    <img alt="Try the Demo" src="https://img.shields.io/badge/%F0%9F%A7%B1%20Try%20Live%20Demo-blue?style=for-the-badge" />
  </a>
  <a href="https://github.com/bloomberg-sudo-dev/broq/" target="_blank"> 
    <img alt="GitHub stars" src="https://img.shields.io/github/stars/bloomberg-sudo-dev/broq?style=for-the-badge" />
  </a>
  <a href="https://discord.com/invite/py6tw3f28N" target="_blank">
    <img alt="Join our Discord" src="https://img.shields.io/badge/💬%20Join%20Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white" />
  </a>
</p>

---

## What Is Broq?

Broq is a **visual programming tool** designed to make LLM workflows modular, remixable, and fun.  
It's like **Scratch for prompt engineering** — build GPT pipelines by connecting colorful blocks.

- Prototype GPT-based tools without writing code
- Teach students or teams how AI logic flows work
- Visualize, test, and modify flows faster than any JSON or script

---

## Demo Preview

| Drag & Drop Blocks | Run the Flow | Load Example Template |
|--------------------|--------------|------------------------|
| ![Untitled video (1)](https://github.com/user-attachments/assets/9ee728eb-34c5-42fe-abd8-d0898f6ab90b) | ![Untitled video (2)](https://github.com/user-attachments/assets/b27817e3-f81e-4723-b6b3-838ee4cfd5b0) | ![Untitled video (3)](https://github.com/user-attachments/assets/b0f32328-45d6-4ba2-affd-18c53e44d7ec) |

---

## Features

- **Visual Programming** – Drag and drop blocks to build LLM apps
- **LLM-Powered** – Works with GPT-4, Claude, and custom APIs
- **If/Then/Else Logic** – Add basic flow control in seconds
- **Boolean Logic Blocks** – Hexagonal comparison (=, ≠, >, <) and logic (AND, OR, NOT) operators
- **Variable System** – Store, retrieve, and connect variable values between blocks
- **Value Input Blocks** – Enter values and connect dynamic inputs to your flows
- **Flow Management** – Save, load, and remix flows
- **Multiline Input Support**
- **Light/Dark Mode Theming**
- **Repeat & Remix-Friendly** – A creative playground for AI builders

---

## Use Cases

### Visual Prompt Builder  
Craft and refine prompts with block logic instead of code.

### Batch Text Transformer  
Apply the same LLM prompt to multiple chunks of input — great for rewriting lists, titles, or notes.

### If/Then Prompt Logic  
Use simple conditions to dynamically decide how your GPT workflows respond to input.

### Smart Logic Flows  
Build complex decision trees with boolean operators, variable comparisons, and dynamic value connections — no coding required.

---

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm (comes with Node)

### Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/broq.git
cd broq

# 2. Install dependencies
npm install

# 3. Start the app
npm run dev
````

Visit `http://localhost:3000` and start building!

---

## Deployment

Deploy to your favorite platform (Vercel, Netlify, etc.):

1. Push to GitHub
2. Connect your repo to your hosting provider
3. Set your environment variables (if needed)
4. Share your Broq instance with the world

---

## Documentation

View full documentation & guides on [Notion](https://agreeable-idea-6f3.notion.site/Broq-Documentation-2142e0439528805da5cfdd912d41433d)

---

## Contributing

Broq is open-source and built to grow with the community.
We welcome:

* New blocks or logic types
* UI improvements
* Bug fixes
* Better docs or templates

### How to Contribute

```bash
# Fork + clone the repo, then
npm install
npm run dev
```

Start building or open a [good first issue](https://github.com/yourusername/broq/issues?q=is%3Aissue+label%3A%22good+first+issue%22)!

---

## Folder Structure

```bash
.
├── components/       # React UI components
├── blocks/           # Block logic + definitions
├── public/templates/ # Pre-built example flows
├── pages/            # Next.js route files
└── README.md         # You are here!
```

---

## Philosophy

LLMs are powerful — but code isn't always the right interface.

Broq lets people **think in blocks**, not syntax.
It's a tool for:

* Tinkerers and blocky thinkers
* Educators teaching AI
* Makers prototyping ideas
* Beginners learning LLMs

---

## Contact Me

Have ideas, feedback, or want to jam on AI tools together?

Reach out directly:

- [Twitter / X](https://twitter.com/OpemipoOduntan) — thoughts, demos, memes welcome
- [Email](mailto:opethepope@gmail.com) — if you have something to say, i wanna hear it
- [Join our Discord](https://discord.com/invite/py6tw3f28N) — for contributors & Broq builders

> I'm always excited to hear from developers, educators, and curious tinkerers.

---

## **Key Updates Made:**

### **Enhanced Features Section:**
- **Boolean Logic Blocks** – Added hexagonal comparison and logic operators
- **Variable System** – Highlighted the store/retrieve/connect capabilities  
- **Value Input Blocks** – Mentioned dynamic input connections

---

## License

[MIT](https://mit-license.org/) — free to use, fork, remix. 

> Built with ❤️ by [@bloomberg-sudo-dev](https://github.com/bloomberg-sudo-dev/).

* [Blockly](https://developers.google.com/blockly) – visual block engine
* OpenAI + Anthropic – for GPT & Claude APIs
* [Scratch](https://scratch.mit.edu) – for inspiring creativity with blocks
