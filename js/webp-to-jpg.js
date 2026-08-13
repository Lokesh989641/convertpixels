const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");

let selectedImage = null;
let previewURL = null;
let downloadURL = null;

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    selectedImage = file;

    // Clean up old preview URL
    if (previewURL) {
        URL.revokeObjectURL(previewURL);
    }

    // Clean up previous download
    if (downloadURL) {
        URL.revokeObjectURL(downloadURL);
        downloadURL = null;
    }

    previewURL = URL.createObjectURL(file);

    preview.replaceChildren();

    const image = document.createElement("img");
    image.src = previewURL;
    image.alt = "Selected WebP image";

    const fileInfo = document.createElement("p");
    fileInfo.textContent = file.name;

    preview.append(image, fileInfo);

    convertBtn.disabled = false;
    downloadBtn.style.display = "none";
    downloadBtn.removeAttribute("href");
});

convertBtn.addEventListener("click", () => {
    if (!selectedImage) {
        return;
    }

    convertBtn.disabled = true;
    convertBtn.textContent = "Converting...";

    const image = new Image();
    const imageURL = URL.createObjectURL(selectedImage);

    image.onload = () => {
        URL.revokeObjectURL(imageURL);

        const canvas = document.createElement("canvas");

        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext("2d");

        if (!context) {
            convertBtn.disabled = false;
            convertBtn.textContent = "Convert to JPG";
            return;
        }

        // JPG does not support transparency.
        // Use a white background for transparent WebP images.
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.drawImage(image, 0, 0);

        canvas.toBlob(
            (blob) => {
                convertBtn.disabled = false;
                convertBtn.textContent = "Convert to JPG";

                if (!blob) {
                    return;
                }

                if (downloadURL) {
                    URL.revokeObjectURL(downloadURL);
                }

                downloadURL = URL.createObjectURL(blob);

                const name = selectedImage.name.replace(
                    /\.webp$/i,
                    ""
                );

                downloadBtn.href = downloadURL;
                downloadBtn.download = `${name}.jpg`;
                downloadBtn.style.display = "inline-block";
            },
            "image/jpeg",
            0.92
        );
    };

    image.onerror = () => {
        URL.revokeObjectURL(imageURL);

        convertBtn.disabled = false;
        convertBtn.textContent = "Convert to JPG";
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