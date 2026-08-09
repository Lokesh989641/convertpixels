document.addEventListener("DOMContentLoaded", () => {

    if (document.querySelector(".footer")) {
        return;
    }

    const footer = document.createElement("footer");

    footer.className = "footer";

    footer.innerHTML = `
        <div class="footer-content">

            <div>
                <div class="logo">ConvertPixels</div>
                <p>Simple and free online image tools.</p>
            </div>

            <div class="footer-links">
                <a href="../about.html">About</a>
                <a href="../privacy.html">Privacy Policy</a>
                <a href="../terms.html">Terms of Service</a>
            </div>

        </div>

        <p class="copyright">
            © 2026 ConvertPixels. All rights reserved.
        </p>
    `;

    document.body.appendChild(footer);
});