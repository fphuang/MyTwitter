$(document).ready(()=> {
    loadFollowersOrFollowing(selectedTab);
});

function loadFollowersOrFollowing(selectedTab) {
    if (selectedTab == 'followers'){
        loadFollowers();
    }
    else {
        loadFollowing();
    }
}

function loadFollowers() {
     $.get(`/api/users/${profileUserId}/followers`, 
        (results, _status, _xhr) => {
        outputUsers(results.followers, $('.resultsContainer'));
    });
}

function loadFollowing() {
     $.get(`/api/users/${profileUserId}/following`, 
        (results, _status, _xhr) => {
        outputUsers(results.following, $('.resultsContainer'));
    });
}