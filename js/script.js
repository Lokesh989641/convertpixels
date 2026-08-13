document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".footer")) {
        return;
    }

    const footer = document.createElement("footer");
    footer.className = "footer";

    const content = document.createElement("div");
    content.className = "footer-content";

    const brand = document.createElement("div");

    const logo = document.createElement("div");
    logo.className = "logo";
    logo.textContent = "ConvertPixels";

    const description = document.createElement("p");
    description.textContent = "Simple and free online image tools.";

    brand.append(logo, description);

    const links = document.createElement("div");
    links.className = "footer-links";

    const isToolsPage = window.location.pathname.includes("/tools/");

    const about = document.createElement("a");
    about.href = isToolsPage ? "../about.html" : "about.html";
    about.textContent = "About";

    const privacy = document.createElement("a");
    privacy.href = isToolsPage ? "../privacy.html" : "privacy.html";
    privacy.textContent = "Privacy Policy";

    const terms = document.createElement("a");
    terms.href = isToolsPage ? "../terms.html" : "terms.html";
    terms.textContent = "Terms of Service";

    links.append(about, privacy, terms);
    content.append(brand, links);

    const copyright = document.createElement("p");
    copyright.className = "copyright";
    copyright.textContent = "© 2026 ConvertPixels. All rights reserved.";

    footer.append(content, copyright);
    document.body.appendChild(footer);
});