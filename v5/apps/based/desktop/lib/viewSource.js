export default async function viewSource (url = 'https://raw.githubusercontent.com/Marak/buddypond/refs/heads/master/index.html') {
    // fetch the content as text
    const response = await fetch(url);
    const content = await response.text();
    let win = await this.bp.open('editor-monaco', {
        content: content
    });
    console.log('viewSource', win);
    win.maximize();
}