// Toggle view section on offline mode activation and file loaded

export default function toggleViewSection() {
    const poincareViewTemplate = document.querySelector('#poincare-view-template');
    const changeViewElement = document.querySelector('#change-view-dropdown');

    const poincareView = poincareViewTemplate.content.cloneNode(true);
    changeViewElement.appendChild(poincareView);
};