

export default function saveRecording(data) {
    let bb = new Blob([JSON.stringify(data)], { type: 'text/json' });
    let a = document.createElement('a');
    a.download = `ECGRecording ${(new Date().toJSON().slice(0, 10).toString())}.json`;
    a.href = window.URL.createObjectURL(bb);
    a.textContent = 'Download ready';
    a.style='display:none';
    a.click();   
}