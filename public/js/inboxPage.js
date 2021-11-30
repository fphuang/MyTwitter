$(document).ready(() => {
    $.get('/api/chats', (data, status, xhr) => {
        if (xhr.status === 400) {
            console.log('Could not get chat list.');
        }
        else {
            outputChatList(data, $('.resultsContainer'));
        }
    })
});

function outputChatList(chatList, container) {
    chatList.forEach(chat => {
        var html = createChatHtml(chat);
        container.append(html);
    });

    if (chatList.length === 0) {
        container.append(`<span class='noResults>Nothing to show.</span>`);
    }
}

function createChatHtml(chatData) {
    let chatName = getChatName(chatData); 
    let image = getChatImageElements(chatData);  
    let latestMessage = 'this is the latest message';  //TODO

    return `<a href='/messages/${chatData._id}' class='resultListItem'>
                ${image}
                <div class='resultsDetailContainer ellipsis'>
                    <span class='heading ellipsis'>${chatName}</span>
                    <span class='subText'>${latestMessage}</span>
                </div>
            </a>`;
}

function getChatName(chatData) {
    let chatName = chatData.chatName;
    if (!chatName) {
        var otherChatUsers = getOtherChatUser(chatData.users);
        var namesArr = otherChatUsers.map(user => `${user.firstName} ${user.lastName}`);
        chatName = namesArr.join(', ');
    }

    return chatName;
}

function getOtherChatUser(users) {
    if (users.length === 1) {
        return users;
    }

    return users.filter(user => user._id != userLoggedIn._id);
}

function getChatImageElements(chatData) {
    let otherChatUsers = getOtherChatUser(chatData.users);

    var groupChatClass = '';
    var chatImage = getUserChatImageElement(otherChatUsers[0]);

    if (otherChatUsers.length > 1) {
        groupChatClass = 'groupChatImage';
        chatImage += getUserChatImageElement(otherChatUsers[1]);
    }

    return `<div class='resultsImageContainer ${groupChatClass}'>${chatImage}</div>`
}

function getUserChatImageElement(user) {
    if (!user || !user.profilePic) {
        return alert('User passed into function is invalid');
    }

    return `<img src='${user.profilePic}' alt='User profile pic'>`
}