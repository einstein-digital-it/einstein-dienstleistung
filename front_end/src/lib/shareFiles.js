const MIME_TYPES = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  txt: "text/plain",
};

function saveFile(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * Opens the device's share menu (phones and some desktops). Where the browser
 * cannot share these files, they are downloaded so the customer can send them on.
 * @param {{blob: Blob, name: string}[]} items
 * @returns {Promise<"shared"|"cancelled"|"downloaded">}
 */
export async function shareFiles(items, title) {
  const files = items.map(({ blob, name }) => {
    const type = MIME_TYPES[name.split(".").pop().toLowerCase()] || blob.type || "application/octet-stream";
    return new File([blob], name, { type });
  });

  if (navigator.canShare?.({ files })) {
    try {
      await navigator.share({ files, title });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
      // e.g. the browser no longer counts this as a tap after the download: fall through
    }
  }

  for (const file of files) {
    saveFile(file);
    // Browsers drop downloads that start at the same moment
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  return "downloaded";
}
