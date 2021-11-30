var cropper;
var timer;
var selectedUsers = [];

$('#postTextarea, #replyTextarea').keyup(event => {
    var textbox = $(event.target);
    var value = textbox.val().trim();

    var isModal = textbox.parents(".modal").length === 1;

    var submitButton = isModal ? $('#submitReplyButton') : $('#submitPostButton');

    if (submitButton.length !== 0) {
        submitButton.prop('disabled', value === "");
    }
});

$('#submitPostButton, #submitReplyButton').click((event) => {
    var button = $(event.target);
    var isModal = button.parents(".modal").length === 1;
    var textbox = isModal ? $('#replyTextarea') : $('#postTextarea');

    var data = {
        content: textbox.val(),
    };

    if (isModal) {
        var id = button.data().id;
        if (!id) {
            console.error('Button id is null');
        }
        data.replyTo = id;
    }

    $.post('/api/posts', data, (postData, _status, _xhr) => {

        if (postData.replyTo) {
            location.reload();
        }
        else {
            var html = createPostHtml(postData);
            $('.postsContainer').prepend(html);
            textbox.val('');
            button.prop('disabled', true);
        }


    });
});

$('#replyModal').on('show.bs.modal', event => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $('#submitReplyButton').data('id', postId);

    $.get('/api/posts/' + postId, results => {
        outputPosts(results.postData, $('#originalPostContainer'))
    });
});

$('#deletePostModal').on('show.bs.modal', event => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $('#deletePostButton').data('id', postId);
});

//we cannot attach the click on the document
$('#deletePostButton').click((event) => {
    const postId = $(event.target).data('id');
    $.ajax({
        url: '/api/posts/' + postId,
        type: 'DELETE',
        success: (data, status, xhr) => {
            if (xhr.status != 202) {
                alert('could not delete post');
                return;
            }
            location.reload();
        }
    });
});

$('#confirmPinModal').on('show.bs.modal', event => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $('#pinPostButton').data('id', postId);
});

//we cannot attach the click on the document
$('#pinPostButton').click((event) => {
    const postId = $(event.target).data('id');
    $.ajax({
        url: `/api/posts/${postId}`,
        type: 'PUT',
        data: {pinned: true},
        success: () => {
            location.reload();
        }
    });
});

$('#unpinModal').on('show.bs.modal', event => {
    var button = $(event.relatedTarget);
    var postId = getPostIdFromElement(button);
    $('#unpinPostButton').data('id', postId);
});

//we cannot attach the click on the document
$('#unpinPostButton').click((event) => {
    const postId = $(event.target).data('id');
    $.ajax({
        url: `/api/posts/${postId}`,
        type: 'PUT',
        data: {pinned: false},
        success: () => {
            location.reload();
        }
    });
});

$('#replyModal').on('hidden.bs.modal', () => {
    $('#originalPostContainer').html('');
});

$('#filePhoto').change(function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById('imagePreview');
            image.src = e.target.result;
            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 1 / 1,
                background: false,
            });
            
        };
        reader.readAsDataURL(this.files[0]);
    }
 });

 $('#coverPhoto').change(function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = (e) => {
            var image = document.getElementById('coverPreview');
            image.src = e.target.result;
            if (cropper !== undefined) {
                cropper.destroy();
            }

            cropper = new Cropper(image, {
                aspectRatio: 16 / 9,
                background: false,
            });
            
        };

        reader.readAsDataURL(this.files[0]);
    }
 });

 $('#imageUploadButton').click(() => {
     var canvas = cropper.getCroppedCanvas();

     if (canvas == null) {
         alert('Could not upload image. Make sure it is an image file.');
         return;
     }

     canvas.toBlob((blob) => {
         var formData = new FormData();
         formData.append('croppedImage', blob);

        $.ajax({
            data: formData,
            url: '/api/users/profilePicture',
            type: 'POST',
            processData: false,  //ask ajax not to convert the data to string
            contentType: false,  //ask ajax not to add the content type header
            success: (_data, _status, _xhr) => {
                location.reload();
            },
        })
     })
 });

  $('#coverPhotoUploadButton').click(() => {
     var canvas = cropper.getCroppedCanvas();

     if (canvas == null) {
         alert('Could not upload image. Make sure it is an image file.');
         return;
     }

     canvas.toBlob((blob) => {
         var formData = new FormData();
         formData.append('croppedImage', blob);

        $.ajax({
            data: formData,
            url: '/api/users/coverPhoto',
            type: 'POST',
            processData: false,  //ask ajax not to convert the data to string
            contentType: false,  //ask ajax not to add the content type header
            success: (_data, _status, _xhr) => {
                location.reload();
            },
        })
     })
 });

 $('#userSearchTextbox').keydown(event => {
    clearTimeout(timer);
    var textbox = $(event.target);
    var value = textbox.val();
   
    //trying to delete a user if the del key is pressed while there is no text
    if (value == "" && (event.which == 8 || event.keyCode == 8)) {
        selectedUsers.pop();
        updateSelectedUserHtml();
        $('.resultsContainer').html('');

        if (selectedUsers.length === 0) {
            $('#createChatButton').prop('disabled', true);
        }
        return;
    }

    timer = setTimeout(() => {
        value = textbox.val().trim();
        if (value.length === 0) {
            $('.resultsContainer').html('');
        }
        else {
            searchUsers(value);
        }
    }, 0);
});

$('#createChatButton').click(() => {
     var data = JSON.stringify(selectedUsers);

     $.post('/api/chats', {users: data}, chat => {
         if (!chat || !chat._id) {
             return alert("Invalid response from server");
         }
         
         window.location.href = `/messages/${chat._id}`;
     });
 });

$(document).on('click', '.likeButton', (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    if (!postId) {
        return;
    }

    //jquey does not provide API for put, so use $.ajax
    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: 'PUT',
        success: (postData) => {
            button.find('span').text(postData.likes.length || '');
            if (postData.likes.includes(userLoggedIn._id)) {
                button.addClass('active');
            }
            else {
                button.removeClass('active');
            }
        }
    })
});

$(document).on('click', '.retweetButton', (event) => {
    var button = $(event.target);
    var postId = getPostIdFromElement(button);
    if (!postId) {
        return;
    }

    //jquey does not provide API for put, so use $.ajax
    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: 'POST',
        success: (postData) => {
            button.find('span').text(postData.retweetUsers.length || '');
            if (postData.retweetUsers.includes(userLoggedIn._id)) {
                button.addClass('active');
            }
            else {
                button.removeClass('active');
            }
        }
    });
});

$(document).on('click', '.post', (event) => {
    var element = $(event.target);
    var postId = getPostIdFromElement(element);
    if (postId !== undefined && !element.is('button')) {   
        window.location.href = `/posts/${postId}`;
    }
});

$(document).on('click', '.followButton', (event) => {
    var button = $(event.target);
    const userId = button.data().user;
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: 'PUT',
        success: (data, status, xhr) => {
            if (xhr.status == 404) {
                return;
            }

            var delta = 1;
            if (data.following && data.following.includes(userId)) {
                button.addClass('following');
                button.text('Following');
            }
            else {
                button.removeClass('following');
                button.text('Follow')
                delta = -1;
            }

            const followersLabel = $('#followersValue');
            if (followersLabel && followersLabel.length > 0) {
                const followersText = +followersLabel.text();
                followersLabel.text(followersText + delta);
            }
        }
    });
});

function getPostIdFromElement(element) {
    var isRoot = element.hasClass('post');
    var rootElement = isRoot ? element : element.closest('.post');  //jQuery function to find the closest ancestor with the given parent
    var postId = rootElement.data().id;

    return postId;
}

function createPostHtml(postData, largeFont = false) {
    if (!postData) {
        console.error("post object is null");
    }

    var isRetweet = !!postData.retweetData;
    var retweetedBy = isRetweet ? postData.postedBy.userName : null;
    postData = isRetweet ? postData.retweetData : postData;

    var postedBy = postData.postedBy;
    if (!postedBy || postedBy._id === undefined) {
        return;
    }

    var displayName = postedBy.firstName + ' ' + postedBy.lastName;
    var timestamp = timeDifference(new Date(), new Date(postData.createdAt));

    var likeButtonActiveClass = postData.likes.includes(userLoggedIn._id) ? 'active' : '';
    var retweetButtonActiveClass = postData.retweetUsers.includes(userLoggedIn._id) ? 'active' : '';
    var largeFontClass = largeFont ? 'largeFont': '';

    var retweetText = "";
    if (isRetweet) {
        retweetText = `<span>
                            <i class='fas fa-retweet'></i>
                            Retweeted by <a href='/profile/${retweetedBy}'>@${retweetedBy}</a>
                        </span>`
    }

    var replyFlag = '';
    if (postData.replyTo && postData.replyTo._id) {
        var replyToUserName = postData.replyTo.postedBy.userName;
        replyFlag = `<div class='replyFlag'>
                        Replying to <a href='/profile/${replyToUserName}'>@${replyToUserName}</a>
                    </div>`;
    }

    var buttons = '';
    var pinnedPostText = '';
    var dataTarget = '#confirmPinModal';
    if (postData.postedBy._id === userLoggedIn._id) {
        var pinnedClass = "";
        if (postData.pinned == true) {
            pinnedClass = 'active';
            dataTarget = '#unpinModal';
            pinnedPostText = `
                            <i class='fas fa-thumbtack'></i>
                             <span>Pinned post</span>`;
        }

        buttons = `
                 <button class='pinButton ${pinnedClass}' data-id=${postData._id} data-toggle='modal' data-target='${dataTarget}'>
                    <i class='fas fa-thumbtack'></i>
                 </button>
                <button data-id=${postData._id} data-toggle='modal' data-target='#deletePostModal'>
                    <i class='fas fa-times'></i>
                 </button>`
    }

    return `<div class='post ${largeFontClass}' data-id='${postData._id}'>
                <div class='postActionContainer'>
                    ${retweetText} 
                </div>
                <div class='mainContentContainer'>
                    <div class='userImageContainer'>
                        <img src='${postedBy.profilePic}'>
                    </div>
                    <div class='postContentContainer'>
                        <div class='pinnedPostText'>${pinnedPostText}</div>
                        <div class='header'>
                            <a href='/profile/${postedBy.userName}' class='displayName'>${displayName}</a>
                            <span class='userName'>@${postedBy.userName}</span>
                            <span class='date'>${timestamp}</span>
                            ${buttons}
                        </div>
                        ${replyFlag}
                        <div class='postBody'>
                            <span>${postData.content}</span>
                        </div>
                        <div class='postFooter'>
                            <div class='postButtonContainer'>
                                <button data-toggle='modal' data-target='#replyModal'>
                                    <i class='far fa-comment'></i>
                                </button> 
                            </div>
                            <div class='postButtonContainer green'>
                                <button class='retweetButton ${retweetButtonActiveClass}'>
                                    <i class='fas fa-retweet'></i>
                                    <span>${postData.retweetUsers.length || ''}</span>
                                </button> 
                            </div>
                            <div class='postButtonContainer red'>
                                <button class='likeButton ${likeButtonActiveClass}'>
                                    <i class='far fa-heart'></i>
                                    <span>${postData.likes.length || ''}</span>
                                </button> 
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
}

function timeDifference(current, previous) {
    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (Math.round(elapsed / 1000) < 30) {
            return 'just now';
        }

        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return 'approximately ' + Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return 'approximately ' + Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function outputPosts(results, container) {
    container.html('');

    if (!Array.isArray(results)) {
        results = [results];
    }

    results.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    });

    if (results.length === 0) {
        container.append("<span class='noResults'>Nothing to show.</span>");
    }
}

function outputUsers(results, container) {
    container.html('');
    if (results) {
        results.forEach(result => {
            const html = createUserHtml(result, true);
            container.append(html);
        });
    }

    if (results.length == 0) {
        container.append("<span class='noResults'>No results found</span>");
    }
}

function createUserHtml(userData, showFollowButton) {
    const name = userData.firstName + " " + userData.lastName;
    const isFollowing = userLoggedIn.following && userLoggedIn.following.includes(userData._id);
    
    const text = isFollowing ? "Following" : "Follow"
    const buttonClass = isFollowing ? "followButton following" : "followButton"
    let followButton = "";

    if (showFollowButton && userLoggedIn._id != userData._id) {
        followButton = `<div class='followButtonContainer'>
                            <button class='${buttonClass}' data-user='${userData._id}'>
                                ${text}
                            </button>
                        </div>`;
    }

    return `<div class='user'>
                <div class='userImageContainer'>
                    <img src='${userData.profilePic}'>
                </div>
                <div class='userDetailsContainer'>
                    <div class='header'>
                        <a href='/profiles/${userData.userName}'>${name}</a>
                        <span class='userName'>@${userData.userName}</span>
                    </div>
                </div>

                ${followButton}
            </div>`;
}

function outputPostsWithReplies(results, container) {
    container.html('');

    if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
        var html = createPostHtml(results.replyTo);
        container.append(html);
    }

    var mainPostHtml = createPostHtml(results.postData, true);
    container.append(mainPostHtml);

    results.replies.forEach(result => {
        var html = createPostHtml(result);
        container.append(html);
    });
}

function searchUsers(searchTerm) {
    $.get('/api/users', {search: searchTerm}, results => {
        outputSelectableUsers(results, $('.resultsContainer'));
    });
}

function outputSelectableUsers(results, container) {
    container.html('');
    if (results) {
        results.forEach(result => {
            if (result._id == userLoggedIn._id || 
                selectedUsers.some(u => u._id == result._id)) 
            {
                return;
            }

            const html = createUserHtml(result, false);
            var element = $(html);
            element.click((event) => userSelected(result));

            container.append(element);
        });
    }

    if (results.length == 0) {
        container.append("<span class='noResults'>No results found</span>");
    }
}

function userSelected(user) {
    selectedUsers.push(user);
    updateSelectedUserHtml();
    $('#userSearchTextbox').val('').focus();
    $('.resultsContainer').html('');
    $('#createChatButton').prop('disabled', false);
}

function updateSelectedUserHtml() {
    let elements = [];

    selectedUsers.forEach((user => {
        let name = user.firstName + ' ' + user.lastName;
        let userElement = $(`<span class='selectedUser'>${name}</span>`);
        elements.push(userElement);
    }));

    $('.selectedUser').remove();
    $('#selectedUsers').prepend(elements);
}