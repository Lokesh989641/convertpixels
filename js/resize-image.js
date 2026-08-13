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

    if (!file) {
        selectedImage = null;
        resizeBtn.disabled = true;
        return;
    }

    selectedImage = file;

    // Clean up previous preview URL
    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

    // Clean up previous download URL
    if (downloadURL) {
        URL.revokeObjectURL(downloadURL);
        downloadURL = null;
    }

    resizeBtn.disabled = true;
    downloadBtn.style.display = "none";
    downloadBtn.removeAttribute("href");

    previewURL = URL.createObjectURL(file);

    const image = new Image();

    image.onload = () => {
        originalWidth = image.width;
        originalHeight = image.height;

        if (originalWidth < 1 || originalHeight < 1) {
            alert("Unable to determine image dimensions.");
            return;
        }

        aspectRatio = originalWidth / originalHeight;

        widthInput.value = originalWidth;
        heightInput.value = originalHeight;

        preview.replaceChildren();

        const previewImage = document.createElement("img");
        previewImage.src = previewURL;
        previewImage.alt = "Selected image";

        const dimensions = document.createElement("p");
        dimensions.textContent =
            `${originalWidth} × ${originalHeight}px`;

        preview.append(previewImage, dimensions);

        resizeBtn.disabled = false;
    };

    image.onerror = () => {
        if (previewURL) {
            URL.revokeObjectURL(previewURL);
            previewURL = null;
        }

        selectedImage = null;
        resizeBtn.disabled = true;

        alert("Unable to load this image.");
    };

    image.src = previewURL;
});

widthInput.addEventListener("input", () => {
    if (!lockRatio.checked) return;

    const width = Number(widthInput.value);

    if (width > 0 && aspectRatio > 0) {
        heightInput.value = Math.max(
            1,
            Math.round(width / aspectRatio)
        );
    }
});

heightInput.addEventListener("input", () => {
    if (!lockRatio.checked) return;

    const height = Number(heightInput.value);

    if (height > 0 && aspectRatio > 0) {
        widthInput.value = Math.max(
            1,
            Math.round(height * aspectRatio)
        );
    }
});

resizeBtn.addEventListener("click", () => {
    if (!selectedImage) return;

    const width = Number(widthInput.value);
    const height = Number(heightInput.value);

    if (
        !Number.isFinite(width) ||
        !Number.isFinite(height) ||
        width < 1 ||
        height < 1
    ) {
        alert("Please enter valid width and height values.");
        return;
    }

    if (!Number.isInteger(width) || !Number.isInteger(height)) {
        alert("Width and height must be whole numbers.");
        return;
    }

    resizeBtn.disabled = true;
    resizeBtn.textContent = "Resizing...";

    const image = new Image();
    const imageURL = URL.createObjectURL(selectedImage);

    image.onload = () => {
        URL.revokeObjectURL(imageURL);

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            resizeBtn.disabled = false;
            resizeBtn.textContent = "Resize Image";
            alert("Unable to process this image.");
            return;
        }

        canvas.width = width;
        canvas.height = height;

        context.drawImage(
            image,
            0,
            0,
            width,
            height
        );

        const outputType =
            selectedImage.type === "image/png"
                ? "image/png"
                : "image/jpeg";

        canvas.toBlob(
            (blob) => {
                resizeBtn.disabled = false;
                resizeBtn.textContent = "Resize Image";

                if (!blob) {
                    alert("Unable to create the resized image.");
                    return;
                }

                if (downloadURL) {
                    URL.revokeObjectURL(downloadURL);
                }

                downloadURL = URL.createObjectURL(blob);

                const extension =
                    outputType === "image/png"
                        ? "png"
                        : "jpg";

                const name = selectedImage.name
                    .replace(/\.[^/.]+$/, "");

                downloadBtn.href = downloadURL;
                downloadBtn.download =
                    `${name}-resized.${extension}`;

                downloadBtn.style.display = "inline-block";
            },
            outputType,
            0.92
        );
    };

    image.onerror = () => {
        URL.revokeObjectURL(imageURL);

        resizeBtn.disabled = false;
        resizeBtn.textContent = "Resize Image";

        alert("Unable to load this image.");
    };

    image.src = imageURL;
});

// Clean up object URLs when leaving the page
window.addEventListener("beforeunload", () => {
    if (previewURL) {
        URL.revokeObjectURL(previewURL);
    }

    if (downloadURL) {
        URL.revokeObjectURL(downloadURL);
    }
});