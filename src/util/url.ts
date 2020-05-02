export default class URLUtil {
    /**
     * Change the Query Params of the current URL.
     * Will not reload the page.
     *
     * @param searchString The query parameters
     */
    public static changeQueryString(searchString: URLSearchParams): void {
        const urlSplit = (window.location.href).split("?");
        const obj = {
            Title: document.title,
            Url: urlSplit[0] + '?' + searchString.toString()
        };

        history.pushState(obj, obj.Title, obj.Url);
    }
}