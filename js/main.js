let userListItem = (item) => (
    `<li class="uk-width-1-1">
        <img class="uk-border-circle uk-width-1-4 uk-float-left" src="${item.profile_pic}" data-uk-image />
        <p class="uk-width-3-4 uk-text-lead uk-text-truncate uk-padding-small uk-padding-remove-vertical">${item.ig_handle}</p>
    </li>`
);

let userList = (list) => (
    `<ul id="MemberList" class="uk-list uk-list-divider uk-padding-remove-vertical">
        ${list.map(userListItem).join('')}
    </ul>`
);

let members = [],
    formInput = document.getElementById('MemberInput'),
    presetMembers = document.getElementById('PresetMember'),
    endpoint = `http://127.0.0.1:8001/api/i/profiles/`,
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json; charset=utf-8",
        'X-Requested-With': 'XMLHttpRequest'
    };

fetch(endpoint, {
        method: "GET",
        cache: "no-cache",
        credentials: "same-origin",
        headers: headers,
    })
    .then(response => response.json())
    .then(json => loadLists(json))
    .catch(error => console.log(error));

let loadLists = (json) => {
    let members = [...json.influencers],
        searchSuggest = ['input', function(e) {
            filterList(event.target.value, members);
        }, false];

    formInput.addEventListener(...searchSuggest);
    presetMembers.innerHTML = userList(members.slice(0, 3));
}

let filterList = (value, members) => {
    let listEl = document.getElementById('MemberList');
    listEl.innerHTML = '';

    for (let i = 0; i < members.length; i++) {
        if ((members[i].ig_handle.toLowerCase())
            .indexOf(value.toLowerCase()) > -1) {
            let node = () => (
                `<li class="member-link">
                    ${members[i].ig_handle}
                </li>`
            );
            if (listEl.childNodes.length < 5) {
                listEl.insertAdjacentHTML('beforeend', node());
            }
        }
        if (value.length < 2) {
            listEl.innerHTML = '';
            presetMembers.innerHTML = userList(members.slice(0, 3));
        }
    }
};
