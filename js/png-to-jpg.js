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
        selectedImage = null;
        convertBtn.disabled = true;
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

    previewURL = URL.createObjectURL(file);

    preview.replaceChildren();

    downloadBtn.style.display = "none";
    downloadBtn.removeAttribute("href");

    const image = document.createElement("img");
    image.src = previewURL;
    image.alt = "Selected PNG image";

    const fileInfo = document.createElement("p");
    fileInfo.textContent = file.name;

    preview.append(image, fileInfo);

    convertBtn.disabled = false;
});

convertBtn.addEventListener("click", () => {
    if (!selectedImage) return;

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
            alert("Unable to process this image.");
            return;
        }

        // JPG does not support transparency.
        // Use a white background for transparent PNG areas.
        context.fillStyle = "#ffffff";
        context.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        context.drawImage(image, 0, 0);

        canvas.toBlob(
            (blob) => {
                convertBtn.disabled = false;
                convertBtn.textContent = "Convert to JPG";

                if (!blob) {
                    alert("Unable to convert this image to JPG.");
                    return;
                }

                // Clean up previous download URL
                if (downloadURL) {
                    URL.revokeObjectURL(downloadURL);
                }

                downloadURL = URL.createObjectURL(blob);

                const originalName = selectedImage.name
                    .replace(/\.[^/.]+$/, "");

                downloadBtn.href = downloadURL;
                downloadBtn.download = `${originalName}.jpg`;
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

        alert("Unable to load this PNG image.");
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