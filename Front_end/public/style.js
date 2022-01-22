(() => {
    const recButton = document.getElementById('rec-button');
    recButton.classList.add('notRec');
    recButton.addEventListener('click', () => {
        if (recButton.classList.contains('notRec')) {
            recButton.classList.toggle('Rec');
        } else if (recButton.classList.contains('Rec')) {
            recButton.classList.toggle('notRec');
        }
    })

    const lowPassFilterButton = document.getElementById('low-pass-filter-icon');
    let lowPassFilterState = false;
    lowPassFilterButton.addEventListener('click', () => {
        lowPassFilterState = !lowPassFilterState;
        if (!lowPassFilterState) {
            lowPassFilterButton.style.color = 'green';
        } else {
            lowPassFilterButton.style.color = 'rgb(19, 231, 19)';
        }
    })
})();