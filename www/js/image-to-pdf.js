const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");

let selectedImages = [];

imageInput.addEventListener("change", () => {
    selectedImages = Array.from(imageInput.files);

    if (selectedImages.length === 0) {
        convertBtn.disabled = true;
        preview.innerHTML = "";
        return;
    }

    preview.innerHTML = "";

    selectedImages.forEach((file) => {
        const imageURL = URL.createObjectURL(file);

        const image = document.createElement("img");
        image.src = imageURL;
        image.alt = file.name;

        preview.appendChild(image);
    });

    convertBtn.disabled = false;
    downloadBtn.style.display = "none";
});

convertBtn.addEventListener("click", async () => {
    if (selectedImages.length === 0) return;

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
    });

    for (let i = 0; i < selectedImages.length; i++) {
        const file = selectedImages[i];

        const imageURL = URL.createObjectURL(file);

        const image = await loadImage(imageURL);

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 10;

        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;

        let width = image.width;
        let height = image.height;

        const scale = Math.min(
            maxWidth / width,
            maxHeight / height
        );

        width *= scale;
        height *= scale;

        const x = (pageWidth - width) / 2;
        const y = (pageHeight - height) / 2;

        if (i > 0) {
            pdf.addPage();
        }

        const format = file.type === "image/png" ? "PNG" : "JPEG";

        pdf.addImage(
            image,
            format,
            x,
            y,
            width,
            height
        );

        URL.revokeObjectURL(imageURL);
    }

    const pdfBlob = pdf.output("blob");
    const downloadURL = URL.createObjectURL(pdfBlob);

    downloadBtn.href = downloadURL;
    downloadBtn.download = "convertpixels-images.pdf";
    downloadBtn.style.display = "inline-block";
});

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = reject;

        image.src = url;
    });
}