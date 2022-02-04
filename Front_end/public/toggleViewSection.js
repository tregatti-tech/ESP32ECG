// Toggle view section on offline mode activation and file loaded

export default function toggleViewSection() {
    const extraInfoElement = document.querySelector('#extra-info');
    const viewSectionTemplate = document.querySelector('#view-section-template');

    const viewSection = viewSectionTemplate.content.cloneNode(true);
    extraInfoElement.appendChild(viewSection);
};