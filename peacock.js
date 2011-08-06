VK.Widgets.Auth("vk_auth", {
    width: "200px",
    onAuth: function(data) {
    }
});

var gl_root = {};
var gl_friend_nr = 0;
var gl_timeout = 300;
var gl_depth = 1;
var gl_mutual_friends = [];
var gl_curr_friends = [];
var gl_deep_wall = [];

setTimeout( function() {
                peacock(2183,1);
            },
            gl_timeout);

function peacock(root_uid, depth) {
    gl_depth = depth;
    console.log('peacock:', root_uid, 'depth:', depth);
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
    gl_curr_friends = fr.response;
    setTimeout(function() {
        VK.Api.call('wall.get', {
            owner_id: gl_mutual_friends[gl_friend_nr].uid,
            count: 100,
            test_mode: 1
        }, getWallCallback);
    }, gl_timeout);
}

function getWallCallback(wall) {
    if (wall.error) {
        console.log("wall.get error: " + wall.error.error_msg);
        return;
    }
    gl_deep_wall.push(wall.response);
    if (wall.response[0] && gl_deep_wall.length < gl_depth) {
        setTimeout(function() {
            VK.Api.call('wall.get', {
                offset: gl_deep_wall.length * 100,
                count: 100,
                test_mode: 1
            }, getWallCallback);
        }, gl_timeout);
    }
    else
        getWeights(gl_curr_friends, gl_deep_wall);
}

function getWeights(mutual_friends, deep_wall) {
    mutual_friends.forEach(function(uid) {
        var new_connection = {};
        new_connection.uid = uid;
        new_connection.weight = 0;
        for (i = 0; i < deep_wall.length; i++)
            new_connection.weight += getWeight(uid, deep_wall[i]);
        gl_mutual_friends[gl_friend_nr].friends.push(new_connection);
        console.log("uid: " + new_connection.uid + " weight: " + new_connection.weight);
    });
    if (++gl_friend_nr < gl_root.friends.length - 1) {
        gl_deep_wall = [];
        getMutualFriends(gl_friend_nr, gl_root.uid);
        return;
    }
    else {
        // TODO: graph builder should be called here
        console.log('finished');
    }
}

function getWeight(sender_uid, wall) {
    var weight = 0;
    wall.forEach(function (msg) {
            if (msg.from_id == sender_uid)
                weight++;
        });
    return weight;
}
    
    