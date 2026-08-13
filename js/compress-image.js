const imageInput = document.getElementById("imageInput");
const quality = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");
const compressBtn = document.getElementById("compressBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");
const result = document.getElementById("result");

let selectedImage = null;
let previewURL = null;
let downloadURL = null;

quality.addEventListener("input", () => {
    qualityValue.textContent = `${quality.value}%`;
});

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) {
        selectedImage = null;
        compressBtn.disabled = true;
        return;
    }

    selectedImage = file;

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

    if (downloadURL) {
        URL.revokeObjectURL(downloadURL);
        downloadURL = null;
    }

    previewURL = URL.createObjectURL(file);

    preview.replaceChildren();
    result.replaceChildren();

    downloadBtn.style.display = "none";
    downloadBtn.removeAttribute("href");

    const img = document.createElement("img");
    img.src = previewURL;
    img.alt = "Selected image";

    const fileInfo = document.createElement("p");
    fileInfo.textContent = `${file.name} — ${formatBytes(file.size)}`;

    preview.append(img, fileInfo);

    compressBtn.disabled = false;
});

compressBtn.addEventListener("click", () => {
    if (!selectedImage) return;

    compressBtn.disabled = true;

    if (downloadURL) {
        URL.revokeObjectURL(downloadURL);
        downloadURL = null;
    }

    downloadBtn.style.display = "none";
    downloadBtn.removeAttribute("href");

    const image = new Image();
    const imageURL = URL.createObjectURL(selectedImage);

    image.onload = () => {
        URL.revokeObjectURL(imageURL);

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            compressBtn.disabled = false;
            result.textContent = "Unable to process this image.";
            return;
        }

        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0);

        canvas.toBlob(
            (blob) => {
                compressBtn.disabled = false;

                if (!blob) {
                    result.textContent = "Unable to compress this image.";
                    return;
                }

                downloadURL = URL.createObjectURL(blob);

                const originalName = selectedImage.name
                    .replace(/\.[^/.]+$/, "");

                downloadBtn.href = downloadURL;
                downloadBtn.download = `${originalName}-compressed.jpg`;
                downloadBtn.style.display = "inline-block";

                const reduction = Math.max(
                    0,
                    ((selectedImage.size - blob.size) / selectedImage.size) * 100
                );

                result.replaceChildren();

                const original = document.createElement("p");
                original.textContent =
                    `Original: ${formatBytes(selectedImage.size)}`;

                const compressed = document.createElement("p");
                compressed.textContent =
                    `Compressed: ${formatBytes(blob.size)}`;

                const reductionText = document.createElement("p");
                reductionText.textContent =
                    `Size reduction: ${reduction.toFixed(1)}%`;

                result.append(
                    original,
                    compressed,
                    reductionText
                );
            },
            "image/jpeg",
            Number(quality.value) / 100
        );
    };

    image.onerror = () => {
        URL.revokeObjectURL(imageURL);
        compressBtn.disabled = false;
        result.textContent = "Unable to load this image.";
    };

    image.src = imageURL;
});

function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";

    const units = ["Bytes", "KB", "MB", "GB", "TB"];

    const index = Math.min(
        Math.floor(Math.log(bytes) / Math.log(1024)),
        units.length - 1
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}