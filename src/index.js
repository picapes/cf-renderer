// Copyright (c) 2026 PiCapes
// All rights reserved.

import puppeteer from "@cloudflare/puppeteer";

export default {
    async fetch(request, env) {

        if (request.method !== "POST") {
            return new Response("PiCapes Cloudflare Cape Renderer\nUsage: https://github.com/picapes/cf-renderer", {
                status: 405
            });
        }

        // to support both running on hosted worker and local running
        const workerOrigin = new URL(request.url).origin;

        const HTML = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">

        <style>
        html,body{
            margin:0;
            padding:0;
            overflow:hidden;
            background:transparent;
        }

        #final_canvas{
            width:1024px;
            height:1024px;
        }
        </style>

        <script src="${workerOrigin}/skinview3d.bundle.js"></script>

        </head>
        <body>

        <canvas id="final_canvas" width="1024" height="1024"></canvas>

        <script>
        window.renderReady = false;

        function waitLibrary() {
            if (typeof skinview3d === "undefined") {
                setTimeout(waitLibrary, 100);
                return;
            }

            window.renderReady = true;
        }

        waitLibrary();
        </script>

        </body>
        </html>
        `;

        const form = await request.formData();

        /*const skin = form.get("skin");*/
        const cape = form.get("cape");
        /*const background = form.get("background");*/

        /*const skinDataUrl = skin
            ? await fileToDataURL(skin)
            : null;*/

        const capeDataUrl = cape
            ? await fileToDataURL(cape)
            : null;

        /*const backgroundDataUrl = background
            ? await fileToDataURL(background)
            : null;*/

        // hardcoded disabled background and skin, only capes :)
        const backgroundDataUrl = null;
        const skinDataUrl = null;

        const browser = await puppeteer.launch(env.MYBROWSER);

        let page;

        try {

            page = await browser.newPage();

            await page.setViewport({
                width: 1024,
                height: 1024,
                deviceScaleFactor: 1
            });

            await page.setContent(HTML, {
                waitUntil: "domcontentloaded"
            });

            await page.waitForFunction(() => {
                return window.renderReady === true;
            });

            await page.evaluate(
                async (skinDataUrl, capeDataUrl, backgroundDataUrl) => {

                const finalCanvas =
                    document.getElementById("final_canvas");

                const ctx =
                    finalCanvas.getContext("2d");

                ctx.clearRect(
                    0,
                    0,
                    finalCanvas.width,
                    finalCanvas.height
                );

                const skinCanvas =
                    document.createElement("canvas");

                skinCanvas.width = 1024;
                skinCanvas.height = 1024;

                const viewer =
                    new skinview3d.SkinViewer({
                        canvas: skinCanvas,
                        width: 1024,
                        height: 1024,
                        preserveDrawingBuffer: true,
                        alpha: true
                    });

                if (viewer.renderer) {
                    viewer.renderer.setClearColor(
                        0x000000,
                        0
                    );
                }

                if (viewer.scene) {
                    viewer.scene.background = null;
                }

                viewer.fov = 35;
                viewer.zoom = 0.5;

                viewer.camera.rotation.set(
                    -3.025,
                    -0.5,
                    -3.05
                );

                viewer.camera.position.set(
                    -20,
                    10,
                    -30
                );

                viewer.playerObject.position.x += -1.5;
                viewer.playerObject.position.y += 0.98;

                if (skinDataUrl) {
                    await viewer.loadSkin(skinDataUrl);
                }

                if (capeDataUrl) {
                    await viewer.loadCape(capeDataUrl);
                }

                await new Promise(r => setTimeout(r, 300));

                viewer.render();

                await new Promise(r => setTimeout(r, 100));

                if (backgroundDataUrl) {

                    const bg = new Image();

                    bg.src = backgroundDataUrl;

                    await new Promise(resolve => {
                        bg.onload = resolve;
                        bg.onerror = resolve;
                    });

                    ctx.save();

                    ctx.shadowColor =
                        "rgba(0,0,0,0.5)";

                    ctx.shadowBlur = 15;
                    ctx.shadowOffsetX = 10;
                    ctx.shadowOffsetY = 10;

                    ctx.drawImage(
                        bg,
                        0,
                        0,
                        1024,
                        1024
                    );

                    ctx.restore();
                }

                ctx.drawImage(
                    skinCanvas,
                    0,
                    0,
                    1024,
                    1024
                );

            }, skinDataUrl, capeDataUrl, backgroundDataUrl);

            const image =
                await page.screenshot({
                    type: "png",
                    omitBackground: true,
                    clip: {
                        x: 0,
                        y: 0,
                        width: 1024,
                        height: 1024
                    }
                });

            return new Response(image, {
                headers: {
                    "Content-Type": "image/png"
                }
            });

        } catch (err) {

            return new Response(
                err.stack || String(err),
                {
                    status: 500
                }
            );

        } finally {

            if (page) {
                await page.close();
            }

            await browser.close();
        }
    }
};

async function fileToDataURL(file) {

    const buffer = await file.arrayBuffer();

    const bytes = new Uint8Array(buffer);

    let binary = "";

    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return `data:${file.type};base64,${btoa(binary)}`;
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}