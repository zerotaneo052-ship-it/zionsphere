/**
 * PayMongo QR Ph (scannable in GCash). Public key is meant for the page.
 * Secret key is required to create a Payment Intent; keep this file private.
 */
(function () {
  "use strict";

  const PUBLIC_KEY = "pk_live_EM1wbz2PiLGeZb4RDuxWgBYq";
  const SECRET_KEY = "sk_live_ACHoWnk68HiCHwEN3qaBPq7C";

  window.PAYMONGO_PUBLIC_KEY = PUBLIC_KEY;

  function auth(key) {
    return "Basic " + btoa(key + ":");
  }

  function errorMessage(json, fallback) {
    if (json && json.errors && json.errors.length) {
      return json.errors.map(function (e) { return e.detail; }).join("; ");
    }
    return fallback;
  }

  async function paymongo(path, key, method, attributes) {
    const opts = {
      method: method,
      headers: {
        Accept: "application/json",
        Authorization: auth(key),
      },
    };
    if (method !== "GET") {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify({ data: { attributes: attributes || {} } });
    }
    const res = await fetch("https://api.paymongo.com/v1" + path, opts);
    const json = await res.json().catch(function () { return {}; });
    if (!res.ok) {
      throw new Error(errorMessage(json, "PayMongo request failed"));
    }
    return json.data;
  }

  function qrSrc(imageUrl) {
    if (!imageUrl) return "";
    if (imageUrl.indexOf("data:") === 0 || imageUrl.indexOf("http") === 0) return imageUrl;
    return "data:image/png;base64," + imageUrl;
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var img = new Image();
      if (src.indexOf("data:") !== 0) img.crossOrigin = "anonymous";
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
  }

  /* Upscale + white quiet zone so GCash can lock onto the finder patterns. */
  async function toScanFriendlyQr(imageUrl) {
    if (!imageUrl) return "";
    try {
      var img = await loadImage(imageUrl);
      var srcW = img.naturalWidth || img.width || 256;
      var srcH = img.naturalHeight || img.height || 256;
      var inner = Math.max(srcW, srcH, 420);
      var pad = Math.round(inner * 0.12);
      var canvas = document.createElement("canvas");
      canvas.width = inner + pad * 2;
      canvas.height = inner + pad * 2;
      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, pad, pad, inner, inner);
      return canvas.toDataURL("image/png");
    } catch (e) {
      return imageUrl;
    }
  }

  function extractQrImage(attached) {
    var attrs = (attached && attached.attributes) || {};
    var next = attrs.next_action || attrs.nextAction || {};
    var code = next.code || next.qr_code || next.qrph || {};
    return qrSrc(
      code.image_url ||
      code.imageUrl ||
      next.image_url ||
      next.imageUrl ||
      ""
    );
  }

  window.PaymongoGcash = {
    async startCheckout(order) {
      var centavos = Math.round(Number(order.amount) * 100);
      if (centavos < 100) throw new Error("Amount must be at least ₱1.00");

      var intent = await paymongo("/payment_intents", SECRET_KEY, "POST", {
        amount: centavos,
        currency: "PHP",
        payment_method_allowed: ["qrph"],
        capture_type: "automatic",
        description: "Nike Basketball order",
      });

      var method = await paymongo("/payment_methods", PUBLIC_KEY, "POST", {
        type: "qrph",
      });

      var attached = await paymongo(
        "/payment_intents/" + intent.id + "/attach",
        PUBLIC_KEY,
        "POST",
        {
          payment_method: method.id,
          client_key: intent.attributes.client_key,
        }
      );

      var imageUrl = extractQrImage(attached);
      if (!imageUrl) {
        throw new Error("PayMongo did not return a QR code. Enable QR Ph in your PayMongo dashboard.");
      }

      return {
        qrImageUrl: await toScanFriendlyQr(imageUrl),
        paymentIntentId: attached.id,
        clientKey: intent.attributes.client_key,
        status: attached.attributes.status,
      };
    },

    async getStatus(id, clientKey) {
      var path = "/payment_intents/" + encodeURIComponent(id);
      if (clientKey) path += "?client_key=" + encodeURIComponent(clientKey);
      var data = await paymongo(path, clientKey ? PUBLIC_KEY : SECRET_KEY, "GET");
      return { id: data.id, status: data.attributes.status };
    },
  };
})();
