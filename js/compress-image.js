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

    if (!file) return;

    selectedImage = file;

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
    }

    previewURL = URL.createObjectURL(file);

    preview.replaceChildren();

    const img = document.createElement("img");
    img.src = previewURL;
    img.alt = "Selected image";

    const fileInfo = document.createElement("p");
    fileInfo.textContent = `${file.name} — ${formatBytes(file.size)}`;

    preview.append(img, fileInfo);

    result.replaceChildren();
    downloadBtn.style.display = "none";
    compressBtn.disabled = false;
});

compressBtn.addEventListener("click", () => {
    if (!selectedImage) return;

    const image = new Image();

    image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = image.width;
        canvas.height = image.height;

        context.drawImage(image, 0, 0);

        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                if (downloadURL) {
                    URL.revokeObjectURL(downloadURL);
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

                result.append(original, compressed, reductionText);
            },
            "image/jpeg",
            Number(quality.value) / 100
        );
    };

    image.src = URL.createObjectURL(selectedImage);
});

function formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";

    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));

    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
}