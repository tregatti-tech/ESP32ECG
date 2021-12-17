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
})();