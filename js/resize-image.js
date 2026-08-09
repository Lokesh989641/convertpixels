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

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) return;

    selectedImage = file;

    const imageURL = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
        originalWidth = image.width;
        originalHeight = image.height;
        aspectRatio = originalWidth / originalHeight;

        widthInput.value = originalWidth;
        heightInput.value = originalHeight;

        preview.innerHTML = `
            <img src="${imageURL}" alt="Selected image">
            <p>${originalWidth} × ${originalHeight}px</p>
        `;

        resizeBtn.disabled = false;
        downloadBtn.style.display = "none";
    };

    image.src = imageURL;
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
    image.src = URL.createObjectURL(selectedImage);

    image.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.width = width;
        canvas.height = height;

        context.drawImage(
            image,
            0,
            0,
            width,
            height
        );

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);

            const extension =
                selectedImage.type === "image/png"
                    ? "png"
                    : "jpg";

            const name = selectedImage.name.replace(
                /\.[^/.]+$/,
                ""
            );

            downloadBtn.href = url;
            downloadBtn.download =
                `${name}-resized.${extension}`;

            downloadBtn.style.display = "inline-block";
        }, selectedImage.type);
    };
});