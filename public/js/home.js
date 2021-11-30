$(document).ready(()=> {
    $.get('/api/posts', {followingOnly: true}, (results, _status, _xhr) => {
        outputPosts(results, $('.postsContainer'));
    });
});
