export function changeQueryString(searchString, documentTitle) {
    documentTitle = typeof documentTitle !== 'undefined' ? documentTitle : document.title;
    const urlSplit = (window.location.href).split("?");
    const obj = {
        Title: documentTitle,
        Url: urlSplit[0] + '?' + searchString
    };

    history.pushState(obj, obj.Title, obj.Url);
}