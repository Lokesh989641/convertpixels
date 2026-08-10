const imageInput = document.getElementById("imageInput");
const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const lockRatio = document.getElementById("lockRatio");
const resizeBtn = document.getElementById("resizeBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");

let selectedImage = null;
let originalWidth = 0;
let originalHeight = 0;
let aspectRatio = 1;
let previewURL = null;
let downloadURL = null;

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) return;

    selectedImage = file;

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
    }

    previewURL = URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
        originalWidth = image.width;
        originalHeight = image.height;
        aspectRatio = originalWidth / originalHeight;

        widthInput.value = originalWidth;
        heightInput.value = originalHeight;

        preview.replaceChildren();

        const previewImage = document.createElement("img");
        previewImage.src = previewURL;
        previewImage.alt = "Selected image";

        const dimensions = document.createElement("p");
        dimensions.textContent = `${originalWidth} × ${originalHeight}px`;

        preview.append(previewImage, dimensions);

        resizeBtn.disabled = false;
        downloadBtn.style.display = "none";
    };

    image.onerror = () => {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    };

    image.src = previewURL;
});

widthInput.addEventListener("input", () => {
    if (lockRatio.checked && widthInput.value) {
        heightInput.value = Math.round(
            Number(widthInput.value) / aspectRatio
        );
    }
});

heightInput.addEventListener("input", () => {
    if (lockRatio.checked && heightInput.value) {
        widthInput.value = Math.round(
            Number(heightInput.value) * aspectRatio
        );
    }
});

resizeBtn.addEventListener("click", () => {
    if (!selectedImage) return;

    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    if (width < 1 || height < 1) return;

    const image = new Image();
    const imageURL = URL.createObjectURL(selectedImage);

    image.onload = () => {
        URL.revokeObjectURL(imageURL);

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) return;

        canvas.width = width;
        canvas.height = height;

        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob((blob) => {
            if (!blob) return;

            if (downloadURL) {
                URL.revokeObjectURL(downloadURL);
            }

            downloadURL = URL.createObjectURL(blob);

            const extension =
                selectedImage.type === "image/png"
                    ? "png"
                    : "jpg";

            const name = selectedImage.name.replace(
                /\.[^/.]+$/,
                ""
            );

            downloadBtn.href = downloadURL;
            downloadBtn.download =
                `${name}-resized.${extension}`;

            downloadBtn.style.display = "inline-block";
        }, selectedImage.type);
    };

    image.onerror = () => {
        URL.revokeObjectURL(imageURL);
    };

    image.src = imageURL;
});