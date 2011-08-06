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
var gl_groups = 0;

setTimeout( function() {
                peacock(16051904,1);
            },
            gl_timeout);

function peacock(root_uid, depth) {
    console.log('peacock:', root_uid, 'depth:', depth);
    gl_depth = depth;
    var root = getCashedData(root_uid);
    if (root) {
        gl_root = root;
        gl_mutual_friends = root.friends;
        return;
    }
    setTimeout(function() {
        VK.Api.call('getProfiles', {
            uids: root_uid,
            fields: 'uid, first_name, last_name, photo',
            test_mode: 1
        }, function(profile_list) {
            if (profile_list.error) {
                console.log("getProfiles error:", r.error.error_msg);
                return;
            }
            gl_root = profile_list.response[0];
            VK.Api.call('friends.get', {
                uid: root_uid,
                fields: 'uid, first_name, last_name, photo',
                test_mode: 1
            }, function(r) {
                if (r.error) {
                    console.log("friends.get error:", r.error.error_msg);
                    return;
                }
                if (!r.response.length) {
                    console.log("Friends.get failed");
                    return;
                }
                console.log("Friends collected " + r.response.length);
                gl_root.friends = r.response;
                // removing ourself from friends
                for (var i = 0; i < gl_root.friends.length; i++) {
                    if (gl_root.friends[i].uid == gl_root.uid) {
                        gl_root.friends.splice(i, 1);
                        break;
                    }
                }
                getMutualFriends(0, root_uid);
            });
    });}, gl_timeout);
 }

function getMutualFriends(friend_nr, root_uid) {
    console.log('Mutual for ' + root_uid + ' and ' + gl_root.friends[friend_nr].uid + ' ' + gl_root.friends[friend_nr].first_name + ' ' + gl_root.friends[friend_nr].last_name);
    var new_mutual_friend = {};
    new_mutual_friend = gl_root.friends[friend_nr];
    new_mutual_friend.friends = [];
    new_mutual_friend.gr_id = 0;
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
    // removing ourself and himself from friends
    for (var i = 0; i < gl_curr_friends.length; i++) {
        if (gl_curr_friends[i] == gl_root.uid || gl_curr_friends[i] == gl_mutual_friends[gl_friend_nr].uid) {
            gl_curr_friends.splice(i, 1);
        } 
    }
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
    if (gl_curr_friends.length) {
        mutual_friends.forEach(function(uid) {
            var new_connection = {};
            new_connection.uid = uid;
            new_connection.weight = 0;
            for (i = 0; i < deep_wall.length; i++)
                new_connection.weight += getWeight(uid, deep_wall[i]);
            gl_mutual_friends[gl_friend_nr].friends.push(new_connection);
            console.log("uid: " + new_connection.uid + " weight: " + new_connection.weight);
        });
    }
    if (++gl_friend_nr < gl_root.friends.length) {
        gl_deep_wall = [];
        gl_curr_friends = [];
        getMutualFriends(gl_friend_nr, gl_root.uid);
        return;
    }
    else {
        setGroups(gl_mutual_friends);
        for (var i = 0; i <= gl_groups; i++) {
            console.log('group id:', i);
            gl_mutual_friends.forEach(function(friend) {
                if(friend.gr_id == i)
                    console.log(friend.uid);
            });
        }
        cashData(gl_root,gl_mutual_friends);
        console.log('finished');
        // TODO: graph builder should be called here
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

function setGroups(mutual_friends) {
    console.log('Setting user groups:');
    for (var friend_id = 0; friend_id < mutual_friends.length; friend_id++) {
        var group = false;
        for (var i = 0; i < mutual_friends[friend_id].friends.length - 1; i++) {
            if (mutual_friends[friend_id].friends[i].uid <= mutual_friends[friend_id].uid)
                continue;
            curr_friend = getFriendById(mutual_friends[friend_id].friends[i].uid);
            for (var j = i + 1; j < mutual_friends[friend_id].friends.length; j++) {
                for (var k = 0; k < curr_friend.friends.length; k++) {
                    if (curr_friend.friends[k].uid == mutual_friends[friend_id].friends[j].uid) {
                        group = true;
                        break;
                    }
                }
                if (group) {
                    if (!mutual_friends[friend_id].gr_id) {
                        mutual_friends[friend_id].gr_id = ++gl_groups;
                    }
                    setUserGroup(mutual_friends[friend_id].gr_id, mutual_friends[friend_id].friends[i].uid);
                    setUserGroup(mutual_friends[friend_id].gr_id, mutual_friends[friend_id].friends[j].uid);
                    group = false;
                }
            }
        }
    }
}

function setUserGroup(gr_id, uid) {
    for (var friend_id = 0; friend_id < gl_mutual_friends.length; friend_id++) {
        if (gl_mutual_friends[friend_id].uid == uid) {
            gl_mutual_friends[friend_id].gr_id = gr_id;
            return;
        }
    }
}

function getFriendById(uid) {
    for (friend_id = 0; friend_id < gl_mutual_friends.length; friend_id++) {
        if (gl_mutual_friends[friend_id].uid == uid) {
            return gl_mutual_friends[friend_id];
        }
    }
}

function cashData(root, mutual_friends) {
    console.log('cashing');
    localStorage.setItem(root.uid, JSON.stringify(root));
}

function getCashedData(uid) {
    node = JSON.parse(localStorage.getItem(uid));
    if (!node)
        console.log('no cashed data found');
    else 
        console.log('cashed data loaded succesfully');
    return node;
}
    
    