const imageInput = document.getElementById("imageInput");
const convertBtn = document.getElementById("convertBtn");
const downloadBtn = document.getElementById("downloadBtn");
const preview = document.getElementById("preview");

let selectedImages = [];
let previewURLs = [];
let downloadURL = null;

imageInput.addEventListener("change", () => {
    // Clean up old preview URLs
    previewURLs.forEach((url) => {
        URL.revokeObjectURL(url);
    });

    previewURLs = [];
    selectedImages = Array.from(imageInput.files);

    preview.replaceChildren();

    // Hide previous download
    downloadBtn.style.display = "none";
    downloadBtn.removeAttribute("href");

    if (downloadURL) {
        URL.revokeObjectURL(downloadURL);
        downloadURL = null;
    }

    // No files selected
    if (selectedImages.length === 0) {
        convertBtn.disabled = true;
        return;
    }

    // Show previews
    selectedImages.forEach((file) => {
        const imageURL = URL.createObjectURL(file);
        previewURLs.push(imageURL);

        const container = document.createElement("div");

        const image = document.createElement("img");
        image.src = imageURL;
        image.alt = file.name;

        const fileName = document.createElement("p");
        fileName.textContent = file.name;

        container.append(image, fileName);
        preview.appendChild(container);
    });

    convertBtn.disabled = false;
});

convertBtn.addEventListener("click", async () => {
    if (selectedImages.length === 0) {
        return;
    }

    // Make sure jsPDF loaded correctly
    if (!window.jspdf || !window.jspdf.jsPDF) {
        alert(
            "PDF library could not be loaded. " +
            "Please refresh the page and try again."
        );
        return;
    }

    convertBtn.disabled = true;
    convertBtn.textContent = "Creating PDF...";

    try {
        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4"
        });

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 10;

        const maxWidth = pageWidth - margin * 2;
        const maxHeight = pageHeight - margin * 2;

        let addedImages = 0;

        for (const file of selectedImages) {
            if (!file.type.startsWith("image/")) {
                continue;
            }

            const imageURL = URL.createObjectURL(file);

            try {
                const image = await loadImage(imageURL);

                if (image.width === 0 || image.height === 0) {
                    continue;
                }

                let width = image.width;
                let height = image.height;

                // Scale image to fit inside A4 page
                const scale = Math.min(
                    maxWidth / width,
                    maxHeight / height
                );

                width *= scale;
                height *= scale;

                // Center image on page
                const x = (pageWidth - width) / 2;
                const y = (pageHeight - height) / 2;

                // Add a new page only after the first valid image
                if (addedImages > 0) {
                    pdf.addPage();
                }

                const format =
                    file.type === "image/png"
                        ? "PNG"
                        : "JPEG";

                pdf.addImage(
                    image,
                    format,
                    x,
                    y,
                    width,
                    height
                );

                addedImages++;

            } finally {
                URL.revokeObjectURL(imageURL);
            }
        }

        // Don't create an empty PDF
        if (addedImages === 0) {
            throw new Error("No valid images could be added to the PDF.");
        }

        const pdfBlob = pdf.output("blob");

        if (downloadURL) {
            URL.revokeObjectURL(downloadURL);
        }

        downloadURL = URL.createObjectURL(pdfBlob);

        downloadBtn.href = downloadURL;
        downloadBtn.download = "convertpixels-images.pdf";
        downloadBtn.style.display = "inline-block";

    } catch (error) {
        console.error("PDF conversion failed:", error);

        alert(
            "Something went wrong while creating the PDF. " +
            "Please try another image."
        );

    } finally {
        convertBtn.disabled = false;
        convertBtn.textContent = "Convert to PDF";
    }
});

function loadImage(url) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            resolve(image);
        };

        image.onerror = () => {
            reject(new Error("Unable to load image."));
        };

        image.src = url;
    });
}

// Clean up URLs when leaving the page
window.addEventListener("beforeunload", () => {
    previewURLs.forEach((url) => {
        URL.revokeObjectURL(url);
    });

    if (downloadURL) {
        URL.revokeObjectURL(downloadURL);
    }
});