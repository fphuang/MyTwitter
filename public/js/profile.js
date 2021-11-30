$(document).ready(()=> {
    if (selectedTab === 'replies') {
        loadReplies();
    }
    else {
        loadPosts();
    }
});

function loadPosts(selectedTab) {
     $.get('/api/posts', 
        {postedBy: profileUserId, pinned: true}, (results, _status, _xhr) => {
            outputPinnedPost(results, $('.pinnedPostContainer'));
    });

    $.get('/api/posts', 
        {postedBy: profileUserId, isReply: false}, (results, _status, _xhr) => {
            outputPosts(results, $('.postsContainer'));
    });
}

function loadReplies() {
    $.get('/api/posts', 
        {postedBy: profileUserId, isReply: true}, (results, _status, _xhr) => {
            outputPosts(results, $('.postsContainer'));
    });
}

function outputPinnedPost(results, container) {
    if (results.length == 0) {
        container.hide();
        return;
    }

    container.html('');

    results.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    });
}

