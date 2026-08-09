const imageInput = document.getElementById("imageInput");
const quality = document.getElementById("quality");
const qualityValue = document.getElementById("qualityValue");
const compressBtn = document.getElementById("compressBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");
const result = document.getElementById("result");

let selectedImage = null;

quality.addEventListener("input", () => {
    qualityValue.textContent = `${quality.value}%`;
});

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) return;

    selectedImage = file;

    const imageURL = URL.createObjectURL(file);

    preview.innerHTML = `
        <img src="${imageURL}" alt="Selected image">
        <p>${file.name} — ${formatBytes(file.size)}</p>
    `;

    result.innerHTML = "";
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

                const downloadURL = URL.createObjectURL(blob);

                const extension = selectedImage.type === "image/png"
                    ? "jpg"
                    : "jpg";

                const originalName = selectedImage.name
                    .replace(/\.[^/.]+$/, "");

                downloadBtn.href = downloadURL;
                downloadBtn.download = `${originalName}-compressed.${extension}`;
                downloadBtn.style.display = "inline-block";

                const reduction = Math.max(
                    0,
                    ((selectedImage.size - blob.size) / selectedImage.size) * 100
                );

                result.innerHTML = `
                    <p>
                        Original: ${formatBytes(selectedImage.size)}
                    </p>
                    <p>
                        Compressed: ${formatBytes(blob.size)}
                    </p>
                    <p>
                        Size reduction: ${reduction.toFixed(1)}%
                    </p>
                `;
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