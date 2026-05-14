# PiCapes Capes Renderer

cape renderer on Cloudflare Workers using Browser Rendering

uses:

* Cloudflare [Workers](https://developers.cloudflare.com/workers/) & [Browser Run](https://developers.cloudflare.com/browser-run/)
* [skinview3d](https://github.com/bs-community/skinview3d)

## Running it locally
You can run this directly by deploying it into [Cloudflare Workers](https://workers.cloudflare.com/) but if you want to run it locally, you can do so by cloning the repo and in the root of the project use these commands.
### Linux
```bash
npm install
mkdir public
cp -f node_modules/skinview3d/bundles/skinview3d.bundle.js public/
npx wrangler dev
```

### Windows
```bash
npm install 
mkdir public 
copy /Y node_modules\skinview3d\bundles\skinview3d.bundle.js public\ 
npx wrangler dev
```

## How to render capes?

### Request
You can send a POST request to the worker with the cape file in the form data with the key `cape` and it will return you the rendered image. You can use [this python script](/_render/render.py) to send a request and look how it works.

Replace the `<your workers url>` with the url of your worker (can be hosted in cloudflare workers or locally running on your machine).

Request example:
```bash
curl -X POST <your workers url> ^
  -F "cape=@cape.png" ^
  --output out.png
```

The server will return the rendered image in the response that is a **png file** of the rendered cape.

---
<i>~ by PiCapes - Minecraft Capes for all.</i>


