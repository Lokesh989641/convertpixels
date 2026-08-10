const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");

let selectedImage = null;
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

    preview.replaceChildren();

    const image = document.createElement("img");
    image.src = previewURL;
    image.alt = "Selected JPG image";

    const fileInfo = document.createElement("p");
    fileInfo.textContent = file.name;

    preview.append(image, fileInfo);

    convertBtn.disabled = false;
    downloadBtn.style.display = "none";
});

convertBtn.addEventListener("click", () => {
    if (!selectedImage) return;

    const image = new Image();
    const imageURL = URL.createObjectURL(selectedImage);

    image.onload = () => {
        URL.revokeObjectURL(imageURL);

        const canvas = document.createElement("canvas");

        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext("2d");

        if (!context) return;

        context.drawImage(image, 0, 0);

        canvas.toBlob((blob) => {
            if (!blob) return;

            if (downloadURL) {
                URL.revokeObjectURL(downloadURL);
            }

            downloadURL = URL.createObjectURL(blob);

            downloadBtn.href = downloadURL;
            downloadBtn.download = selectedImage.name.replace(
                /\.jpe?g$/i,
                ".png"
            );

            downloadBtn.style.display = "inline-block";
        }, "image/png");
    };

    image.onerror = () => {
        URL.revokeObjectURL(imageURL);
    };

    image.src = imageURL;
});