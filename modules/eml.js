const META = {
  convert(eml) {
    const { headers, body } = this._splitHeaderBody(eml);
    const parsedHeaders = this._parseHeaders(headers);

    const result = {
      from: this._decodeHeader(parsedHeaders["from"] || ""),
      to: this._decodeHeader(parsedHeaders["to"] || ""),
      subject: this._decodeHeader(parsedHeaders["subject"] || ""),
      date: parsedHeaders["date"] || "",
      text: "",
      html: "",
      attachments: []
    };

    this._parseEntity(parsedHeaders, body, result);
    return result;
  },
  _splitHeaderBody(raw) {
    const match = raw.match(/\r?\n\r?\n/);
    if (!match) return { headers: raw, body: "" };

    return {
      headers: raw.slice(0, match.index),
      body: raw.slice(match.index + match[0].length)
    };
  },
  _parseHeaders(headerText) {
    const headers = {};
    const lines = headerText.split(/\r?\n/);

    let current = null;
    for (let line of lines) {
      if (/^\s/.test(line) && current) {
        headers[current] += " " + line.trim();
      } else {
        const idx = line.indexOf(":");
        if (idx > -1) {
          current = line.slice(0, idx).toLowerCase();
          headers[current] = line.slice(idx + 1).trim();
        }
      }
    }
    return headers;
  },
  _parseEntity(headers, body, result) {
    const contentTypeRaw = headers["content-type"] || "text/plain";
    const encoding = (headers["content-transfer-encoding"] || "").toLowerCase();

    const { mime, charset, boundary } = this._parseContentType(contentTypeRaw);

    if (mime.startsWith("multipart/")) {
      if (!boundary) return;

      const parts = body
        .split("--" + boundary)
        .filter(p => p.trim() && !p.startsWith("--"));

      for (let part of parts) {
        const { headers: subH, body: subB } = this._splitHeaderBody(part);
        const parsedSubHeaders = this._parseHeaders(subH);
        this._parseEntity(parsedSubHeaders, subB, result);
      }
      return;
    }
    const decodedText = this._decodeBody(body, encoding, charset);
    if (mime === "text/plain") {
      result.text += decodedText;
    } else if (mime === "text/html") {
      result.html += decodedText;
    } else {
      const disposition = headers["content-disposition"] || "";
      if (disposition.includes("attachment")) {
        const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
        const filename = filenameMatch
          ? this._decodeHeader(filenameMatch[1])
          : "attachment";

        const blob = this._binaryToBlob(body, encoding, mime);

        result.attachments.push({
          filename,
          contentType: mime,
          size: blob.size,
          blob
        });
      }
    }
  },
  _parseContentType(raw) {
    const parts = raw.split(";");
    const mime = parts[0].trim().toLowerCase();

    let charset = "utf-8";
    let boundary = null;

    for (let p of parts.slice(1)) {
      const [k, v] = p.split("=");
      if (!v) continue;

      if (k.trim().toLowerCase() === "charset") {
        charset = v.replace(/"/g, "").trim().toLowerCase();
      }

      if (k.trim().toLowerCase() === "boundary") {
        boundary = v.replace(/"/g, "").trim();
      }
    }

    return { mime, charset, boundary };
  },
  _decodeBody(body, encoding, charset) {
    const bytes = this._decodeToBytes(body, encoding);

    try {
      return new TextDecoder(charset).decode(bytes);
    } catch {
      return new TextDecoder("utf-8").decode(bytes);
    }
  },
  _decodeToBytes(body, encoding) {
    if (encoding === "base64") {
      const binary = atob(body.replace(/\s/g, ""));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    }
    if (encoding === "quoted-printable") {
      const qp = body
        .replace(/=\r?\n/g, "")
        .replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
          String.fromCharCode(parseInt(hex, 16))
        );

      const bytes = new Uint8Array(qp.length);
      for (let i = 0; i < qp.length; i++) {
        bytes[i] = qp.charCodeAt(i);
      }
      return bytes;
    }

    const bytes = new Uint8Array(body.length);
    for (let i = 0; i < body.length; i++) {
      bytes[i] = body.charCodeAt(i);
    }
    return bytes;
  },

  _binaryToBlob(body, encoding, mime) {
    const bytes = this._decodeToBytes(body, encoding);
    return new Blob([bytes], { type: mime });
  },

  _decodeHeader(value) {
    return value.replace(
      /=\?([^?]+)\?([BQbq])\?([^?]+)\?=/g,
      (_, charset, encoding, text) => {

        let bytes;

        if (encoding.toUpperCase() === "B") {
          const binary = atob(text.replace(/\s/g, ""));
          bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
        }

        if (encoding.toUpperCase() === "Q") {
          const qp = text
            .replace(/_/g, " ")
            .replace(/=([A-Fa-f0-9]{2})/g, (_, hex) =>
              String.fromCharCode(parseInt(hex, 16))
            );

          bytes = new Uint8Array(qp.length);
          for (let i = 0; i < qp.length; i++) {
            bytes[i] = qp.charCodeAt(i);
          }
        }

        try {
          return new TextDecoder(charset).decode(bytes);
        } catch {
          return new TextDecoder("utf-8").decode(bytes);
        }
      }
    );
  }
}

export default {
  convert(source){
    return META.convert(source)
  }
}

export const EML = {
  convert(source){
    return META.convert(source)
  }
}