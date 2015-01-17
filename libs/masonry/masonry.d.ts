/**
 * Created by christopher on 16/01/15.
 */
interface Masonry {
    (): JQuery;
    (options: any): JQuery;
}

interface JQuery {
    masonry: Masonry;
}