const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");

let selectedImage = null;

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (!file) return;

    selectedImage = file;

    const imageURL = URL.createObjectURL(file);

    preview.innerHTML = `
        <img src="${imageURL}" alt="Selected WebP image">
        <p>${file.name}</p>
    `;

    convertBtn.disabled = false;
    downloadBtn.style.display = "none";
});

convertBtn.addEventListener("click", () => {
    if (!selectedImage) return;

    const image = new Image();
    image.src = URL.createObjectURL(selectedImage);

    image.onload = () => {
        const canvas = document.createElement("canvas");

        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext("2d");

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.drawImage(image, 0, 0);

        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);

            const name = selectedImage.name.replace(
                /\.webp$/i,
                ""
            );

            downloadBtn.href = url;
            downloadBtn.download = `${name}.jpg`;
            downloadBtn.style.display = "inline-block";
        }, "image/jpeg", 0.92);
    };
});