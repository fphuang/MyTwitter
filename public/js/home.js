$(document).ready(()=> {
    $.get('/api/posts', (results, _status, _xhr) => {
        outputPosts(results, $('.postsContainer'));
    });
}) 
