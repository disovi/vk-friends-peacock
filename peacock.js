VK.Widgets.Auth("vk_auth", {
    width: "200px",
    onAuth: function(data) {
    }
});

var gl_root = {};
var gl_root_uid = 2183;
var gl_friend_nr = 0;
var gl_timeout = 300;
var gl_mutual_friends = [];

setTimeout( function() {
                peacock(gl_root_uid);
            },
            gl_timeout);

function peacock(root_uid) {
    console.log('peacock: ', root_uid);
    gl_root_uid = root_uid;
    setTimeout(function() {
                VK.Api.call('friends.get', {
                    uid: root_uid,
                    fields: 'uid, first_name, last_name, photo',
                    test_mode: 1
                }, function(r) {
                    if (r.error) {
                        console.log("friends.get error: " + r.error.error_msg);
                        return;
                    }
                    if (!r.response.length) {
                        console.log("Friends.get failed");
                        return;
                    }
                    console.log("Friends collected " + r.response.length);
                    gl_root.uid = root_uid;
                    gl_root.friends = r.response;
                    gl_root.links = [];
                    getMutualFriends(0, root_uid);
                });
            }, gl_timeout);
}

function getMutualFriends(friend_nr, root_uid) {
    console.log('Mutual for ' + root_uid + ' and ' + gl_root.friends[friend_nr].uid + ' ' + gl_root.friends[friend_nr].first_name + ' ' + gl_root.friends[friend_nr].last_name);
    var new_mutual_friend = {};
    new_mutual_friend = gl_root.friends[friend_nr];
    new_mutual_friend.friends = [];
    gl_mutual_friends.push(new_mutual_friend);
    setTimeout(function() {
        VK.Api.call('friends.getMutual', {
            target_uid: gl_root.friends[friend_nr].uid,
            source_uid: root_uid,
            test_mode: 1
        }, getMutualFriendsCallback);},
        gl_timeout);
}

function getMutualFriendsCallback(fr) {
    if (fr.error) {
        console.log("friends.getMutual error: " + fr.error.error_msg);
        return;
    }
    // ждем таймаут перед обращением
    setTimeout(function() {
        VK.Api.call('wall.get', {
                owner_id: gl_mutual_friends[gl_friend_nr].uid,
                test_mode: 1
            }, function(wall) {
                if (wall.error) {
                    console.log("wall.get error: " + wall.error.error_msg);
                    return;
                }
                if (!wall.response[0]) {
                    console.log("0 messages returned");
                    return;
                }
                fr.response.forEach(function(uid) {
                    var new_connection = {};
                    new_connection.uid = uid;
                    new_connection.weight = getWeight(uid, wall.response);
                    gl_mutual_friends[gl_friend_nr].friends.push(new_connection);
                    console.log("uid: " + new_connection.uid + " weight: " + new_connection.weight);
                });
                if (++gl_friend_nr < gl_root.friends.length - 1) {
                    getMutualFriends(gl_friend_nr, gl_root_uid);
                    return;
                }
                else {
                    // TODO: graph builder should be called here
                    console.log('finished');
                }
            });},
            gl_timeout);
}

function getWeight(sender_uid, wall) {
    var weight = 0;
    wall.forEach(function (msg) {
            if (msg.from_id == sender_uid)
                weight++;
        });
    return weight;
}
    
    