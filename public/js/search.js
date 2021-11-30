var timer = undefined;

$('#searchBox').keydown(event => {
    clearTimeout(timer);
    var textbox = $(event.target);
    var value = textbox.val();
    const data = textbox.data();
    var searchType = textbox.data().search;

    timer = setTimeout(() => {
        value = textbox.val().trim();
        if (value.length === 0) {
            $('.resultsContainer').html('');
        }
        else {
            search(value, searchType);
        }
    }, 0);
});

function search(searchTerm, searchType) {
    const url = searchType === 'users' ? `/api/users` : `/api/posts`;
    $.get(url, {search: searchTerm}, (results) => {
        if (searchType === 'users') {
            outputUsers(results, $('.resultsContainer'));
        }
        else {
            outputPosts(results, $('.resultsContainer'));
        }
    });
}